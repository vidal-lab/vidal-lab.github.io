#!/usr/bin/env python3
"""
Build HTML pages from Markdown content files.

Usage:
    pip install pyyaml markdown
    python3 build.py

Edit the .md files in content/, then run this script to regenerate the HTML.

Note: research.html is NOT managed by this script — it is driven dynamically
by assets/js/publications.js + assets/data/publications.json.
To update publications, edit vidal.bib then run:
    python3 scripts/parse_bib.py
"""

import html
import os
import re
import sys

try:
    import yaml
except ImportError:
    print("Error: PyYAML not found. Run: pip install pyyaml markdown")
    sys.exit(1)

try:
    import markdown as md_lib
except ImportError:
    print("Error: markdown not found. Run: pip install pyyaml markdown")
    sys.exit(1)

CONTENT_DIR = "content"


# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------

def parse_content_file(path):
    """Return (front_matter_dict, body_markdown_string)."""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    if not text.startswith("---"):
        return {}, text
    end = text.index("---", 3)
    data = yaml.safe_load(text[3:end])
    body = text[end + 3:].strip()
    return data, body


def md(text):
    """Convert Markdown block content to HTML."""
    return md_lib.markdown(text, extensions=["extra"])


def inline_md(text):
    """Convert inline Markdown to HTML (strips wrapping <p> tags)."""
    result = md_lib.markdown(str(text))
    return re.sub(r"^<p>(.*?)</p>\s*$", r"\1", result, flags=re.DOTALL)


def e(text):
    """HTML-escape a plain-text string."""
    return html.escape(str(text))


def is_external(url):
    return url.startswith("http://") or url.startswith("https://")


def parse_body_sections(body):
    """Parse Markdown body into sections keyed by ## heading text."""
    sections = {}
    if not body:
        return sections
    parts = re.split(r"^## (.+)$", body, flags=re.MULTILINE)
    i = 1
    while i < len(parts) - 1:
        heading = parts[i].strip()
        content = parts[i + 1].strip()
        sections[heading] = md(content)
        i += 2
    return sections


# ---------------------------------------------------------------------------
# Shared page components
# ---------------------------------------------------------------------------

def render_head(title, css="assets/css/style.css"):
    return (
        "<!DOCTYPE html>\n"
        '<html lang="en">\n'
        "<head>\n"
        '  <meta charset="UTF-8">\n'
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        f"  <title>{e(title)}</title>\n"
        '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">\n'
        f'  <link rel="stylesheet" href="{css}">\n'
        "</head>\n"
        "<body>\n"
    )


def render_navbar(active):
    pages = [
        ("index.html",    "Home",     "index"),
        ("people.html",   "People",   "people"),
        ("research.html", "Research", "research"),
        ("teaching.html", "Teaching", "teaching"),
        ("talks.html",    "Talks",    "talks"),
    ]
    items = "\n".join(
        '      <li><a href="{href}"{cls}>{label}</a></li>'.format(
            href=href,
            cls=' class="active"' if key == active else "",
            label=label,
        )
        for href, label, key in pages
    )
    return (
        '<nav class="navbar">\n'
        '  <div class="container">\n'
        '    <a href="index.html" class="navbar-brand">Vidal Lab <span>Vision, Dynamics &amp; Learning</span></a>\n'
        '    <button class="nav-toggle" aria-label="Toggle navigation">&#9776;</button>\n'
        '    <ul class="nav-links">\n'
        f"{items}\n"
        "    </ul>\n"
        "  </div>\n"
        "</nav>\n"
    )


FOOTER = """\
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <h4>Vidal Lab</h4>
        <p>Vision, Dynamics &amp; Learning Lab<br>
        University of Pennsylvania<br>
        Department of Electrical and Systems Engineering<br>
        Philadelphia, PA</p>
      </div>
      <div>
        <h4>Links</h4>
        <ul>
          <li><a href="people.html">People</a></li>
          <li><a href="research.html">Research</a></li>
          <li><a href="teaching.html">Teaching</a></li>
          <li><a href="talks.html">Talks</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <p>Prof. Ren\u00e9 Vidal<br>
        <a href="mailto:vidalr@seas.upenn.edu">vidalr@seas.upenn.edu</a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2025 Vidal Lab, University of Pennsylvania. All rights reserved.</p>
    </div>
  </div>
</footer>
"""

PAGE_END = '<script src="assets/js/main.js"></script>\n</body>\n</html>\n'


