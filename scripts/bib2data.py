#!/usr/bin/env python3
"""Convert _bibliography/cv.bib (Zotero / Better BibLaTeX export used for the CV)
into _data/bib.yml, which the site's pages render.

Run automatically by the GitHub Action before every build. Run locally with:
    python3 scripts/bib2data.py

What it does for each entry:
  * places it in the CV section named by its `keywords` (cv-pub-journal, cv-conf-papers, ...)
    using _data/sections.yml; entries without a known cv-* keyword are skipped
  * formats an APA-style citation that matches the CV (Harty bolded, sentence-case titles)
  * assigns research pillars (systems / fathers / history):
      - from Zotero tags `pillar-systems`, `pillar-fathers`, `pillar-history` if present
      - otherwise from _data/pillar_overrides.yml if listed there
      - otherwise from keyword rules in _data/pillars.yml
  * finds files dropped in assets/pubs/<citekey>/  (paper.pdf, cover.jpg, slides.pdf,
    poster.pdf, handout.pdf, recording.mp4) so buttons appear automatically
  * links Google Scholar (exact record from _data/scholar.yml, else a title search)
    and Dimensions (needs a DOI)
Standard library only.
"""
import os, re, json, html, unicodedata, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIB = os.path.join(ROOT, '_bibliography', 'cv.bib')
OUT = os.path.join(ROOT, '_data', 'bib.yml')


