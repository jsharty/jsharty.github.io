---
layout: default
title: About
---
# Justin S. Harty, PhD, LCSW

Dr. Justin S. Harty is an Assistant Professor in the School of Social Work and Director of the Center for Child Well-Being at Arizona State University, specializing in child welfare, fatherhood, and social work history. He holds a Ph.D. from the University of Chicago's Crown Family School of Social Work, Policy, and Practice, an MSW with a focus on children and families from the University of Illinois at Chicago, and bachelor's degrees in sociology and philosophy from the University of Illinois at Urbana-Champaign. Dr. Harty is a Licensed Clinical Social Worker whose research and practice address critical issues faced by young fathers transitioning out of foster care, father involvement within child welfare systems, and the historical development of father-focused social services.

Dr. Harty's research interests include the outcomes and preparedness of young fathers aging out of the foster care system, father engagement in child welfare services, and father-related social services in the history of the social work profession. His current research examines ways to better serve fathers in home visiting, child welfare and foster care settings. His dissertation focused on the experiences and needs of young Black fathers in foster care as they leave state care and transition to independent adulthood and early fatherhood.

Dr. Harty is dedicated to social justice, explicitly working to dismantle systemic racism and colonialism within social work. Grounded in Black social work history, his scholarship confronts white supremacy by leveraging African traditions of self-help and mutual aid, empowering both practitioners and marginalized communities to resist oppression. He serves on the leadership team of the Social Welfare History Group, contributing to comprehensive bibliographies on social work responses to significant societal issues, including pandemics and police violence.

## Featured research

<div class="featured">
{%- for f in site.data.featured -%}
{%- assign it = nil -%}
{%- for e in site.data.bib -%}{%- if e.key == f -%}{%- assign it = e -%}{%- break -%}{%- endif -%}{%- endfor -%}
{%- unless it -%}{%- for e in site.data.bib -%}{%- if e.title contains f -%}{%- assign it = e -%}{%- break -%}{%- endif -%}{%- endfor -%}{%- endunless -%}
{%- if it -%}
<article class="feature">
  {%- if it.files.cover -%}<img class="feature-cover" src="{{ it.files.cover | relative_url }}" alt="Cover of {{ it.venue | escape }}" loading="lazy" width="600" height="800">{%- endif -%}
  <div class="feature-body">
    <h3 class="feature-title">{% if it.url != '' %}<a href="{{ it.url }}">{{ it.title }}</a>{% else %}{{ it.title }}{% endif %}</h3>
    <p class="feature-meta">{{ it.venue }}, {{ it.year }}</p>
    {%- if it.pillars.size > 0 -%}<p class="tags">{% for p in it.pillars %}<a class="tag tag-{{ p }}" href="{{ '/search/' | relative_url }}?pillar={{ p }}">{{ site.data.pillars.labels[p] }}</a>{% endfor %}</p>{%- endif -%}
    <div class="btns">
      {%- if it.url != '' -%}<a class="btn btn-project" href="{{ it.url }}" aria-label="Journal: {{ it.title | escape }}"><i class="fa-solid fa-book-open" aria-hidden="true"></i> Journal</a>{%- endif -%}
      {%- if it.files.paper -%}<a class="btn btn-pdf" href="{{ it.files.paper | relative_url }}" aria-label="PDF: {{ it.title | escape }}"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF</a>{%- endif -%}
      <a class="btn btn-other" href="{{ '/publications/' | relative_url }}#{{ it.key }}" aria-label="Full citation: {{ it.title | escape }}"><i class="fa-solid fa-quote-right" aria-hidden="true"></i> Citation</a>
    </div>
  </div>
</article>
{%- endif -%}
{%- endfor -%}
</div>

## Recent publications

{% assign recent_pubs = site.data.bib | where: "page", "publications" | sort: "sortdate" | reverse -%}
{% include home_recent.html items=recent_pubs n=site.data.home.recent_publications %}
<p class="more"><a href="{{ '/publications/' | relative_url }}">All publications <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></p>

## Recent talks and conference events

{% assign talks = site.data.bib | where_exp: "e", "e.page == 'conferences' or e.page == 'presentations'" | sort: "sortdate" | reverse -%}
{% include home_recent.html items=talks n=site.data.home.recent_talks talk=true %}
<p class="more"><a href="{{ '/conferences/' | relative_url }}">All conference presentations <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a> &nbsp; <a href="{{ '/presentations/' | relative_url }}">All invited talks <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></p>

## Research pillars

<div class="pillar-cards">
{%- for p in site.data.pillars.order -%}
{%- assign n = 0 -%}
{%- for it in site.data.bib -%}{%- if it.pillars contains p -%}{%- assign n = n | plus: 1 -%}{%- endif -%}{%- endfor -%}
<a class="pillar-card pillar-{{ p }}" href="{{ '/search/' | relative_url }}?pillar={{ p }}">
  <span class="pillar-name">{{ site.data.pillars.labels[p] }}</span>
  <span class="pillar-blurb">{{ site.data.pillars.blurbs[p] }}</span>
  <span class="pillar-n">{{ n }} publications, presentations, and talks <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
</a>
{%- endfor -%}
</div>

## Positions
{% include cv_sections.html key="positions" level=3 %}

## Education
{% include cv_sections.html key="education" level=3 %}

## Scholarship, teaching, and practice expertise
{% include cv_sections.html key="scholarship-teaching-and-practice-expertise" level=3 %}

## Professional license
{% include cv_sections.html key="professional-license" level=3 %}

## Mailing address
{% include cv_sections.html key="mailing-address" level=3 %}
