"""Validate static translations, SEO, formulas, links, assets, and UTF-8 over local HTTP."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import hashlib
import importlib.util
import json
import re
import sys
import threading
import xml.etree.ElementTree as ET

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream,'reconfigure'): stream.reconfigure(encoding='utf-8',errors='strict')
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('build_locales', ROOT/'tools/build_locales.py')
build=importlib.util.module_from_spec(spec); spec.loader.exec_module(build)

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True)
        self.tags=[]; self.ids=set(); self.references=[]; self.meta={}; self.links=[]
        self.language=None; self.text=[]; self.script=False
        self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs); self.tags.append((tag,a))
        if 'id' in a:
            assert a['id'] not in self.ids,('Duplicate ID',a['id'])
            self.ids.add(a['id'])
        if tag=='html': self.language=a['lang']
        if tag=='meta': self.meta[a.get('name',a.get('property',a.get('charset')))]=a.get('content',a.get('charset'))
        if tag=='link': self.links.append(a)
        if tag=='script': self.script=True
        for key in ('src','href'):
            if key in a: self.references.append(a[key])
    def handle_endtag(self,tag):
        if tag=='script': self.script=False
    def handle_data(self,data):
        if not self.script and data.strip(): self.text.append(data.strip())

def schemas(text):
    return [json.loads(s) for s in re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S)]

def main():
    catalogs=build.CATALOGS
    for lang,c in catalogs.items():
        assert c['language']==lang
        for section in ('strings','runtime','runtimeLabels'):
            assert c[section].keys()==catalogs['en'][section].keys(),(lang,section,'Missing keys')
            assert all(isinstance(s,str) and s.strip() for s in c[section].values())
        for key,value in c['runtime'].items():
            assert re.findall(r'\{\w+\}',key)==re.findall(r'\{\w+\}',value),(lang,key)
    english=build.CATALOGS['en']['strings']
    allowed_same={'BizCalcHub','English','Deutsch','Espa\u00f1ol','support@bizcalchub.top','ROI','ROAS','4.00x (4.00:1)','4.00x','2.00x','ROI = ($2,500 / $10,000) \u00d7 100 ='}
    for lang in ('de','es'):
        for key,value in catalogs[lang]['strings'].items():
            assert value!=key or key in allowed_same,(lang,'Untranslated English',key)
            # Formula labels are translated; numeric literals and mathematical operations stay identical.
            if key in english and (' = ' in key or key.startswith('Profit / ')) and not key.endswith('.'):
                assert re.findall(r'[0-9]+(?:[.,][0-9]+)*|[=+/*\u00d7\u2212()]',value)==re.findall(r'[0-9]+(?:[.,][0-9]+)*|[=+/*\u00d7\u2212()]',key),(lang,'Formula changed',key)
    assert hashlib.sha256((ROOT/'script.js').read_bytes()).hexdigest()=='99835adfa71aece349e6a1c8ad013a64c273cd90ca5103e3a9ae602a80be3940','Calculator JavaScript changed'
    files=sorted(ROOT.rglob('*.html'))
    expected_pages=len(build.SOURCES)*len(build.LANGUAGES)
    expected_indexable=len(build.INDEXABLE_SOURCES)*len(build.LANGUAGES)
    assert len(files)==expected_pages
    parsed={}; texts={}
    for path in files:
        text=path.read_text(encoding='utf-8')
        assert not re.search('[\u3400-\u9fff\ufffd]',text),(path,'Invalid characters')
        parsed[path.resolve()]=Page(text); texts[path]=text
    for path in [*ROOT.glob('locales/*.json'), ROOT/'assets/localization.js', ROOT/'tools/build_locales.py', ROOT/'tools/build-locales.ps1',ROOT/'sitemap.xml',ROOT/'style.css']:
        assert not re.search('[\u3400-\u9fff\ufffd]',path.read_text(encoding='utf-8-sig')),path
    ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','x':'http://www.w3.org/1999/xhtml'}
    sitemap=ET.parse(ROOT/'sitemap.xml').getroot()
    entries=sitemap.findall('s:url',ns)
    assert len(entries)==expected_indexable
    assert len({entry.find('s:loc',ns).text for entry in entries})==expected_indexable
    assert 'Sitemap: '+build.BASE_URL+'/sitemap.xml' in (ROOT/'robots.txt').read_text(encoding='utf-8')
    indexed={entry.find('s:loc',ns).text:entry for entry in entries}
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args): pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    visited=set(); references=0
    def request(target):
        if target in visited: return
        with urlopen(base+'/'+target.relative_to(ROOT).as_posix()) as response:
            assert response.status==200,target
            if target.is_file(): assert response.read()==target.read_bytes(),target
        visited.add(target)
    try:
        for source in build.SOURCES:
            for lang in build.LANGUAGES:
                path=ROOT/build.output_path(source,lang); page=parsed[path.resolve()]; text=texts[path]
                assert page.language==lang
                assert page.meta['utf-8']=='utf-8'
                assert page.meta['description']
                assert re.search(r'<title>[^<]+</title>',text)
                canonical=[a['href'] for a in page.links if a.get('rel')=='canonical']
                assert canonical==[build.absolute_url(source,lang)],path
                expected={code:build.absolute_url(source,code if code!='x-default' else 'en') for code in (*build.LANGUAGES,'x-default')}
                alternates=[a for a in page.links if a.get('rel')=='alternate']
                assert len(alternates)==4
                assert {a['hreflang']:a['href'] for a in alternates}==expected,path
                if source.name == '404.html':
                    assert page.meta.get('robots') == 'noindex, follow'
                    assert canonical[0] not in indexed
                else:
                    assert 'noindex' not in page.meta.get('robots','')
                    sitemap_alternates=indexed[canonical[0]].findall('x:link',ns)
                    assert {a.attrib['hreflang']:a.attrib['href'] for a in sitemap_alternates}==expected,path
                assert len([a for tag,a in page.tags if tag=='h1'])==1
                for nav in re.findall(r'<nav(?: id="primary-navigation"| aria-label="[^"]+")[^>]*>.*?</nav>',text,re.S):
                    assert 'advertising-disclosure.html' in nav,path
                if source.parent != Path('calculators') and source.name != 'index.html':
                    assert 'class="ad"' not in text,path
                icons=[a for tag,a in page.tags if tag=='link' and a.get('rel')=='icon']
                assert any(a.get('href')=='/assets/bizcalchub-logo.png' and a.get('type')=='image/png' for a in icons)
                switch=re.search(r'<nav class="language-switcher".*?</nav>',text,re.S).group()
                assert len(re.findall(r'<a\b',switch))==3
                assert switch.count('aria-current="page"')==1
                if lang!='en':
                    original=build.strip_generated((ROOT/source).read_text(encoding='utf-8'))
                    expected_html=build.generated_sections(source,lang,build.translated_html(source,lang,original))
                    assert text==expected_html,('Stale or missing translation',path)
                    # Inputs retain every calculator identifier, constraint, placeholder, and numeric value.
                    source_page=parsed[(ROOT/source).resolve()]
                    for tag in ('input','form'):
                        assert [a for t,a in page.tags if t==tag]==[a for t,a in source_page.tags if t==tag],(path,tag)
                    assert schemas(text)==[build.translate_schema(s,lang) for s in schemas(original)]
                    english_nodes=set(source_page.text)
                    for node in page.text:
                        if re.search('[A-Za-z]',node) and node in english_nodes:
                            assert node in allowed_same,(path,'English text left',node)
                request(path)
                for reference in page.references:
                    url=urlsplit(reference)
                    if url.scheme or url.netloc:
                        # Validate production-domain SEO URLs against the local site files.
                        if url.netloc!=urlsplit(build.BASE_URL).netloc: continue
                        target=ROOT/unquote(url.path.lstrip('/'))
                    elif not url.path: target=path
                    elif url.path.startswith('/'): target=ROOT/unquote(url.path.lstrip('/'))
                    else: target=path.parent/unquote(url.path)
                    target=target.resolve()
                    if target.is_dir(): target=target/'index.html'
                    assert target.is_relative_to(ROOT) and target.is_file(),(path,reference)
                    if url.fragment and target in parsed:
                        assert unquote(url.fragment) in parsed[target].ids,(path,reference)
                    request(target); references+=1
                for tag,attrs in page.tags:
                    for attr in ('aria-labelledby','aria-describedby','aria-controls'):
                        for identifier in attrs.get(attr,'').split(): assert identifier in page.ids,(path,attr,identifier)
                print('PASS '+path.relative_to(ROOT).as_posix()+': translations, links, assets, metadata, schema')
    finally: server.shutdown(); server.server_close()
    print(f'PASS: {expected_pages} pages, {references} local references, {len(visited)} HTTP resources, reciprocal hreflang, {expected_indexable} sitemap entries, complete catalogs, UTF-8, no Chinese characters, and unchanged calculator JavaScript.')

if __name__=='__main__': main()
