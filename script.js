// Shared navigation behavior and page-specific calculators.
'use strict';

// Shared display formatting preserves precision until the final output.
const calculatorNumberFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function formatCalculatorNumber(value) {
  return calculatorNumberFormat.format(Math.abs(value) < 0.005 ? 0 : value);
}
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');
const mobileQuery = window.matchMedia('(max-width: 640px)');
if (menuButton && navigation) {
  menuButton.hidden = false;
  const syncNavigation = () => {
    navigation.dataset.collapsed = String(mobileQuery.matches);
    menuButton.setAttribute('aria-expanded', String(!mobileQuery.matches));
  };
  syncNavigation();
  mobileQuery.addEventListener('change', syncNavigation);
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(expanded));
    navigation.dataset.collapsed = String(!expanded);
  });
  navigation.addEventListener('click', (event) => {
    if (mobileQuery.matches && event.target.closest('a')) syncNavigation();
  });
  navigation.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileQuery.matches) {
      syncNavigation();
      menuButton.focus();
    }
  });
}
document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

// Null percentages represent undefined ratios when the denominator is zero.
function calculateProfitMargin(revenue, cost) {
  if (!Number.isFinite(revenue) || !Number.isFinite(cost) || revenue < 0 || cost < 0) {
    throw new RangeError('Revenue and cost must be finite, nonnegative numbers.');
  }
  const profit = revenue - cost;
  const margin = revenue === 0 ? null : (profit / revenue) * 100;
  const markup = cost === 0 ? null : (profit / cost) * 100;
  if ([profit, margin, markup].some((value) => value !== null && !Number.isFinite(value))) {
    throw new RangeError('These amounts produce a result that is too large. Use smaller amounts or less extreme ratios.');
  }
  return { profit, margin, markup };
}

const profitForm = document.querySelector('#profit-margin-form');
if (profitForm) {
  const revenueInput = document.querySelector('#revenue');
  const costInput = document.querySelector('#cost');
  const error = document.querySelector('#calculator-error');
  const prompt = document.querySelector('#result-prompt');
  const details = document.querySelector('#result-details');
  const format = formatCalculatorNumber;
  const clearResults = () => {
    details.hidden = true;
    prompt.hidden = false;
    error.hidden = true;
    error.textContent = '';
    revenueInput.removeAttribute('aria-invalid');
    costInput.removeAttribute('aria-invalid');
  };
  profitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearResults();
    for (const input of [revenueInput, costInput]) {
      if (input.value.trim() === '' || !input.validity.valid || !Number.isFinite(input.valueAsNumber)) {
        const label = input.name === 'revenue' ? 'Revenue' : 'Cost';
        if (input.validity.badInput) {
          error.textContent = `${label} must be a number, such as 10000 or 10000.50. Leave out commas and currency symbols.`;
        } else if (input.value.trim() === '') {
          error.textContent = `Enter ${input.name} to calculate your results. Try 10000 for revenue and 7000 for cost, or select the example button.`;
        } else if (input.valueAsNumber < 0) {
          error.textContent = `${label} cannot be negative. Enter zero or a positive amount; a loss is calculated when cost exceeds revenue.`;
        } else {
          error.textContent = `${label} must be a finite, zero or positive number. Leave out commas and currency symbols.`;
        }
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
    }
    try {
      const { profit, margin, markup } = calculateProfitMargin(revenueInput.valueAsNumber, costInput.valueAsNumber);
      document.querySelector('#profit-result').textContent = format(profit);
      document.querySelector('#margin-result').textContent = margin === null ? 'N/A' : `${format(margin)}%`;
      document.querySelector('#markup-result').textContent = markup === null ? 'N/A' : `${format(markup)}%`;
      const notes = ['Profit is in the same currency as your inputs. Results are rounded to two decimal places.'];
      if (profit < 0) notes.push('Your costs exceed your revenue, resulting in a loss.');
      if (margin === null) notes.push('Profit margin is undefined because revenue is zero.');
      if (markup === null) notes.push('Markup is undefined because cost is zero.');
      document.querySelector('#result-note').textContent = notes.join(' ');
      details.dataset.outcome = profit < 0 ? 'loss' : 'profit';
      prompt.hidden = true;
      details.hidden = false;
    } catch (exception) {
      error.textContent = exception.message;
      error.hidden = false;
    }
  });
  profitForm.addEventListener('input', clearResults);
  profitForm.addEventListener('reset', () => {
    clearResults();
    revenueInput.focus();
  });
  const exampleButton = document.querySelector('#load-example');
  if (exampleButton) {
    exampleButton.addEventListener('click', () => {
      revenueInput.value = '10000';
      costInput.value = '7000';
      profitForm.requestSubmit();
    });
  }
}

