// Display-only localization. Calculator formulas, inputs, state, and numeric output stay untouched.
'use strict';
(() => {
  const catalogElement = document.getElementById('calculator-translations');
  if (!catalogElement) return;
  const catalog = JSON.parse(catalogElement.textContent);
  const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rules = Object.entries(catalog.messages)
    .sort(([a], [b]) => b.length - a.length)
    .map(([source, translation]) => {
      const tokens = [];
      const pattern = source.split(/(\{(?:label|value)\})/).map(part => {
        if (part === '{label}') {
          tokens.push('label');
          return '(' + Object.keys(catalog.labels).sort((a, b) => b.length - a.length).map(escapeRegex).join('|') + ')';
        }
        if (part === '{value}') {
          tokens.push('value');
          return '([0-9,.+\\-]+)';
        }
        return escapeRegex(part);
      }).join('');
      return { pattern: new RegExp(pattern, 'g'), translation, tokens };
    });
  const translate = text => {
    for (const rule of rules) {
      text = text.replace(rule.pattern, (...matches) => {
        let output = rule.translation;
        rule.tokens.forEach((token, index) => {
          const value = matches[index + 1];
          output = output.replace('{' + token + '}', token === 'label' ? catalog.labels[value] : value);
        });
        return output;
      });
    }
    return text;
  };
  for (const id of ['calculator-error', 'result-note']) {
    const element = document.getElementById(id);
    if (!element) continue;
    const update = () => {
      const translated = translate(element.textContent);
      if (translated !== element.textContent) element.textContent = translated;
    };
    new MutationObserver(update).observe(element, { childList: true, characterData: true, subtree: true });
    update();
  }
})();