# ---------------------------------------------------------------------------
# index.html
# ---------------------------------------------------------------------------

def build_index(data, _body):
    photos = data.get("carousel_photos", [])
    slides = "\n".join(
        f'        <img src="{p}" alt="Vidal Lab Group Photo">' for p in photos
    )
    dots = "\n".join(
        '        <button{cls} aria-label="Slide {n}"></button>'.format(
            cls=' class="active"' if i == 0 else "",
            n=i + 1,
        )
        for i, _ in enumerate(photos)
    )

    def render_news_item(n):
        return (
            "      <li>\n"
            f'        <span class="date">{e(n["date"])}</span>\n'
            f"        <span>{inline_md(n['text'])}</span>\n"
            "      </li>\n"
        )

    news_html = "".join(render_news_item(n) for n in data.get("news", []))

    def render_highlight(h):
        links = "".join(
            f'          <a href="{lk["url"]}" target="_blank">{e(lk["text"])}</a>\n'
            for lk in h.get("links", [])
        )
        thumbnail = h.get("thumbnail", "")
        thumb_html = ""
        if thumbnail:
            thumb_html = (
                '        <div class="highlight-thumb">\n'
                f'          <img src="{thumbnail}" alt="{e(h["title"])}">\n'
                '        </div>\n'
            )
        return (
            '      <div class="highlight-card">\n'
            f'{thumb_html}'
            '        <div class="highlight-body">\n'
            f'          <div class="venue">{e(h["venue"])}</div>\n'
            f'          <h3>{e(h["title"])}</h3>\n'
            f'          <p class="authors">{e(h["authors"])}</p>\n'
            '          <div class="links">\n'
            f"{links}"
            "          </div>\n"
            "        </div>\n"
            "      </div>\n"
        )

    highlights_html = "\n".join(render_highlight(h) for h in data.get("highlights", []))

    return (
        render_head(data["title"])
        + "\n"
        + render_navbar("index")
        + """
<header class="hero">
  <div class="container">
    <h1>Vidal Lab</h1>
    <p class="subtitle">Vision, Dynamics &amp; Learning Lab</p>
    <p class="affiliation">University of Pennsylvania &middot; Department of Electrical and Systems Engineering</p>
  </div>
</header>

<main>
  <!-- Group Photo Carousel -->
  <div class="container">
    <div class="group-carousel">
      <div class="carousel-track">
"""
        + slides
        + """
      </div>
      <button class="carousel-btn prev" aria-label="Previous">&#10094;</button>
      <button class="carousel-btn next" aria-label="Next">&#10095;</button>
      <div class="carousel-dots">
"""
        + dots
        + """
      </div>
    </div>
  </div>

  <!-- News -->
  <section class="container">
    <h2>News</h2>
    <ul class="news-list">
"""
        + news_html
        + """    </ul>
  </section>

  <!-- Project Highlights -->
  <section class="container highlights-grid-section">
    <h2>Project Highlights</h2>
    <div class="highlights-grid">

"""
        + highlights_html
        + """
    </div>
  </section>
</main>

"""
        + FOOTER
        + "\n"
        + PAGE_END
    )


# ---------------------------------------------------------------------------
# people.html
# ---------------------------------------------------------------------------

def render_person_card(person):
    name = e(person["name"])
    url = person.get("url", "")
    if url:
        target = ' target="_blank"' if is_external(url) else ""
        name_html = f'<a href="{url}"{target}>{name}</a>'
    else:
        name_html = name
    photo_tag = (
        f'        <img src="{person["photo"]}" alt="{e(person["name"])}">\n'
        if person.get("photo")
        else ""
    )
    dept_tag = (
        f'        <div class="dept">{e(person["dept"])}</div>\n'
        if person.get("dept")
        else ""
    )
    return (
        '      <div class="person-card">\n'
        + photo_tag
        + f'        <div class="name">{name_html}</div>\n'
        + dept_tag
        + "      </div>"
    )


def render_alumni_item(person):
    name = e(person["name"])
    year_str = f" '{person['year']}" if person.get("year") else ""
    url = person.get("url", "")
    if url:
        target = ' target="_blank"' if is_external(url) else ""
        return f'      <li><a href="{url}"{target}>{name}</a>{year_str}</li>'
    return f"      <li>{name}{year_str}</li>"