# ---------------------------------------------------------------- tiny YAML reader
def load_yaml(path):
    """Minimal reader for the simple YAML files in _data (maps of lists / scalars)."""
    import ast
    try:
        import yaml  # available on GitHub runners via pip; optional
        with open(path, encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    except ImportError:
        pass
    data, stack = {}, []
    cur = data
    with open(path, encoding='utf-8') as f:
        lines = [l.rstrip('\n') for l in f if l.strip() and not l.lstrip().startswith('#')]
    # supports: "key: value", "key:" + "  - item" lists, one level of nesting
    key = None
    for l in lines:
        if not l.startswith(' '):
            k, _, v = l.partition(':')
            key = k.strip().strip('"\'')
            v = v.strip()
            data[key] = [] if v == '' else v.strip('"\'')
        else:
            s = l.strip()
            if s.startswith('- '):
                if not isinstance(data[key], list):
                    data[key] = []
                data[key].append(s[2:].strip().strip('"\''))
            else:
                k, _, v = s.partition(':')
                if not isinstance(data[key], dict):
                    data[key] = {}
                data[key][k.strip().strip('"\'')] = v.strip().strip('"\'')
    return data


# ---------------------------------------------------------------- bib parsing
def parse_bib(text):
    entries, i, n = [], 0, len(text)
    while True:
        m = re.compile(r'@(\w+)\s*\{\s*([^,\s]+)\s*,').search(text, i)
        if not m:
            break
        typ, key = m.group(1).lower(), m.group(2)
        j, fields = m.end(), {}
        while j < n:
            while j < n and text[j] in ' \t\r\n,':
                j += 1
            if j < n and text[j] == '}':
                j += 1
                break
            fm = re.compile(r'([A-Za-z_\-]+)\s*=\s*').match(text, j)
            if not fm:
                j += 1
                continue
            name, j = fm.group(1).lower(), fm.end()
            if text[j] == '{':
                depth, k = 0, j
                while k < n:
                    if text[k] == '{' and text[k - 1] != '\\':
                        depth += 1
                    elif text[k] == '}' and text[k - 1] != '\\':
                        depth -= 1
                        if depth == 0:
                            break
                    k += 1
                val, j = text[j + 1:k], k + 1
            elif text[j] == '"':
                k = text.index('"', j + 1)
                val, j = text[j + 1:k], k + 1
            else:
                k = j
                while k < n and text[k] not in ',}\n':
                    k += 1
                val, j = text[j:k].strip(), k
            fields[name] = val
        entries.append({'type': typ, 'key': key, 'f': fields})
        i = j
    return entries


LATEX = [(r'\&', '&'), (r'\%', '%'), (r'\_', '_'), (r'\#', '#'), ('---', '—'), ('--', '–'),
         (r"\'e", 'é'), (r"\'a", 'á'), (r"\'i", 'í'), (r"\'o", 'ó'), (r"\'u", 'ú'), (r'\~n', 'ñ'),
         (r'\"o', 'ö'), (r'\"u', 'ü'), (r'\textendash', '–'), (r'\textemdash', '—'), ('~', ' ')]


def delatex(s):
    s = re.sub(r'\\hartyjsdot\{', '{', s)
    s = re.sub(r"\{\\'\{?(\w)\}?\}", lambda m: unicodedata.normalize('NFC', m.group(1) + '\u0301'), s)
    for a, b in LATEX:
        s = s.replace(a, b)
    s = re.sub(r'\\(?:emph|textit)\{([^{}]*)\}', r'\1', s)
    s = re.sub(r'\\[a-zA-Z]+\s*', '', s)
    s = s.replace('{', '').replace('}', '')
    return re.sub(r'\s+', ' ', s).strip()


def sentence_case(raw):
    """Sentence-case a BibLaTeX title: keep {protected} words, capitalise first word
    and the first word after ':', '?', '!' , ' – ' or ' — '."""
    raw = delatex(raw.replace('{{', '\x01').replace('}}', '\x02'))
    out, protected, cap_next = [], 0, True
    tokens = re.findall(r'\x01|\x02|\{|\}|[^\s\x01\x02{}]+|\s+', raw)
    for t in tokens:
        if t in ('\x01', '{'):
            protected += 1
            continue
        if t in ('\x02', '}'):
            protected = max(0, protected - 1)
            continue
        if t.isspace():
            out.append(' ')
            continue
        if protected:
            out.append(t)
        elif cap_next:
            out.append(t[:1].upper() + t[1:] if not t[:1].isupper() else t)
        else:
            # lowercase normal words; leave words with inner capitals/digits (e.g. CalYOUTH, LENA)
            out.append(re.sub(r'[A-Za-z]+', lambda m: m.group(0).lower() if m.group(0)[1:] == m.group(0)[1:].lower() else m.group(0), t))
        if t in ('–', '—', '-'):
            cap_next = True
        elif t:
            cap_next = t.endswith((':', '?', '!', '.')) and not re.fullmatch(r'[A-Z]\.', t)
    s = ''.join(out)
    return re.sub(r'\s+', ' ', s).strip()


def names(field):
    if not field:
        return []
    out = []
    for raw in re.split(r'\s+and\s+', field):
        me = 'hartyjsdot' in raw
        n = delatex(raw).strip('{} ')
        if ',' in n:
            last, first = [p.strip() for p in n.split(',', 1)]
        else:
            parts = n.split()
            last, first = (parts[-1], ' '.join(parts[:-1])) if len(parts) > 1 else (n, '')
        inits = ' '.join(
            '-'.join(p[0] + '.' for p in w.split('-') if p) for w in re.split(r'\s+', first.replace('.', '. ')) if w and w[0].isalpha())
        out.append({'last': last, 'initials': inits, 'me': me})
    return out


def fmt_names(ns, editors=False):
    def one(n, ed=False):
        s = (f"{n['initials']} {n['last']}" if ed else f"{n['last']}, {n['initials']}").strip().rstrip(',')
        return f'<strong>{html.escape(s)}</strong>' if n['me'] else html.escape(s)
    ns = [one(n, editors) for n in ns]
    if not ns:
        return ''
    if len(ns) == 1:
        return ns[0]
    if len(ns) == 2:
        return f'{ns[0]}, &amp; {ns[1]}' if not editors else f'{ns[0]} &amp; {ns[1]}'
    return ', '.join(ns[:-1]) + ', &amp; ' + ns[-1]


MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split()


def doi_of(f):
    d = f.get('doi', '')
    if not d:
        m = re.search(r'doi\.org/(10\.[^\s?#]+)', f.get('url', ''))
        d = m.group(1) if m else ''
    return d.strip()


def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def main():
    sections = load_yaml(os.path.join(ROOT, '_data', 'sections.yml'))
    kw2sec = {}
    for page, secs in sections.items():
        for s in secs:
            kw2sec[s['keyword']] = dict(page=page, heading=s['heading'], hide=s.get('hide', False))
    pillars_cfg = load_yaml(os.path.join(ROOT, '_data', 'pillars.yml'))
    overrides = load_yaml(os.path.join(ROOT, '_data', 'pillar_overrides.yml')) if os.path.exists(
        os.path.join(ROOT, '_data', 'pillar_overrides.yml')) else {}
    scholar = load_yaml(os.path.join(ROOT, '_data', 'scholar.yml')) if os.path.exists(
        os.path.join(ROOT, '_data', 'scholar.yml')) else {}
    scholar_user = 'uXKeZIMAAAAJ'

    text = open(BIB, encoding='utf-8').read()
    out = []
    for e in parse_bib(text):
        f, key = e['f'], e['key']
        kws = [k.strip() for k in f.get('keywords', '').split(',') if k.strip()]
        cvk = next((k for k in kws if k in kw2sec), None)
        if not cvk or kw2sec[cvk]['hide']:
            continue
        sec = kw2sec[cvk]
        date = f.get('date', '') or f.get('year', '')
        year = date[:4]
        mo = day = ''
        if len(date) >= 7:
            mo = MONTHS[int(date[5:7]) - 1]
        if len(date) >= 10:
            day = str(int(date[8:10]))
        title = sentence_case(f.get('title', ''))
        auth = names(f.get('author', ''))
        role = delatex(f.get('type', ''))
        venue = delatex(f.get('venue', ''))
        jt = delatex(f.get('journaltitle', '') or f.get('journal', ''))
        award = ''
        m = re.search(r'\s*\[([^\]]+)\]\s*$', jt)
        if m:
            award, jt = m.group(1), jt[:m.start()]
        vol, num, pages = delatex(f.get('volume', '')), delatex(f.get('number', '') or f.get('issue', '')), delatex(f.get('pages', ''))
        inst = delatex(f.get('institution', '') or f.get('publisher', ''))
        A = fmt_names(auth)
        Ad = (A + '.') if A and not re.sub(r'<[^>]+>', '', A).endswith('.') else A
        t = html.escape(title)
        endp = '' if t.endswith(('?', '!', '.')) else '.'
        T = t + endp
        # ---- citation formatted like the CV
        if e['type'] == 'article':
            parts = [Ad, T]
            jv = f'<em>{html.escape(jt)}</em>' if jt else ''
            if vol and vol.isdigit():
                jv += f', <em>{html.escape(vol)}</em>' + (f'({html.escape(num)})' if num else '')
            elif vol:
                jv += f', {html.escape(vol)}'
            if pages:
                jv += f', {html.escape(pages)}'
            parts.append(jv + '.' if jv else '')
            cit = ' '.join(p for p in parts if p)
        elif e['type'] in ('incollection', 'inbook'):
            eds = names(f.get('editor', ''))
            bt = sentence_case(f.get('booktitle', ''))
            ed = f"In {fmt_names(eds, editors=True)} ({'Eds.' if len(eds) > 1 else 'Ed.'}), " if eds else 'In '
            pp = f' (pp. {html.escape(pages)})' if pages else ''
            cit = f'{Ad} {T} {ed}<em>{html.escape(bt)}</em>{pp}.' + (f' {html.escape(inst)}.' if inst else '')
        elif e['type'] == 'report':
            r = f' ({html.escape(role)})' if role and role.lower() not in ('report',) else ''
            cit = f'{Ad} {t}{r}.' + (f' {html.escape(inst)}.' if inst else '')
        elif e['type'] in ('book',):
            cit = f'{Ad} <em>{t}</em>.' + (f' {html.escape(inst)}.' if inst else '')
        else:  # unpublished: talks, posters, panels
            who = f'{Ad} ' if A else ''
            r = f' ({html.escape(role)})' if role else ''
            cit = f'{who}<em>{t}</em>{r}.' + (f' {html.escape(venue)}.' if venue else '')
        cit = re.sub(r'\.(</strong>)?\.', r'.\1', cit)
        if award:
            cit += f' <span class="award">{html.escape(award)}</span>'
        doi = doi_of(f)
        url = f.get('url', '') or (f'https://doi.org/{doi}' if doi else '')
        # ---- pillars
        pil = [k[len('pillar-'):] for k in kws if k.startswith('pillar-')]
        if not pil and key in overrides:
            pil = overrides[key] if isinstance(overrides[key], list) else [overrides[key]]
        if not pil:
            hay = ' '.join([title, delatex(f.get('booktitle', '')) if e['type'] != 'incollection' else '']).lower()
            for p in pillars_cfg.get('order', ['fathers', 'systems', 'history']):
                if any(re.search(r'\b' + w, hay) for w in pillars_cfg.get(p, [])):
                    pil.append(p)
        # ---- files dropped into assets/pubs/<key>/
        folder = os.path.join(ROOT, 'assets', 'pubs', key)
        files = {}
        for name in ('paper.pdf', 'cover.jpg', 'cover.png', 'slides.pdf', 'poster.pdf', 'handout.pdf', 'recording.mp4'):
            if os.path.exists(os.path.join(folder, name)):
                files[name.split('.')[0]] = f'/assets/pubs/{key}/{name}'
        # ---- scholar
        sid = scholar.get(key, '') if isinstance(scholar, dict) else ''
        if sid:
            gs = f'https://scholar.google.com/citations?view_op=view_citation&hl=en&user={scholar_user}&citation_for_view={scholar_user}:{sid}'
        else:
            gs = 'https://scholar.google.com/scholar?q=' + urllib.parse.quote(f'"{title}"')
        abstract = delatex(f.get('abstract', ''))
        # ---- BibTeX for the Cite button (public copy: no local file paths)
        m = re.search(r'@\w+\s*\{\s*' + re.escape(key) + r'\s*,.*?\n\}', text, re.S)
        bib = m.group(0) if m else ''
        bib = re.sub(r'^\s*(file|abstract|keywords|langid|urldate)\s*=.*?\},?\s*$\n?', '', bib, flags=re.M | re.S)
        bib = bib.replace('\\hartyjsdot', '').replace('{{', '{').replace('}}', '}')
        out.append(dict(
            key=key, page=sec['page'], section=sec['heading'], type=e['type'],
            year=year, month=mo, day=day, sortdate=date or '0000',
            first=auth[0]['last'] if auth else '', authorsort=' '.join(a['last'] for a in auth).lower(), title=title, citation=cit,
            text=re.sub(r'<[^>]+>', '', html.unescape(cit)),
            url=url, doi=doi, scholar=gs, pillars=pil, files=files,
            abstract=abstract, bibtex=bib.strip(), me_first=bool(auth and auth[0]['me'])))
    # CV order: newest first, then first author, then title
    out.sort(key=lambda r: (r['year'] or '0000', ), reverse=True)
    out.sort(key=lambda r: (-(int(r['year']) if r['year'].isdigit() else 9999), r.get('authorsort', ''), r['title'].lower()))
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('# GENERATED by scripts/bib2data.py from _bibliography/cv.bib. Do not edit by hand.\n')
        json.dump(out, fh, ensure_ascii=False, indent=1)  # JSON is valid YAML
    print(f'bib2data: wrote {len(out)} entries to {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    main()
