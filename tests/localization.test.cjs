// Run directly to avoid Windows sandbox child-process restrictions:
// node tests/localization.test.cjs
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const calculator = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const localizer = fs.readFileSync(path.join(root, 'assets/localization.js'), 'utf8');
const catalogs = Object.fromEntries(['en', 'de', 'es'].map(lang => [lang, JSON.parse(fs.readFileSync(path.join(root, 'locales', lang + '.json'), 'utf8'))]));
const tools = [
  {page:'profit-margin', form:'profit-margin-form', inputs:['revenue','cost'], results:['profit-result','margin-result','markup-result'], example:'load-example', values:['10000','7000'], zero:['0','0'], loss:['100','120'], overflow:['1e308','1e-308']},
  {page:'markup', form:'markup-form', inputs:['markup-cost','markup-percentage'], results:['markup-profit-result','selling-price-result','markup-margin-result'], example:'load-markup-example', values:['100','25'], zero:['0','25'], overflow:['1e308','1e308']},
  {page:'roi', form:'roi-form', inputs:['initial-investment','final-return'], results:['roi-profit-result','roi-percentage-result'], example:'load-roi-example', values:['10000','12500'], zero:['0','100'], loss:['1000','-200'], even:['100','100'], overflow:['1e-308','1e308']},
  {page:'roas', form:'roas-form', inputs:['advertising-spend','revenue-generated'], results:['roas-ratio-result','roas-percentage-result','roas-profit-result'], example:'load-roas-example', values:['1000','4000'], zero:['0','0'], loss:['1000','500'], even:['1000','1000'], overflow:['1e-308','1e308']},
  {page:'break-even', form:'break-even-form', inputs:['fixed-costs','selling-price','variable-cost'], results:['break-even-units-result','break-even-revenue-result','contribution-result'], example:'load-break-even-example', values:['10000','50','30'], zero:['0','0','0'], loss:['100','5','10'], even:['100','5','5'], fractional:['10005','50','30'], nofixed:['0','5','10'], huge:['1e30','50','30'], overflow:['1e308','2','1']}
];
function fixture(lang, tool) {
  const watched = new Map();
  class Element {
    constructor(id) { this.id=id; this.value=''; this.hidden=false; this.attrs={}; this.events={}; this.dataset={}; this._text=''; this.name=id==='revenue'?'revenue':'cost'; }
    get textContent() { return this._text; }
    set textContent(text) {
      this._text=String(text);
      for (const observer of watched.get(this) || []) {
        if (!observer.pending) {
          observer.pending=true;
          queueMicrotask(() => { observer.pending=false; observer.callback(); });
        }
      }
    }
    get valueAsNumber() { return Number(this.value); }
    get validity() { return {badInput:this.value==='bad', valid:this.value!=='' && this.value!=='bad' && Number.isFinite(Number(this.value)) && (this.id==='final-return' || Number(this.value)>=0)}; }
    setAttribute(k,v) { this.attrs[k]=v; }
    removeAttribute(k) { delete this.attrs[k]; }
    addEventListener(k,fn) { this.events[k]=fn; }
    focus() { this.focused=true; }
    requestSubmit() { this.events.submit({preventDefault(){}}); }
  }
  const ids=[tool.form,...tool.inputs,...tool.results,tool.example,'calculator-error','result-prompt','result-details','result-note'];
  const elements=Object.fromEntries(ids.map(id => [id,new Element(id)]));
  elements['calculator-translations']=new Element('calculator-translations');
  elements['calculator-translations'].textContent=JSON.stringify({messages:catalogs[lang].runtime,labels:catalogs[lang].runtimeLabels});
  class Observer {
    constructor(callback) { this.callback=callback; }
    observe(target) { if (!watched.has(target)) watched.set(target,[]); watched.get(target).push(this); }
  }
  const context=vm.createContext({document:{querySelector:selector=>elements[selector.slice(1)]||null,querySelectorAll:()=>[],getElementById:id=>elements[id]||null},window:{matchMedia:()=>({matches:false})},Intl,MutationObserver:Observer});
  vm.runInContext(calculator,context);
  if (lang!=='en') vm.runInContext(localizer,context);
  return {elements,submit(values){tool.inputs.forEach((id,i)=>{elements[id].value=values[i];});elements[tool.form].requestSubmit();},snapshot(){return {numbers:tool.results.map(id=>elements[id].textContent),hidden:elements['result-details'].hidden,outcome:elements['result-details'].dataset.outcome,errorHidden:elements['calculator-error'].hidden,invalid:tool.inputs.map(id=>elements[id].attrs['aria-invalid'])};}};
}
async function settle() { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); }
(async () => {
  // Test every runtime message with every possible label and representative numeric tokens.
  let messages=0;
  for (const lang of ['de','es']) {
    const f=fixture(lang,tools[0]);
    for (const [source,target] of Object.entries(catalogs[lang].runtime)) {
      const labels=source.includes('{label}')?Object.keys(catalogs[lang].runtimeLabels):[''];
      for (const label of labels) {
        const input=source.replace('{label}',label).replace('{value}','12,345.67');
        const expected=target.replace('{label}',catalogs[lang].runtimeLabels[label]).replace('{value}','12,345.67');
        f.elements['result-note'].textContent=input;
        await settle();
        assert.equal(f.elements['result-note'].textContent,expected,lang+': '+input);
        assert.equal(f.elements['profit-result'].textContent,'');
        messages++;
      }
    }
  }
  for (const tool of tools) {
    const fixtures=Object.fromEntries(['en','de','es'].map(lang=>[lang,fixture(lang,tool)]));
    const cases=[tool.values,tool.zero,...['loss','even','fractional','nofixed','huge','overflow'].filter(k=>tool[k]).map(k=>tool[k])];
    for (let i=0;i<tool.inputs.length;i++) {
      for (const invalid of ['','bad','-1']) { const values=[...tool.values]; values[i]=invalid; cases.push(values); }
    }
    for (const values of cases) {
      for (const f of Object.values(fixtures)) f.submit(values);
      await settle();
      for (const lang of ['de','es']) {
        const f=fixtures[lang],english=fixtures.en;
        assert.deepEqual(f.snapshot(),english.snapshot(),lang+' '+tool.page+' numeric/state parity');
        assert.deepEqual(tool.inputs.map(id=>f.elements[id].value),values);
        const enError=english.elements['calculator-error'].textContent;
        if (enError) assert.notEqual(f.elements['calculator-error'].textContent,enError,lang+' untranslated error');
        const enNote=english.elements['result-note'].textContent;
        if (enNote) assert.notEqual(f.elements['result-note'].textContent,enNote,lang+' untranslated note');
        assert.doesNotMatch(f.elements['calculator-error'].textContent+f.elements['result-note'].textContent,/must be|cannot be|These inputs|These amounts|Results are|is undefined|Contribution margin|For indivisible|This quantity|Profit Per Unit/);
      }
    }
    for (const f of Object.values(fixtures)) f.elements[tool.example].events.click();
    await settle();
    for (const lang of ['de','es']) assert.deepEqual(fixtures[lang].snapshot(),fixtures.en.snapshot());
    for (const f of Object.values(fixtures)) {
      f.elements[tool.form].events.input();
      assert.equal(f.elements['result-details'].hidden,true);
      assert.equal(f.elements['calculator-error'].hidden,true);
      f.elements[tool.form].events.reset();
      assert.equal(f.elements[tool.inputs[0]].focused,true);
    }
    console.log('PASS: '+tool.page+' in all three languages: numeric/state parity, errors, notes, zero values, overflow, example, input changes, reset.');
  }
  console.log('PASS: '+messages+' runtime translation cases; original calculator JavaScript used unchanged.');
})().catch(error=>{console.error(error);process.exitCode=1;});