def build_people(data, _body):
    pi = data["pi"]
    pi_roles_html = "<br>\n        ".join(e(r) for r in pi.get("roles", []))
    pi_bio_html = e(pi.get("bio", ""))
    pi_url = pi.get("url", "rene-vidal.html")
    pi_photo = pi.get("photo", "")

    staff_cards = "\n".join(render_person_card(p) for p in data.get("staff", []))
    student_cards = "\n".join(render_person_card(p) for p in data.get("students", []))

    alumni = data.get("alumni", {})

    def render_alumni_section(heading, key):
        items = alumni.get(key, [])
        if not items:
            return ""
        rows = "\n".join(render_alumni_item(p) for p in items)
        return (
            '  <section class="people-section">\n'
            f"    <h2>{heading}</h2>\n"
            '    <ul class="alumni-list">\n'
            + rows
            + "\n    </ul>\n  </section>\n"
        )

    alumni_html = "\n".join([
        render_alumni_section("Former Post-doctoral Researchers", "former_postdocs"),
        render_alumni_section("Former PhD Students", "former_phd"),
        render_alumni_section("Former Masters Students", "former_masters"),
        render_alumni_section("Former Undergraduate Students", "former_undergrads"),
        render_alumni_section("Former Interns / REU Students", "former_interns"),
        render_alumni_section("Visiting Students", "visiting_students"),
        render_alumni_section("Rotation Students", "rotation_students"),
    ])

    return (
        render_head(data["title"])
        + "\n"
        + render_navbar("people")
        + """
<div class="page-header">
  <div class="container">
    <h1>People</h1>
    <p>Current and former members of the Vidal Lab</p>
  </div>
</div>

<main class="container">

  <!-- Principal Investigator -->
  <section class="people-section">
    <h2>Principal Investigator</h2>
    <div class="pi-card">
"""
        + f'      <img src="{pi_photo}" alt="{e(pi["name"])}">\n'
        + "      <div>\n"
        + f'        <h3><a href="{pi_url}">{e(pi["name"])}</a></h3>\n'
        + f'        <p class="role">{pi_roles_html}</p>\n'
        + f"        <p>{pi_bio_html}</p>\n"
        + "      </div>\n"
        + """    </div>
  </section>

  <!-- Staff -->
  <section class="people-section">
    <h2>Staff</h2>
    <div class="people-grid">
"""
        + staff_cards
        + """
    </div>
  </section>

  <!-- PhD Students -->
  <section class="people-section">
    <h2>Current PhD Students</h2>
    <div class="people-grid">
"""
        + student_cards
        + """
    </div>
  </section>

  <!-- Former Members -->
"""
        + alumni_html
        + """
</main>

"""
        + FOOTER
        + "\n"
        + PAGE_END
    )


# ---------------------------------------------------------------------------
# rene-vidal.html
# ---------------------------------------------------------------------------

def build_rene_vidal(data, body):
    titles_html = "\n".join(f"        <li>{e(t)}</li>" for t in data.get("titles", []))
    awards_html = "\n".join(f"      <li>{e(a)}</li>" for a in data.get("awards", []))

    def render_news_item(n):
        return (
            "      <li>\n"
            f'        <span class="date">{e(n["date"])}</span>\n'
            f"        <span>{inline_md(n['text'])}</span>\n"
            "      </li>\n"
        )

    news_html = "".join(render_news_item(n) for n in data.get("news", []))

    sections = parse_body_sections(body)
    bio_html = sections.get("Biography", "")
    prospective_html = sections.get("Prospective Students", "")

    email = data.get("email", "")
    display_email = email.replace("@", " [at] ")
    office = e(data.get("office", ""))
    photo = data.get("photo", "")
    name = data.get("name", "")

    return (
        render_head(data["title"])
        + "\n"
        + render_navbar("")
        + """
<div class="page-header">
  <div class="container">
    <h1>Ren\u00e9 Vidal</h1>
    <p>Principal Investigator</p>
  </div>
</div>

<main class="container">

  <section class="profile-hero">
    <div class="profile-photo-col">
"""
        + f'      <img src="{photo}" alt="{e(name)}" class="profile-photo">\n'
        + """    </div>
    <div class="profile-info-col">
"""
        + f'      <h2 class="profile-name">{e(name)}</h2>\n'
        + '      <ul class="profile-titles">\n'
        + titles_html
        + '\n      </ul>\n'
        + '      <div class="profile-contact">\n'
        + f'        <p><strong>Email:</strong> <a href="mailto:{email}">{display_email}</a></p>\n'
        + f"        <p><strong>Office:</strong> {office}</p>\n"
        + "      </div>\n"
        + """    </div>
  </section>

  <section class="profile-section">
    <h2>Biography</h2>
"""
        + f"    {bio_html}\n"
        + """  </section>

  <section class="profile-section">
    <h2>Honors &amp; Awards</h2>
    <ul class="awards-list">
"""
        + awards_html
        + """
    </ul>
  </section>

  <section class="profile-section">
    <h2>News</h2>
    <ul class="news-list">
"""
        + news_html
        + """    </ul>
  </section>

  <section class="profile-section">
    <h2>Prospective Students</h2>
"""
        + f"    {prospective_html}\n"
        + """  </section>

</main>

"""
        + FOOTER
        + "\n"
        + PAGE_END
    )


