// Run with: node tests/profit-margin.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function element(value = '') {
  return { value, hidden: false, textContent: '', attributes: {}, listeners: {}, dataset: {},
    get valueAsNumber() { return Number(this.value); },
    get validity() { return { valid: this.value !== '' && Number.isFinite(Number(this.value)) && Number(this.value) >= 0 }; },
    setAttribute(key, value) { this.attributes[key] = value; },
    removeAttribute(key) { delete this.attributes[key]; },
    addEventListener(key, callback) { this.listeners[key] = callback; },
    focus() { this.focused = true; }
  };
}
const ids = ['profit-margin-form', 'revenue', 'cost', 'calculator-error', 'result-prompt', 'result-details', 'profit-result', 'margin-result', 'markup-result', 'result-note', 'load-example'];
const elements = Object.fromEntries(ids.map((id) => [`#${id}`, element()]));
elements['#revenue'].name = 'revenue';
elements['#cost'].name = 'cost';
const context = vm.createContext({
  document: { querySelector: (id) => elements[id] || null, querySelectorAll: () => [] },
  window: { matchMedia: () => ({ matches: false }) }, Intl
});
vm.runInContext(fs.readFileSync('script.js', 'utf8'), context);
const calculate = context.calculateProfitMargin;
assert.equal(calculate(10000, 7000).profit, 3000);
assert.equal(calculate(10000, 7000).margin, 30);
assert.ok(Math.abs(calculate(10000, 7000).markup - 42.857142857) < 1e-8);
assert.equal(calculate(100, 150).margin, -50);
assert.equal(calculate(100, 100).markup, 0);
assert.equal(calculate(0, 10).margin, null);
assert.equal(calculate(10, 0).markup, null);
assert.equal(calculate(0, 0).profit, 0);
assert.ok(Math.abs(calculate(10.5, 7.25).profit - 3.25) < 1e-10);
for (const pair of [[-1, 1], [1, -1], [Infinity, 1], [1, NaN], [Number.MAX_VALUE, Number.MIN_VALUE]]) {
  assert.throws(() => calculate(...pair));
}
const form = elements['#profit-margin-form'];
form.requestSubmit = () => form.listeners.submit({ preventDefault() {} });
function submit(revenue, cost) {
  elements['#revenue'].value = revenue;
  elements['#cost'].value = cost;
  form.listeners.submit({ preventDefault() {} });
}
submit('10000', '7000');
assert.equal(elements['#profit-result'].textContent, '3,000.00');
assert.equal(elements['#margin-result'].textContent, '30.00%');
assert.equal(elements['#markup-result'].textContent, '42.86%');
assert.equal(elements['#result-details'].hidden, false);
submit('0', '0');
assert.equal(elements['#margin-result'].textContent, 'N/A');
assert.equal(elements['#markup-result'].textContent, 'N/A');
submit('', '20');
assert.equal(elements['#calculator-error'].hidden, false);
assert.equal(elements['#revenue'].attributes['aria-invalid'], 'true');
assert.match(elements['#calculator-error'].textContent, /Enter revenue/);
assert.equal(elements['#result-details'].hidden, true);
submit('100', '-20');
assert.equal(elements['#cost'].attributes['aria-invalid'], 'true');
assert.match(elements['#calculator-error'].textContent, /cannot be negative/);
submit('100', '150');
assert.match(elements['#result-note'].textContent, /loss/);
form.listeners.input();
assert.equal(elements['#result-details'].hidden, true);
assert.equal(elements['#calculator-error'].hidden, true);
submit('100', '70');
form.listeners.reset();
assert.equal(elements['#result-details'].hidden, true);
assert.equal(elements['#result-prompt'].hidden, false);
assert.equal(elements['#revenue'].focused, true);
elements['#load-example'].listeners.click();
assert.equal(elements['#revenue'].value, '10000');
assert.equal(elements['#cost'].value, '7000');
assert.equal(elements['#margin-result'].textContent, '30.00%');
assert.equal(elements['#result-details'].hidden, false);
// Shared script must also run on pages without a calculator.
vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), {
  document: { querySelector: () => null, querySelectorAll: () => [] },
  window: { matchMedia: () => ({ matches: false }) }, Intl
});
console.log('PASS: formulas, rounding, losses, zero denominators, invalid inputs, input changes, reset, and other pages.');