// Percentage inputs use whole percentage points: 25 means a rate of 0.25.
function calculateMarkup(cost, markupPercentage) {
  if (!Number.isFinite(cost) || !Number.isFinite(markupPercentage) || cost < 0 || markupPercentage < 0) {
    throw new RangeError('Cost and markup percentage must be finite, zero or positive numbers.');
  }
  const profit = cost * (markupPercentage / 100);
  const sellingPrice = cost + profit;
  const margin = sellingPrice === 0 ? null : (profit / sellingPrice) * 100;
  if ([profit, sellingPrice, margin].some((value) => value !== null && !Number.isFinite(value))) {
    throw new RangeError('These inputs produce amounts that are too large. Enter a smaller cost or markup percentage.');
  }
  return { profit, sellingPrice, margin };
}

const markupForm = document.querySelector('#markup-form');
if (markupForm) {
  const costInput = document.querySelector('#markup-cost');
  const percentageInput = document.querySelector('#markup-percentage');
  const error = document.querySelector('#calculator-error');
  const prompt = document.querySelector('#result-prompt');
  const details = document.querySelector('#result-details');
  const clearResults = () => {
    details.hidden = true;
    prompt.hidden = false;
    error.hidden = true;
    error.textContent = '';
    for (const input of [costInput, percentageInput]) input.removeAttribute('aria-invalid');
  };
  markupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearResults();
    for (const input of [costInput, percentageInput]) {
      if (input.value.trim() === '' || !input.validity.valid || !Number.isFinite(input.valueAsNumber)) {
        const label = input === costInput ? 'Cost' : 'Markup percentage';
        if (input.validity.badInput) {
          error.textContent = `${label} must be a number. Leave out commas, currency symbols, and the percent sign.`;
        } else if (input.value.trim() === '') {
          error.textContent = `Enter ${label.toLowerCase()} to calculate. Try a cost of 100 and a markup of 25, or select the example button.`;
        } else if (input.valueAsNumber < 0) {
          error.textContent = `${label} cannot be negative. Enter zero or a positive number.`;
        } else {
          error.textContent = `${label} must be a finite, zero or positive number. Enter 25 for a 25% markup.`;
        }
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
    }
    try {
      const { profit, sellingPrice, margin } = calculateMarkup(costInput.valueAsNumber, percentageInput.valueAsNumber);
      document.querySelector('#markup-profit-result').textContent = formatCalculatorNumber(profit);
      document.querySelector('#selling-price-result').textContent = formatCalculatorNumber(sellingPrice);
      document.querySelector('#markup-margin-result').textContent = margin === null ? 'N/A' : `${formatCalculatorNumber(margin)}%`;
      const notes = ['Profit and selling price use the same currency as your cost. Results are rounded to two decimal places.'];
      if (margin === null) notes.push('Profit margin is undefined because selling price is zero.');
      notes.push('Expenses excluded from your cost are not included in this profit amount.');
      document.querySelector('#result-note').textContent = notes.join(' ');
      prompt.hidden = true;
      details.hidden = false;
    } catch (exception) {
      error.textContent = exception.message;
      error.hidden = false;
    }
  });
  markupForm.addEventListener('input', clearResults);
  markupForm.addEventListener('reset', () => {
    clearResults();
    costInput.focus();
  });
  const exampleButton = document.querySelector('#load-markup-example');
  if (exampleButton) {
    exampleButton.addEventListener('click', () => {
      costInput.value = '100';
      percentageInput.value = '25';
      markupForm.requestSubmit();
    });
  }
}

