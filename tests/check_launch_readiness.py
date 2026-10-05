"""Audit content accuracy, disclosure visibility, SEO consistency, and launch boundaries."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib
import html
import importlib.util
import json
import re
import sys

sys.dont_write_bytecode = True
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, 'reconfigure'):
        stream.reconfigure(encoding='utf-8', errors='strict')
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('locale_checks', ROOT/'tests/check_locales.py')
checks = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checks)
build = checks.build


def resolve_url(url):
    parts = urlsplit(url)
    assert parts.netloc == urlsplit(build.BASE_URL).netloc
    target = ROOT/unquote(parts.path.lstrip('/'))
    if target.is_dir():
        target /= 'index.html'
    assert target.is_file(), url
    if parts.fragment:
        assert parts.fragment in checks.Page(target.read_text(encoding='utf-8')).ids, url


def main():
    titles = set()
    descriptions = set()
    main_hashes = set()
    schema_questions = 0
    placeholders = 0
    old_claims = ('Future calculator estimates', 'Interactive calculators are coming soon.',
                  'Calculator pages are informational placeholders.',
                  'Interactive calculations are not yet available.',
                  'This version has no accounts, working contact forms, or interactive calculators',
                  'US and global English-speaking business owners')
    support_names = {'about.html', 'contact.html', 'privacy-policy.html', 'terms.html',
                     'advertising-disclosure.html', '404.html'}
    for source in build.SOURCES:
        for lang in build.LANGUAGES:
            path = ROOT/build.output_path(source, lang)
            text = path.read_text(encoding='utf-8')
            page = checks.Page(text)
            title = html.unescape(re.search(r'<title>(.*?)</title>', text, re.S).group(1))
            assert title not in titles
            assert page.meta['description'] not in descriptions
            titles.add(title)
            descriptions.add(page.meta['description'])
            main_content = re.search(r'<main\b[^>]*>(.*?)</main>', text, re.S).group(1)
            digest = hashlib.sha256(main_content.encode('utf-8')).hexdigest()
            assert digest not in main_hashes
            main_hashes.add(digest)
            assert not any(claim in text for claim in old_claims), path
            # Directory links agree with homepage canonicals; no HTML home aliases remain.
            for reference in page.references:
                parts = urlsplit(reference)
                if not parts.scheme and not parts.netloc:
                    assert not parts.path.endswith('index.html'), (path, reference)
            if source.name in support_names:
                assert 'class="ad"' not in text
            placeholders += text.count('class="ad"')
            assert page.meta['og:url'] == build.absolute_url(source, lang)
            assert page.meta['og:title'] == title
            assert page.meta['og:description'] == page.meta['description']
            assert page.meta['og:locale'] == {'en': 'en_US', 'de': 'de_DE', 'es': 'es_ES'}[lang]
            if source.name in {'contact.html', 'privacy-policy.html', 'terms.html', 'advertising-disclosure.html'}:
                assert '<a href="mailto:support@bizcalchub.top">support@bizcalchub.top</a>' in text
            if source.name == 'contact.html':
                assert build.CATALOGS[lang]['strings']['Support email'] in html.unescape(text)
            if source.name in {'privacy-policy.html', 'advertising-disclosure.html'}:
                assert 'Google AdSense' in text
                assert not any(urlsplit(a.get('src', '')).netloc for tag, a in page.tags if tag == 'script')
            visible_pairs = [
                (html.unescape(re.sub(r'<[^>]+>', '', q)).strip(),
                 html.unescape(re.sub(r'<[^>]+>', '', a)).strip())
                for q, a in re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', text, re.S)
            ]
            for block in checks.schemas(text):
                for item in block if isinstance(block, list) else [block]:
                    if item.get('@type') == 'FAQPage':
                        for question in item['mainEntity']:
                            assert (question['name'], question['acceptedAnswer']['text']) in visible_pairs
                            schema_questions += 1
                    if item.get('@type') == 'BreadcrumbList':
                        for entry in item['itemListElement']:
                            if 'item' in entry:
                                assert entry['item'].startswith(build.BASE_URL+'/')
                                resolve_url(entry['item'])
            print('PASS '+path.relative_to(ROOT).as_posix()+': unique metadata/content, directory navigation, disclosures, schema')
    assert placeholders == 18
    assert schema_questions == 168
    assert len(titles) == 36 and len(descriptions) == 36
    for path in ROOT.rglob('*'):
        if path.is_file() and path.suffix in {'.html', '.json', '.xml', '.txt', '.md', '.py', '.ps1', '.js', '.cjs', '.css', '.svg'}:
            text = path.read_text(encoding='utf-8')
            assert 'example'+'.com' not in text, path
            assert not re.search('[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]', text), path
    print('PASS: 36 unique titles/descriptions/main-content blocks; 168 visible/schema FAQ pairs; 18 labeled ad placeholders; production contact links and Open Graph metadata valid; all breadcrumb targets valid; no retired domain or Chinese characters.')
    print('REMAINING: mailbox delivery, operator/host details, production redirects and 404 routing, consent/ad account setup, and browser/mobile/live-ad checks.')


if __name__ == '__main__':
    main()
