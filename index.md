---
layout: default
title: About
---
# Justin S. Harty, PhD, LCSW

Dr. Justin S. Harty is an Assistant Professor in the School of Social Work and Director of the Center for Child Well-Being at Arizona State University, specializing in child welfare, fatherhood, and social work history. He holds a Ph.D. from the University of Chicago's Crown Family School of Social Work, Policy, and Practice, an MSW with a focus on children and families from the University of Illinois at Chicago, and bachelor's degrees in sociology and philosophy from the University of Illinois at Urbana-Champaign. Dr. Harty is a Licensed Clinical Social Worker whose research and practice address critical issues faced by young fathers transitioning out of foster care, father involvement within child welfare systems, and the historical development of father-focused social services.

Dr. Harty's research interests include the outcomes and preparedness of young fathers aging out of the foster care system, father engagement in child welfare services, and father-related social services in the history of the social work profession. His current research examines ways to better serve fathers in home visiting, child welfare and foster care settings. His dissertation focused on the experiences and needs of young Black fathers in foster care as they leave state care and transition to independent adulthood and early fatherhood.

Dr. Harty is dedicated to social justice, explicitly working to dismantle systemic racism and colonialism within social work. Grounded in Black social work history, his scholarship confronts white supremacy by leveraging African traditions of self-help and mutual aid, empowering both practitioners and marginalized communities to resist oppression. He serves on the leadership team of the Social Welfare History Group, contributing to comprehensive bibliographies on social work responses to significant societal issues, including pandemics and police violence.

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
