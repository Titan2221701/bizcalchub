// Run with: node tests/roi.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function element(allowNegative = false) {
  return { value: '', textContent: '', hidden: false, attrs: {}, events: {}, dataset: {},
    get valueAsNumber() { return Number(this.value); },
    get validity() { return { valid: this.value !== '' && Number.isFinite(Number(this.value)) && (allowNegative || Number(this.value) >= 0), badInput: this.value === 'bad' }; },
    setAttribute(key, value) { this.attrs[key] = value; },
    removeAttribute(key) { delete this.attrs[key]; },
    addEventListener(name, callback) { this.events[name] = callback; },
    focus() { this.focused = true; }
  };
}
const ids = ['roi-form', 'initial-investment', 'final-return', 'calculator-error', 'result-prompt', 'result-details', 'roi-profit-result', 'roi-percentage-result', 'result-note', 'load-roi-example'];
const elements = Object.fromEntries(ids.map(id => ['#' + id, element(id === 'final-return')]));
const context = vm.createContext({ document: { querySelector: id => elements[id] || null, querySelectorAll: () => [] }, window: { matchMedia: () => ({ matches: false }) }, Intl });
vm.runInContext(fs.readFileSync('script.js', 'utf8'), context);
for (const [investment, finalReturn, profit, roi] of [[10000,12500,2500,25], [1000,800,-200,-20], [1000,0,-1000,-100], [1000,-200,-1200,-120], [1000,1000,0,0], [12.5,15.625,3.125,25], [0,100,100,null], [0,0,0,null], [0,-100,-100,null]]) {
  const result = context.calculateROI(investment, finalReturn);
  assert.equal(result.profit, profit);
  assert.equal(result.roi, roi);
}
for (const pair of [[-1,100], [Infinity,1], [1,NaN], [Number.MIN_VALUE,1], [Number.MAX_VALUE,-Number.MAX_VALUE]]) assert.throws(() => context.calculateROI(...pair));
const form = elements['#roi-form'];
function submit(investment, finalReturn) {
  elements['#initial-investment'].value = investment;
  elements['#final-return'].value = finalReturn;
  form.events.submit({ preventDefault() {} });
}
form.requestSubmit = () => form.events.submit({ preventDefault() {} });
submit('10000','12500');
assert.equal(elements['#roi-profit-result'].textContent, '2,500.00');
assert.equal(elements['#roi-percentage-result'].textContent, '25.00%');
assert.equal(elements['#result-details'].hidden, false);
submit('1000','-200');
assert.equal(elements['#roi-percentage-result'].textContent, '-120.00%');
assert.equal(elements['#result-details'].dataset.outcome, 'loss');
assert.match(elements['#result-note'].textContent, /loss/);
submit('0','100');
assert.equal(elements['#roi-profit-result'].textContent, '100.00');
assert.equal(elements['#roi-percentage-result'].textContent, 'N/A');
assert.match(elements['#result-note'].textContent, /undefined/);
submit('100','100');
assert.match(elements['#result-note'].textContent, /breaks even/);
submit('','100');
assert.match(elements['#calculator-error'].textContent, /Enter initial investment/);
assert.equal(elements['#initial-investment'].attrs['aria-invalid'], 'true');
submit('100','');
assert.equal(elements['#final-return'].attrs['aria-invalid'], 'true');
submit('-100','100');
assert.match(elements['#calculator-error'].textContent, /cannot be negative/);
submit('100','bad');
assert.match(elements['#calculator-error'].textContent, /must be a number/);
submit('1e-308','1e308');
assert.match(elements['#calculator-error'].textContent, /too large/);
assert.equal(elements['#result-details'].hidden, true);
elements['#load-roi-example'].events.click();
assert.equal(elements['#roi-percentage-result'].textContent, '25.00%');
form.events.input();
assert.equal(elements['#result-details'].hidden, true);
assert.equal(elements['#calculator-error'].hidden, true);
submit('100','120');
form.events.reset();
assert.equal(elements['#result-details'].hidden, true);
assert.equal(elements['#result-prompt'].hidden, false);
assert.equal(elements['#initial-investment'].focused, true);
console.log('PASS: ROI formulas, losses, signed negative returns, zero investment, decimals, overflow, validation, example, input changes, and reset.');
