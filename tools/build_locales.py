"""Build static language pages from English HTML and UTF-8 locale catalogs.
Run: python -X utf8 tools/build_locales.py
No translation service or runtime HTML translation is required.
"""
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import hashlib
import html
import json
import os
import posixpath
import re
import sys

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, 'reconfigure'):
        stream.reconfigure(encoding='utf-8', errors='strict')
ROOT = Path(__file__).resolve().parents[1]
BASE_URL = 'https://bizcalchub.top'
LANGUAGES = {'en': 'English', 'de': 'Deutsch', 'es': 'Espa\u00f1ol'}
SOURCES = [Path('index.html'), Path('about.html'), Path('contact.html'),
           Path('privacy-policy.html'), Path('terms.html'),
           Path('advertising-disclosure.html'), Path('404.html'),
           *[p.relative_to(ROOT) for p in sorted((ROOT/'calculators').glob('*.html'))]]
INDEXABLE_SOURCES = [source for source in SOURCES if source.name != '404.html']
CATALOGS = {lang: json.loads((ROOT/f'locales/{lang}.json').read_text(encoding='utf-8')) for lang in LANGUAGES}


def output_path(source, lang):
    return source if lang == 'en' else Path(lang)/source


def absolute_url(source, lang):
    path = output_path(source, lang).as_posix()
    if source.name == 'index.html':
        path = '' if lang == 'en' else lang+'/'
    return BASE_URL+'/'+path


def relative_url(page, target):
    if target.name == 'index.html':
        directory = posixpath.relpath(target.parent.as_posix(), page.parent.as_posix())
        return './' if directory == '.' else directory+'/'
    return posixpath.relpath(target.as_posix(), page.parent.as_posix())


def translate_text(value, lang):
    clean = html.unescape(value).strip()
    if not clean or not re.search(r'[A-Za-z]', clean):
        return value
    if clean not in CATALOGS[lang]['strings']:
        raise ValueError(f'Missing {lang} translation: {clean}')
    translated = CATALOGS[lang]['strings'][clean]
    return value[:len(value)-len(value.lstrip())]+html.escape(translated, quote=False)+value[len(value.rstrip()):]


def translate_schema(node, lang):
    if isinstance(node, list):
        return [translate_schema(item, lang) for item in node]
    if isinstance(node, dict):
        if node.get('@type') == 'BreadcrumbList':
            node = dict(node)
            node['itemListElement'] = [dict(item) for item in node['itemListElement']]
            for item in node['itemListElement']:
                if item.get('position') in (1, 2):
                    item['item'] = absolute_url(Path('index.html'), lang) + ('#calculators' if item['position'] == 2 else '')
        return {key: CATALOGS[lang]['strings'][value] if key in ('name','text','description') and isinstance(value,str)
                else translate_schema(value,lang) for key,value in node.items()}
    return node


def translated_html(source, lang, text):
    page = output_path(source, lang)
    # Protect scripts from ordinary text-node translation.
    scripts = []
    def script(match):
        block = match.group(0)
        if 'application/ld+json' in block:
            data = json.loads(re.search(r'>(.*)</script>',block,re.S).group(1))
            data = translate_schema(data,lang)
            block = '<script type="application/ld+json">\n'+json.dumps(data,ensure_ascii=False,indent=2)+'\n</script>'
        scripts.append(block)
        return f'<script-placeholder data-index="{len(scripts)-1}"></script-placeholder>'
    text = re.sub(r'<script\b[^>]*>.*?</script>',script,text,flags=re.S)
    text = re.sub(r'>([^<>]+)<',lambda m: '>'+translate_text(m.group(1),lang)+'<',text)
    def attr(match):
        key,value=match.groups()
        translated = CATALOGS[lang]['strings'].get(html.unescape(value))
        if translated is None:
            if re.search('[A-Za-z]',html.unescape(value)):
                raise ValueError(f'Missing {lang} attribute: {value}')
            return match.group(0)
        return key+'="'+html.escape(translated,quote=True)+'"'
    text = re.sub(r'(aria-label|placeholder|title)="([^"]+)"',attr,text)
    text = re.sub(r'(<meta name="description" content=")([^"]+)(")',
                  lambda m:m.group(1)+html.escape(CATALOGS[lang]['strings'][html.unescape(m.group(2))],quote=True)+m.group(3),text)
    for i,block in enumerate(scripts):
        text=text.replace(f'<script-placeholder data-index="{i}"></script-placeholder>',block)
    text=text.replace('<html lang="en">',f'<html lang="{lang}">')
    brand=CATALOGS[lang]['brand']
    text=re.sub(r'(<a class="brand"[^>]*>).*?<span>.*?</span></a>',
                lambda m:m.group(1)+html.escape(brand['prefix'])+' <span>'+html.escape(brand['suffix'])+'</span></a>',text)
    def link(match):
        key,value=match.groups()
        parsed=urlsplit(html.unescape(value))
        if parsed.netloc in ('support.google.com', 'policies.google.com', 'myadcenter.google.com'):
            query=dict(parse_qsl(parsed.query))
            query['hl']=lang
            localized=urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment))
            return key+'="'+html.escape(localized,quote=True)+'"'
        if parsed.scheme or parsed.netloc or not parsed.path:
            return match.group(0)
        target=Path(posixpath.normpath(posixpath.join(source.parent.as_posix(),parsed.path)))
        # HTML navigation stays within the selected language; assets remain shared.
        if target.as_posix() == '.':
            target = Path(lang)/'index.html'
        elif target.suffix=='.html':
            target=Path(lang)/target
        path=relative_url(page,target)
        rewritten=urlunsplit(('', '', path, parsed.query,parsed.fragment))
        return key+'="'+html.escape(rewritten,quote=True)+'"'
    return re.sub(r'(href|src)="([^"]+)"',link,text)