// Final return includes recovered capital and may be negative for a net outflow.
function calculateROI(initialInvestment, finalReturn) {
  if (!Number.isFinite(initialInvestment) || initialInvestment < 0 || !Number.isFinite(finalReturn)) {
    throw new RangeError('Initial investment must be zero or positive, and final return must be a finite number.');
  }
  const profit = finalReturn - initialInvestment;
  const roi = initialInvestment === 0 ? null : (profit / initialInvestment) * 100;
  if (!Number.isFinite(profit) || (roi !== null && !Number.isFinite(roi))) {
    throw new RangeError('These inputs produce a result that is too large. Use smaller amounts or a less extreme ratio.');
  }
  return { profit, roi };
}

const roiForm = document.querySelector('#roi-form');
if (roiForm) {
  const investmentInput = document.querySelector('#initial-investment');
  const returnInput = document.querySelector('#final-return');
  const error = document.querySelector('#calculator-error');
  const prompt = document.querySelector('#result-prompt');
  const details = document.querySelector('#result-details');
  const clearResults = () => {
    details.hidden = true;
    prompt.hidden = false;
    error.hidden = true;
    error.textContent = '';
    for (const input of [investmentInput, returnInput]) input.removeAttribute('aria-invalid');
  };
  roiForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearResults();
    for (const input of [investmentInput, returnInput]) {
      if (input.value.trim() === '' || !input.validity.valid || !Number.isFinite(input.valueAsNumber)) {
        const label = input === investmentInput ? 'Initial investment' : 'Final return';
        if (input.validity.badInput) {
          error.textContent = `${label} must be a number. Leave out commas and currency symbols.`;
        } else if (input.value.trim() === '') {
          error.textContent = `Enter ${label.toLowerCase()} to calculate. Try 10000 invested and 12500 returned, or select the example button.`;
        } else if (input === investmentInput && input.valueAsNumber < 0) {
          error.textContent = 'Initial investment cannot be negative. Enter zero or a positive amount. A negative final return is allowed.';
        } else {
          error.textContent = `${label} must be a finite number. Use zero or a positive amount for initial investment.`;
        }
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
    }
    try {
      const { profit, roi } = calculateROI(investmentInput.valueAsNumber, returnInput.valueAsNumber);
      document.querySelector('#roi-profit-result').textContent = formatCalculatorNumber(profit);
      document.querySelector('#roi-percentage-result').textContent = roi === null ? 'N/A' : `${formatCalculatorNumber(roi)}%`;
      const notes = ['Profit uses the same currency as your inputs. Results are rounded to two decimal places.'];
      if (profit < 0) notes.push('Final return is below initial investment, resulting in a loss.');
      if (roi === null) notes.push('ROI is undefined because initial investment is zero.');
      if (roi === 0) notes.push('Final return equals initial investment: the investment breaks even.');
      notes.push('This is simple ROI for your chosen period, not an annualized return.');
      document.querySelector('#result-note').textContent = notes.join(' ');
      details.dataset.outcome = profit < 0 ? 'loss' : 'profit';
      prompt.hidden = true;
      details.hidden = false;
    } catch (exception) {
      error.textContent = exception.message;
      error.hidden = false;
    }
  });
  roiForm.addEventListener('input', clearResults);
  roiForm.addEventListener('reset', () => {
    clearResults();
    investmentInput.focus();
  });
  const exampleButton = document.querySelector('#load-roi-example');
  if (exampleButton) {
    exampleButton.addEventListener('click', () => {
      investmentInput.value = '10000';
      returnInput.value = '12500';
      roiForm.requestSubmit();
    });
  }
}

// ROAS measures attributed revenue; this profit excludes costs other than ads.
function calculateROAS(advertisingSpend, revenueGenerated) {
  if (!Number.isFinite(advertisingSpend) || !Number.isFinite(revenueGenerated) || advertisingSpend < 0 || revenueGenerated < 0) {
    throw new RangeError('Advertising spend and revenue generated must be finite, zero or positive numbers.');
  }
  const ratio = advertisingSpend === 0 ? null : revenueGenerated / advertisingSpend;
  const percentage = ratio === null ? null : ratio * 100;
  const profit = revenueGenerated - advertisingSpend;
  if ([ratio, percentage, profit].some(value => value !== null && !Number.isFinite(value))) {
    throw new RangeError('These inputs produce a result that is too large. Use smaller amounts or a less extreme revenue-to-spend ratio.');
  }
  return { ratio, percentage, profit };
}

