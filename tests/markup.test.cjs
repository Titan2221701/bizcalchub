// Run with: node tests/markup.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function element() {
  return { value: '', textContent: '', hidden: false, attrs: {}, events: {},
    get valueAsNumber() { return Number(this.value); },
    get validity() { return { valid: this.value !== '' && Number.isFinite(Number(this.value)) && Number(this.value) >= 0, badInput: this.value === 'bad' }; },
    setAttribute(key, value) { this.attrs[key] = value; },
    removeAttribute(key) { delete this.attrs[key]; },
    addEventListener(name, callback) { this.events[name] = callback; },
    focus() { this.focused = true; }
  };
}
const ids = ['markup-form', 'markup-cost', 'markup-percentage', 'calculator-error', 'result-prompt', 'result-details', 'markup-profit-result', 'selling-price-result', 'markup-margin-result', 'result-note', 'load-markup-example'];
const elements = Object.fromEntries(ids.map(id => ['#' + id, element()]));
const context = vm.createContext({ document: { querySelector: id => elements[id] || null, querySelectorAll: () => [] }, window: { matchMedia: () => ({ matches: false }) }, Intl });
vm.runInContext(fs.readFileSync('script.js', 'utf8'), context);
const calculate = context.calculateMarkup;
for (const [cost, percentage, profit, price, margin] of [[100,25,25,125,20], [80,50,40,120,100/3], [100,150,150,250,60], [100,0,0,100,0], [12.5,12.5,1.5625,14.0625,100/9], [100,0.25,0.25,100.25,25/100.25]]) {
  const result = calculate(cost, percentage);
  assert.equal(result.profit, profit);
  assert.equal(result.sellingPrice, price);
  assert.ok(Math.abs(result.margin - margin) < 1e-10);
}
assert.equal(calculate(0,25).margin, null);
assert.equal(calculate(0,0).profit, 0);
for (const pair of [[-1,25], [100,-1], [Infinity,1], [1,NaN], [Number.MAX_VALUE,100]]) assert.throws(() => calculate(...pair));
const form = elements['#markup-form'];
function submit(cost, percentage) {
  elements['#markup-cost'].value = cost;
  elements['#markup-percentage'].value = percentage;
  form.events.submit({ preventDefault() {} });
}
form.requestSubmit = () => form.events.submit({ preventDefault() {} });
submit('100','25');
assert.equal(elements['#markup-profit-result'].textContent, '25.00');
assert.equal(elements['#selling-price-result'].textContent, '125.00');
assert.equal(elements['#markup-margin-result'].textContent, '20.00%');
assert.equal(elements['#result-details'].hidden, false);
submit('0','25');
assert.equal(elements['#markup-margin-result'].textContent, 'N/A');
assert.match(elements['#result-note'].textContent, /undefined/);
submit('','25');
assert.equal(elements['#markup-cost'].attrs['aria-invalid'], 'true');
assert.match(elements['#calculator-error'].textContent, /Enter cost/);
submit('100','-1');
assert.match(elements['#calculator-error'].textContent, /cannot be negative/);
assert.equal(elements['#result-details'].hidden, true);
submit('100','bad');
assert.match(elements['#calculator-error'].textContent, /must be a number/);
submit('1e308','100');
assert.match(elements['#calculator-error'].textContent, /too large/);
elements['#load-markup-example'].events.click();
assert.equal(elements['#selling-price-result'].textContent, '125.00');
assert.equal(elements['#result-details'].hidden, false);
form.events.input();
assert.equal(elements['#result-details'].hidden, true);
assert.equal(elements['#calculator-error'].hidden, true);
submit('100','25');
form.events.reset();
assert.equal(elements['#result-details'].hidden, true);
assert.equal(elements['#result-prompt'].hidden, false);
assert.equal(elements['#markup-cost'].focused, true);
console.log('PASS: markup formulas, percentage conversion, decimals, zero values, high markup, overflow, validation, example, input changes, and reset.');
