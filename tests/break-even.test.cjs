// Run with: node tests/break-even.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function element() {
  return {value:'',textContent:'',hidden:false,attrs:{},events:{},dataset:{},
    get valueAsNumber(){return Number(this.value);},
    get validity(){return {valid:this.value!==''&&Number.isFinite(Number(this.value))&&Number(this.value)>=0,badInput:this.value==='bad'};},
    setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},
    addEventListener(k,v){this.events[k]=v;},focus(){this.focused=true;}};
}
const ids=['break-even-form','fixed-costs','selling-price','variable-cost','calculator-error','result-prompt','result-details','break-even-units-result','break-even-revenue-result','contribution-result','result-note','load-break-even-example'];
const elements=Object.fromEntries(ids.map(id=>['#'+id,element()]));
const context=vm.createContext({document:{querySelector:id=>elements[id]||null,querySelectorAll:()=>[]},window:{matchMedia:()=>({matches:false})},Intl});
vm.runInContext(fs.readFileSync('script.js','utf8'),context);
for(const [fixed,price,variable,contribution,units,revenue] of [[10000,50,30,20,500,25000],[100,10,7,3,100/3,1000/3],[10.5,5.25,1.75,3.5,3,15.75],[100,20,30,-10,null,null],[100,30,30,0,null,null],[0,50,30,20,0,0],[0,30,30,0,0,0],[0,20,30,-10,0,0],[0,0,0,0,0,0],[100,0,0,0,null,null]]){
  const result=context.calculateBreakEven(fixed,price,variable);
  assert.equal(result.contribution,contribution);assert.equal(result.units,units);
  if(revenue===null)assert.equal(result.revenue,null);
  else assert.ok(Math.abs(result.revenue-revenue)<=1e-10*Math.max(1,Math.abs(revenue)));
}
for(const values of [[-1,10,5],[100,-1,5],[100,10,-1],[Infinity,10,5],[100,NaN,5],[100,10,Infinity],[Number.MAX_VALUE,Number.MIN_VALUE,0],[Number.MAX_VALUE,1e308,5e307]])assert.throws(()=>context.calculateBreakEven(...values));
const form=elements['#break-even-form'];
function submit(fixed,price,variable){elements['#fixed-costs'].value=fixed;elements['#selling-price'].value=price;elements['#variable-cost'].value=variable;form.events.submit({preventDefault(){}});}
form.requestSubmit=()=>form.events.submit({preventDefault(){}});
submit('10000','50','30');
assert.equal(elements['#break-even-units-result'].textContent,'500.00');assert.equal(elements['#break-even-revenue-result'].textContent,'25,000.00');assert.equal(elements['#contribution-result'].textContent,'20.00');
submit('100','10','7');assert.match(elements['#result-note'].textContent,/at least 34 whole units/);assert.equal(elements['#break-even-revenue-result'].textContent,'333.33');
submit('100','20','30');assert.equal(elements['#break-even-units-result'].textContent,'N/A');assert.match(elements['#result-note'].textContent,/negative/);assert.equal(elements['#result-details'].dataset.outcome,'loss');
submit('100','30','30');assert.equal(elements['#break-even-revenue-result'].textContent,'N/A');assert.match(elements['#result-note'].textContent,/margin is zero/);
submit('0','20','30');assert.equal(elements['#break-even-units-result'].textContent,'0.00');assert.match(elements['#result-note'].textContent,/positive sales volume creates a loss/);
submit('0','30','30');assert.match(elements['#result-note'].textContent,/all sales volumes/);
for(const [id,values] of [['fixed-costs',['','10','5']],['selling-price',['100','','5']],['variable-cost',['100','10','']]]){submit(...values);assert.equal(elements['#'+id].attrs['aria-invalid'],'true');assert.equal(elements['#result-details'].hidden,true);}
for(const values of [['-1','10','5'],['100','-1','5'],['100','10','-1']]){submit(...values);assert.match(elements['#calculator-error'].textContent,/cannot be negative/);}
submit('100','bad','5');assert.match(elements['#calculator-error'].textContent,/must be a number/);
submit('1e308','1e-308','0');assert.match(elements['#calculator-error'].textContent,/too large/);
elements['#load-break-even-example'].events.click();assert.equal(elements['#break-even-units-result'].textContent,'500.00');assert.equal(elements['#result-details'].hidden,false);
form.events.input();assert.equal(elements['#result-details'].hidden,true);assert.equal(elements['#calculator-error'].hidden,true);
submit('100','10','5');form.events.reset();assert.equal(elements['#result-details'].hidden,true);assert.equal(elements['#result-prompt'].hidden,false);assert.equal(elements['#fixed-costs'].focused,true);
console.log('PASS: break even formulas, fractional targets, negative/zero contribution, zero fixed costs, invalid inputs, overflow, example, input changes, and reset.');