# ---------------------------------------------------------------------------
# teaching.html
# ---------------------------------------------------------------------------

def build_teaching(data, _body):
    def render_row(course):
        semester = e(course["semester"])
        name = e(course["course"])
        url = course.get("url", "")
        link = f'<a href="{url}" target="_blank">Course Page</a>' if url else "\u2014"
        return (
            "        <tr>\n"
            f"          <td>{semester}</td>\n"
            f"          <td>{name}</td>\n"
            f"          <td>{link}</td>\n"
            "        </tr>"
        )

    rows = "\n".join(render_row(c) for c in data.get("courses", []))

    return (
        render_head(data["title"])
        + "\n"
        + render_navbar("teaching")
        + """
<div class="page-header">
  <div class="container">
    <h1>Teaching</h1>
    <p>Courses taught by Prof. Ren\u00e9 Vidal</p>
  </div>
</div>

<main class="container">

  <section>
    <h2>Courses</h2>
    <table class="teaching-table">
      <thead>
        <tr>
          <th>Semester</th>
          <th>Course</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
"""
        + rows
        + """
      </tbody>
    </table>
  </section>

</main>

"""
        + FOOTER
        + "\n"
        + PAGE_END
    )


# ---------------------------------------------------------------------------
# talks.html
# ---------------------------------------------------------------------------

def render_talk_entry(talk):
    return (
        '    <div class="talk-entry">\n'
        f'      <div class="talk-title">{e(talk["title"])}</div>\n'
        f'      <div class="talk-venue">{e(talk["venue"])}</div>\n'
        f'      <div class="talk-date">{e(str(talk["date"]))}</div>\n'
        "    </div>\n"
    )


def build_talks(data, _body):
    sections_html = []
    for section in data.get("sections", []):
        talks = "\n".join(render_talk_entry(t) for t in section.get("talks", []))
        sections_html.append(
            '  <section class="talks-group">\n'
            f'    <h2>{e(section["heading"])}</h2>\n\n'
            + talks
            + "  </section>\n"
        )
    sections_combined = "\n".join(sections_html)

    return (
        render_head(data["title"])
        + "\n"
        + render_navbar("talks")
        + """
<div class="page-header">
  <div class="container">
    <h1>Talks</h1>
    <p>Selected presentations and invited lectures by Prof. Ren\u00e9 Vidal</p>
  </div>
</div>

<main class="container">

"""
        + sections_combined
        + """
</main>

"""
        + FOOTER
        + "\n"
        + PAGE_END
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

BUILDERS = {
    "index":      (build_index,      "index.html"),
    "people":     (build_people,     "people.html"),
    "rene-vidal": (build_rene_vidal, "rene-vidal.html"),
    "teaching":   (build_teaching,   "teaching.html"),
    "talks":      (build_talks,      "talks.html"),
}


def main():
    if not os.path.isdir(CONTENT_DIR):
        print(f"Error: content directory '{CONTENT_DIR}' not found.")
        sys.exit(1)

    built = []
    for name, (builder, output) in BUILDERS.items():
        src = os.path.join(CONTENT_DIR, f"{name}.md")
        if not os.path.exists(src):
            print(f"  Warning: {src} not found, skipping.")
            continue
        data, body = parse_content_file(src)
        html_out = builder(data, body)
        with open(output, "w", encoding="utf-8") as f:
            f.write(html_out)
        built.append(output)
        print(f"  Built {output}")

    print(f"\nDone. Built {len(built)} pages.")
    print("Note: research.html is not managed by this script.")
    print("      To update publications: python3 scripts/parse_bib.py")


if __name__ == "__main__":
    main()