const roasForm = document.querySelector('#roas-form');
if (roasForm) {
  const spendInput = document.querySelector('#advertising-spend');
  const revenueInput = document.querySelector('#revenue-generated');
  const error = document.querySelector('#calculator-error');
  const prompt = document.querySelector('#result-prompt');
  const details = document.querySelector('#result-details');
  const clearResults = () => {
    details.hidden = true;
    prompt.hidden = false;
    error.hidden = true;
    error.textContent = '';
    for (const input of [spendInput, revenueInput]) input.removeAttribute('aria-invalid');
  };
  roasForm.addEventListener('submit', event => {
    event.preventDefault();
    clearResults();
    for (const input of [spendInput, revenueInput]) {
      if (input.value.trim() === '' || !input.validity.valid || !Number.isFinite(input.valueAsNumber)) {
        const label = input === spendInput ? 'Advertising spend' : 'Revenue generated';
        if (input.validity.badInput) {
          error.textContent = `${label} must be a number. Leave out commas and currency symbols.`;
        } else if (input.value.trim() === '') {
          error.textContent = `Enter ${label.toLowerCase()} to calculate. Try 1000 in ad spend and 4000 in revenue, or select the example button.`;
        } else if (input.valueAsNumber < 0) {
          error.textContent = `${label} cannot be negative. Enter zero or a positive amount.`;
        } else {
          error.textContent = `${label} must be a finite, zero or positive number.`;
        }
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
    }
    try {
      const { ratio, percentage, profit } = calculateROAS(spendInput.valueAsNumber, revenueInput.valueAsNumber);
      document.querySelector('#roas-ratio-result').textContent = ratio === null ? 'N/A' : `${formatCalculatorNumber(ratio)}x`;
      document.querySelector('#roas-percentage-result').textContent = percentage === null ? 'N/A' : `${formatCalculatorNumber(percentage)}%`;
      document.querySelector('#roas-profit-result').textContent = formatCalculatorNumber(profit);
      const notes = ['Profit uses your input currency and subtracts advertising spend only. Other business costs are excluded. Results are rounded to two decimal places.'];
      if (ratio === null) notes.push('ROAS ratio and percentage are undefined because advertising spend is zero.');
      else {
        notes.push(`Each unit of ad spend generated ${formatCalculatorNumber(ratio)} units of attributed revenue.`);
        if (ratio < 1) notes.push('Revenue is below ad spend, resulting in a loss before other costs.');
        if (ratio === 1) notes.push('Revenue covers ad spend only; other costs still need to be covered.');
      }
      document.querySelector('#result-note').textContent = notes.join(' ');
      details.dataset.outcome = profit < 0 ? 'loss' : 'profit';
      prompt.hidden = true;
      details.hidden = false;
    } catch (exception) {
      error.textContent = exception.message;
      error.hidden = false;
    }
  });
  roasForm.addEventListener('input', clearResults);
  roasForm.addEventListener('reset', () => {
    clearResults();
    spendInput.focus();
  });
  const exampleButton = document.querySelector('#load-roas-example');
  if (exampleButton) {
    exampleButton.addEventListener('click', () => {
      spendInput.value = '1000';
      revenueInput.value = '4000';
      roasForm.requestSubmit();
    });
  }
}

// A nonpositive contribution cannot recover positive fixed costs through sales.
function calculateBreakEven(fixedCosts, sellingPrice, variableCost) {
  if ([fixedCosts, sellingPrice, variableCost].some(value => !Number.isFinite(value) || value < 0)) {
    throw new RangeError('Fixed costs, selling price, and variable cost must be finite, zero or positive numbers.');
  }
  const contribution = sellingPrice - variableCost;
  const units = fixedCosts === 0 ? 0 : contribution <= 0 ? null : fixedCosts / contribution;
  const revenue = units === null ? null : units * sellingPrice;
  if ([contribution, units, revenue].some(value => value !== null && !Number.isFinite(value))) {
    throw new RangeError('These inputs produce a result that is too large. Use smaller costs or a less extreme contribution margin.');
  }
  return { contribution, units, revenue };
}

const breakEvenForm = document.querySelector('#break-even-form');
if (breakEvenForm) {
  const fixedInput = document.querySelector('#fixed-costs');
  const priceInput = document.querySelector('#selling-price');
  const variableInput = document.querySelector('#variable-cost');
  const inputs = [fixedInput, priceInput, variableInput];
  const labels = ['Fixed costs', 'Selling price per unit', 'Variable cost per unit'];
  const error = document.querySelector('#calculator-error');
  const prompt = document.querySelector('#result-prompt');
  const details = document.querySelector('#result-details');
  const clearResults = () => {
    details.hidden = true;
    prompt.hidden = false;
    error.hidden = true;
    error.textContent = '';
    for (const input of inputs) input.removeAttribute('aria-invalid');
  };
  breakEvenForm.addEventListener('submit', event => {
    event.preventDefault();
    clearResults();
    for (const [index, input] of inputs.entries()) {
      if (input.value.trim() === '' || !input.validity.valid || !Number.isFinite(input.valueAsNumber)) {
        const label = labels[index];
        if (input.validity.badInput) error.textContent = `${label} must be a number. Leave out commas and currency symbols.`;
        else if (input.value.trim() === '') error.textContent = `Enter ${label.toLowerCase()} to calculate, or select the example button.`;
        else if (input.valueAsNumber < 0) error.textContent = `${label} cannot be negative. Enter zero or a positive amount.`;
        else error.textContent = `${label} must be a finite, zero or positive number.`;
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
    }
    try {
      const { contribution, units, revenue } = calculateBreakEven(fixedInput.valueAsNumber, priceInput.valueAsNumber, variableInput.valueAsNumber);
      document.querySelector('#break-even-units-result').textContent = units === null ? 'N/A' : formatCalculatorNumber(units);
      document.querySelector('#break-even-revenue-result').textContent = revenue === null ? 'N/A' : formatCalculatorNumber(revenue);
      document.querySelector('#contribution-result').textContent = formatCalculatorNumber(contribution);
      const notes = ['Revenue and contribution use your input currency. Results are rounded to two decimal places; revenue uses the unrounded theoretical unit quantity.'];
      if (units === null) {
        notes.push(contribution === 0
          ? 'Contribution margin is zero. Sales contribute nothing toward positive fixed costs, so there is no break even sales target.'
          : 'Contribution margin is negative. Each sale increases the loss, so no nonnegative sales volume covers positive fixed costs.');
      } else if (fixedInput.valueAsNumber === 0) {
        notes.push('With zero fixed costs, zero sales is the break even point.');
        if (contribution < 0) notes.push('Any positive sales volume creates a loss because contribution margin is negative.');
        if (contribution === 0) notes.push('With zero contribution margin, all sales volumes also break even in this model.');
      } else if (Number.isSafeInteger(Math.ceil(units))) {
        notes.push(`For indivisible products, sell at least ${Math.ceil(units).toLocaleString('en-US')} whole units to cover these costs.`);
      } else {
        notes.push('This quantity exceeds reliable whole-unit precision. Use a smaller planning scope before setting a whole-unit target.');
      }
      notes.push('Profit Per Unit is contribution before fixed costs, not net profit.');
      document.querySelector('#result-note').textContent = notes.join(' ');
      details.dataset.outcome = contribution < 0 ? 'loss' : 'profit';
      prompt.hidden = true;
      details.hidden = false;
    } catch (exception) {
      error.textContent = exception.message;
      error.hidden = false;
    }
  });
  breakEvenForm.addEventListener('input', clearResults);
  breakEvenForm.addEventListener('reset', () => {
    clearResults();
    fixedInput.focus();
  });
  const exampleButton = document.querySelector('#load-break-even-example');
  if (exampleButton) {
    exampleButton.addEventListener('click', () => {
      fixedInput.value = '10000';
      priceInput.value = '50';
      variableInput.value = '30';
      breakEvenForm.requestSubmit();
    });
  }
}