def generated_sections(source,lang,text):
    page=output_path(source,lang)
    if source.name == '404.html':
        base='/' if lang=='en' else '/'+lang+'/'
        text=text.replace('</head>', '  <base href="'+base+'">\n</head>', 1)
    head=['  <!-- multilingual-seo:start -->',
          f'  <link rel="canonical" href="{absolute_url(source,lang)}">']
    head += [f'  <link rel="alternate" hreflang="{code}" href="{absolute_url(source,code)}">' for code in LANGUAGES]
    head += [f'  <link rel="alternate" hreflang="x-default" href="{absolute_url(source,"en")}">']
    title = html.unescape(re.search(r'<title>(.*?)</title>', text, re.S).group(1))
    description = html.unescape(re.search(r'<meta name="description" content="([^"]+)">', text).group(1))
    social = {'og:type': 'website', 'og:url': absolute_url(source, lang),
              'og:title': title, 'og:description': description,
              'og:site_name': CATALOGS[lang]['strings']['Free Business Calculators'],
              'og:locale': {'en': 'en_US', 'de': 'de_DE', 'es': 'es_ES'}[lang]}
    head += [f'  <meta property="{key}" content="{html.escape(value, quote=True)}">' for key, value in social.items()]
    head += [f'  <meta property="og:locale:alternate" content="{locale}">'
             for code, locale in {'en': 'en_US', 'de': 'de_DE', 'es': 'es_ES'}.items() if code != lang]
    head += ['  <!-- multilingual-seo:end -->']
    text=text.replace('</head>','\n'.join(head)+'\n</head>',1)
    label=CATALOGS[lang]['strings']['Language']
    switch=['    <!-- language-switcher:start -->',f'    <nav class="language-switcher" aria-label="{label}">']
    for code,name in LANGUAGES.items():
        current=' aria-current="page"' if code==lang else ''
        switch.append(f'      <a href="{relative_url(page,output_path(source,code))}" lang="{code}" hreflang="{code}"{current}>{name}</a>')
    switch += ['    </nav>','    <!-- language-switcher:end -->']
    marker='  </div></header>'
    assert marker in text,source
    text=text.replace(marker,'\n'.join(switch)+'\n'+marker,1)
    if lang!='en' and source.parent==Path('calculators'):
        runtime=json.dumps({'messages':CATALOGS[lang]['runtime'],'labels':CATALOGS[lang]['runtimeLabels']},ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
        # This display-only observer never writes numeric results, inputs, or calculator state.
        addition='  <script type="application/json" id="calculator-translations">'+runtime+'</script>\n'
        addition+=f'  <script src="{relative_url(page,Path("assets/localization.js"))}" defer></script>\n'
        text=text.replace('</head>',addition+'</head>',1)
    return text


def strip_generated(text):
    for block in ('multilingual-seo','language-switcher'):
        text=re.sub(r'^[ \t]*<!-- '+block+r':start -->.*?<!-- '+block+r':end -->\n?', '', text, flags=re.S|re.M)
    text=re.sub(r'^[ \t]*<base href="[^"]+">\n?', '', text, flags=re.M)
    return text


def build():
    script_hash=hashlib.sha256((ROOT/'script.js').read_bytes()).hexdigest()
    # English remains the source of truth. Remove only our generated blocks on rebuild.
    originals={p:strip_generated((ROOT/p).read_text(encoding='utf-8')) for p in SOURCES}
    for source,text in originals.items():
        # Normalize breadcrumb URLs on the English source without touching visible formulas.
        def breadcrumb_script(match):
            block = match.group(0)
            data = json.loads(re.search(r'>(.*)</script>', block, re.S).group(1))
            return '<script type="application/ld+json">\n'+json.dumps(translate_schema(data, 'en'), ensure_ascii=False, indent=2)+'\n</script>'
        text = re.sub(r'<script type="application/ld\+json">.*?</script>', breadcrumb_script, text, flags=re.S)
        for lang in LANGUAGES:
            generated=text if lang=='en' else translated_html(source,lang,text)
            generated=generated_sections(source,lang,generated)
            target=ROOT/output_path(source,lang)
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(generated,encoding='utf-8',newline='\n')
    urls=['<?xml version="1.0" encoding="UTF-8"?>',
          '<!-- Production sitemap for bizcalchub.top. -->',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for source in INDEXABLE_SOURCES:
        for lang in LANGUAGES:
            urls += ['  <url>',f'    <loc>{absolute_url(source,lang)}</loc>']
            for alternate in (*LANGUAGES,'x-default'):
                urls.append(f'    <xhtml:link rel="alternate" hreflang="{alternate}" href="{absolute_url(source,"en" if alternate=="x-default" else alternate)}" />')
            urls += ['  </url>']
    urls += ['</urlset>']
    (ROOT/'robots.txt').write_text('# Production crawl configuration.\nUser-agent: *\nAllow: /\nSitemap: '+BASE_URL+'/sitemap.xml\n', encoding='utf-8')
    (ROOT/'sitemap.xml').write_text('\n'.join(urls)+'\n',encoding='utf-8')
    assert hashlib.sha256((ROOT/'script.js').read_bytes()).hexdigest()==script_hash
    print(f'Built {len(SOURCES)*len(LANGUAGES)} UTF-8 pages; {len(INDEXABLE_SOURCES)*len(LANGUAGES)} indexable sitemap entries; directory home links, absolute breadcrumbs, and robots sitemap reference.')

if __name__=='__main__':
    build()
