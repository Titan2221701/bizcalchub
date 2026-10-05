// Run with: node tests/roas.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function element() {
  return { value: '', textContent: '', hidden: false, attrs: {}, events: {}, dataset: {},
    get valueAsNumber() { return Number(this.value); },
    get validity() { return { valid: this.value !== '' && Number.isFinite(Number(this.value)) && Number(this.value) >= 0, badInput: this.value === 'bad' }; },
    setAttribute(key, value) { this.attrs[key] = value; },
    removeAttribute(key) { delete this.attrs[key]; },
    addEventListener(name, callback) { this.events[name] = callback; },
    focus() { this.focused = true; }
  };
}
const ids = ['roas-form','advertising-spend','revenue-generated','calculator-error','result-prompt','result-details','roas-ratio-result','roas-percentage-result','roas-profit-result','result-note','load-roas-example'];
const elements = Object.fromEntries(ids.map(id => ['#' + id, element()]));
const context = vm.createContext({ document: { querySelector: id => elements[id] || null, querySelectorAll: () => [] }, window: { matchMedia: () => ({ matches: false }) }, Intl });
vm.runInContext(fs.readFileSync('script.js','utf8'),context);
for (const [spend,revenue,ratio,percentage,profit] of [[1000,4000,4,400,3000],[1000,500,0.5,50,-500],[100,100,1,100,0],[100,0,0,0,-100],[12.5,31.25,2.5,250,18.75],[0,100,null,null,100],[0,0,null,null,0]]) {
  const result = context.calculateROAS(spend,revenue);
  assert.equal(result.ratio,ratio); assert.equal(result.percentage,percentage); assert.equal(result.profit,profit);
}
for (const pair of [[-1,100],[1,-100],[Infinity,1],[1,NaN],[Number.MIN_VALUE,1],[1,Number.MAX_VALUE]]) assert.throws(() => context.calculateROAS(...pair));
const form = elements['#roas-form'];
function submit(spend,revenue) {
  elements['#advertising-spend'].value=spend; elements['#revenue-generated'].value=revenue;
  form.events.submit({preventDefault(){}});
}
form.requestSubmit=()=>form.events.submit({preventDefault(){}});
submit('1000','4000');
assert.equal(elements['#roas-ratio-result'].textContent,'4.00x');
assert.equal(elements['#roas-percentage-result'].textContent,'400.00%');
assert.equal(elements['#roas-profit-result'].textContent,'3,000.00');
assert.equal(elements['#result-details'].hidden,false);
submit('1000','500');
assert.equal(elements['#roas-profit-result'].textContent,'-500.00');
assert.equal(elements['#result-details'].dataset.outcome,'loss');
assert.match(elements['#result-note'].textContent,/loss/);
submit('0','100');
assert.equal(elements['#roas-ratio-result'].textContent,'N/A');
assert.equal(elements['#roas-percentage-result'].textContent,'N/A');
assert.match(elements['#result-note'].textContent,/undefined/);
submit('','100');
assert.equal(elements['#advertising-spend'].attrs['aria-invalid'],'true');
assert.match(elements['#calculator-error'].textContent,/Enter advertising spend/);
submit('100',''); assert.equal(elements['#revenue-generated'].attrs['aria-invalid'],'true');
submit('-100','100'); assert.match(elements['#calculator-error'].textContent,/cannot be negative/);
submit('100','-100'); assert.match(elements['#calculator-error'].textContent,/cannot be negative/);
submit('100','bad'); assert.match(elements['#calculator-error'].textContent,/must be a number/);
submit('1e-308','1e308'); assert.match(elements['#calculator-error'].textContent,/too large/);
assert.equal(elements['#result-details'].hidden,true);
elements['#load-roas-example'].events.click(); assert.equal(elements['#roas-ratio-result'].textContent,'4.00x');
form.events.input(); assert.equal(elements['#result-details'].hidden,true); assert.equal(elements['#calculator-error'].hidden,true);
submit('100','200'); form.events.reset();
assert.equal(elements['#result-details'].hidden,true); assert.equal(elements['#result-prompt'].hidden,false); assert.equal(elements['#advertising-spend'].focused,true);
console.log('PASS: normal and low ROAS, decimals, zero spend/revenue, invalid inputs, overflow, formatting, example, reset, and input changes.');
