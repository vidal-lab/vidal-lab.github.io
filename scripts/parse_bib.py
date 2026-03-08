#!/usr/bin/env python3
"""Parse vidal.bib into a JSON file for the website."""

import re
import json
import sys
from pathlib import Path


def parse_bib(bib_path):
    with open(bib_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract @string macros
    string_macros = {}
    for m in re.finditer(r'@string\{(\w+)\s*=\s*\{(.+?)\}\}', content, re.IGNORECASE):
        string_macros[m.group(1).lower()] = m.group(2)

    entries = []
    # Match BibTeX entries: @type{key, ... }
    # Handle nested braces properly
    entry_starts = list(re.finditer(r'@(article|inproceedings|incollection|book|phdthesis|mastersthesis|techreport|misc|proceedings)\s*\{', content, re.IGNORECASE))

    for i, match in enumerate(entry_starts):
        start = match.end()
        entry_type = match.group(1).lower()

        # Find matching closing brace by counting braces
        depth = 1
        pos = start
        while pos < len(content) and depth > 0:
            if content[pos] == '{':
                depth += 1
            elif content[pos] == '}':
                depth -= 1
            pos += 1

        entry_text = content[start:pos - 1]

        # Extract the key (first thing before the comma)
        key_match = re.match(r'\s*([^,\s]+)\s*,', entry_text)
        if not key_match:
            continue
        key = key_match.group(1)
        fields_text = entry_text[key_match.end():]

        entry = parse_fields(fields_text, string_macros)
        entry['key'] = key
        entry['type'] = entry_type

        # Clean up LaTeX in fields
        for field in ['title', 'author', 'journal', 'booktitle']:
            if field in entry:
                entry[field] = clean_latex(entry[field])

        entries.append(entry)

    return entries


def parse_fields(text, macros):
    """Parse BibTeX fields from the text after the key."""
    fields = {}
    # Match field = value patterns
    # Value can be: {braced text}, "quoted text", or a macro name
    pos = 0
    while pos < len(text):
        # Skip whitespace and commas
        m = re.match(r'[\s,]+', text[pos:])
        if m:
            pos += m.end()
            continue

        # Match field name
        m = re.match(r'([A-Za-z_][\w-]*)\s*=\s*', text[pos:])
        if not m:
            pos += 1
            continue

        field_name = m.group(1).lower()
        pos += m.end()

        # Parse value
        value, consumed = parse_value(text[pos:], macros)
        if value is not None:
            fields[field_name] = value
        pos += consumed

    return fields


def parse_value(text, macros):
    """Parse a BibTeX value (braced, quoted, or macro)."""
    text = text.lstrip()
    if not text:
        return None, 0

    offset = len(text) - len(text.lstrip())

    if text[0] == '{':
        # Braced value - find matching brace
        depth = 1
        pos = 1
        while pos < len(text) and depth > 0:
            if text[pos] == '{':
                depth += 1
            elif text[pos] == '}':
                depth -= 1
            pos += 1
        return text[1:pos - 1], pos
    elif text[0] == '"':
        # Quoted value
        pos = 1
        while pos < len(text) and text[pos] != '"':
            pos += 1
        return text[1:pos], pos + 1
    else:
        # Macro or number
        m = re.match(r'(\w+)', text)
        if m:
            macro_name = m.group(1)
            resolved = macros.get(macro_name.lower(), macro_name)
            return resolved, m.end()
        return None, 1


def clean_latex(text):
    """Remove LaTeX formatting commands."""
    # Remove \'{e} style accents
    accent_map = {
        "\\'": '', "\\`": '', "\\^": '', '\\"': '', "\\~": '',
        "\\=": '', "\\.": '', "\\u": '', "\\v": '', "\\H": '',
        "\\c": '', "\\d": '', "\\b": '', "\\t": '',
    }

    # Handle {\'{x}} patterns → x with accent
    text = re.sub(r"\{\\['`^\"~=.uvHcdbt]\{([a-zA-Z])\}\}", r'\1', text)
    # Handle {\'x} patterns
    text = re.sub(r"\{\\['`^\"~=.uvHcdbt]([a-zA-Z])\}", r'\1', text)
    # Handle \'{x} patterns
    text = re.sub(r"\\['`^\"~=.uvHcdbt]\{([a-zA-Z])\}", r'\1', text)
    # Handle \'x patterns
    text = re.sub(r"\\['`^\"~=.uvHcdbt]([a-zA-Z])", r'\1', text)

    # Common LaTeX replacements
    replacements = {
        '{\\&}': '&', '\\&': '&',
        '{\\%}': '%', '\\%': '%',
        '{\\$}': '$', '\\$': '$',
        '\\textendash': '–', '--': '–',
        '\\textemdash': '—',
        '~': ' ',
        '\\,': ' ',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    # Remove remaining braces
    text = text.replace('{', '').replace('}', '')

    # Clean up multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()

    return text


def extract_topics(entries):
    """Extract all unique topics/keywords from entries."""
    topics = set()
    for entry in entries:
        if 'keywords' in entry:
            for kw in entry['keywords'].split(','):
                kw = kw.strip()
                if kw:
                    topics.add(kw)
    return sorted(topics)


def main():
    bib_path = Path(__file__).parent.parent / 'vidal.bib'
    out_path = Path(__file__).parent.parent / 'assets' / 'data' / 'publications.json'

    entries = parse_bib(bib_path)

    # Sort by year descending, then by key
    entries.sort(key=lambda e: (-int(e.get('year', '0')), e.get('key', '')))

    topics = extract_topics(entries)

    output = {
        'topics': topics,
        'publications': entries,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Parsed {len(entries)} entries with {len(topics)} topics")
    print(f"Topics: {topics}")
    print(f"Output: {out_path}")


if __name__ == '__main__':
    main()
