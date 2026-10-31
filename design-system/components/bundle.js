/* @ds-bundle: {"format":4,"namespace":"ELC","components":[{"name":"Button"},{"name":"Badge"},{"name":"Field"},{"name":"Chip"},{"name":"Card"},{"name":"Stepper"}]} */
(function () {
  var R = window.React;
  var h = R.createElement;
  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) { if (arguments[i]) out.push(arguments[i]); }
    return out.join(' ');
  }
  function omit(obj, keys) {
    var o = {};
    for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) o[k] = obj[k]; }
    return o;
  }

  function Button(p) {
    var variant = p.variant || 'primary';
    var size = p.size || 'md';
    var cls = cx('elc-btn', 'elc-btn-' + variant, 'elc-btn-' + size, p.block ? 'elc-btn-block' : '', p.className);
    var rest = omit(p, ['variant', 'size', 'block', 'className', 'children', 'href']);
    if (p.href) return h('a', Object.assign({}, rest, { href: p.href, className: cls }), p.children);
    return h('button', Object.assign({ type: 'button' }, rest, { className: cls }), p.children);
  }

  function Badge(p) {
    var tone = p.tone || 'neutral';
    return h('span', { className: cx('elc-badge', 'elc-badge-' + tone, p.className) }, p.children);
  }

  var fieldCount = 0;
  function Field(p) {
    var idRef = R.useRef(null);
    if (!idRef.current) { fieldCount += 1; idRef.current = p.id || 'elc-field-' + fieldCount; }
    var id = idRef.current;
    var hintId = p.hint ? id + '-hint' : undefined;
    var errId = p.error ? id + '-err' : undefined;
    var describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
    var rest = omit(p, ['label', 'hint', 'error', 'optional', 'multiline', 'className', 'id']);
    var control = h(p.multiline ? 'textarea' : 'input', Object.assign({
      id: id,
      className: cx('elc-input', p.error ? 'elc-input-error' : ''),
      'aria-invalid': p.error ? 'true' : undefined,
      'aria-describedby': describedBy
    }, p.multiline ? { rows: 4 } : { type: p.type || 'text' }, rest));
    return h('div', { className: cx('elc-field', p.className) },
      h('label', { htmlFor: id, className: 'elc-label' },
        p.label,
        p.required ? h('span', { className: 'elc-req', 'aria-hidden': 'true' }, ' *') : null,
        p.optional ? h('span', { className: 'elc-opt' }, ' (optional)') : null),
      control,
      p.hint ? h('span', { id: hintId, className: 'elc-hint' }, p.hint) : null,
      p.error ? h('span', { id: errId, className: 'elc-error', role: 'alert' }, p.error) : null);
  }

  function Chip(p) {
    var rest = omit(p, ['label', 'multiple', 'className', 'children']);
    return h('label', { className: cx('elc-chip', p.className) },
      h('input', Object.assign({ type: p.multiple ? 'checkbox' : 'radio' }, rest)),
      h('span', null, p.label || p.children));
  }

  function Card(p) {
    var tone = p.tone || 'light';
    var inner = [
      p.eyebrow ? h('span', { key: 'e', className: 'elc-card-eyebrow' }, p.eyebrow) : null,
      h('strong', { key: 't', className: 'elc-card-title' }, p.title),
      p.children ? h('span', { key: 'b', className: 'elc-card-body' }, p.children) : null,
      p.action ? h('span', { key: 'a', className: 'elc-card-action' }, p.action) : null
    ];
    var cls = cx('elc-card', 'elc-card-' + tone, p.className);
    if (p.href) return h('a', { href: p.href, className: cls }, inner);
    return h('div', { className: cls }, inner);
  }

  function Stepper(p) {
    var steps = p.steps || [];
    var current = p.current || 0;
    var pct = steps.length ? Math.round(((current + 1) / steps.length) * 100) : 0;
    return h('div', { className: cx('elc-stepper', p.className) },
      h('div', { className: 'elc-stepper-head' },
        h('strong', null, (p.title ? p.title + ' · ' : '') + 'Step ' + (current + 1) + ' of ' + steps.length),
        p.note ? h('span', null, p.note) : null),
      h('div', { className: 'elc-stepper-track', 'aria-hidden': 'true' }, h('div', { className: 'elc-stepper-fill', style: { width: pct + '%' } })),
      h('ol', { className: 'elc-stepper-list' }, steps.map(function (s, i) {
        var state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return h('li', { key: i, className: 'elc-step elc-step-' + state, 'aria-current': i === current ? 'step' : undefined },
          (i < current ? '✓ ' : (i + 1) + '. ') + s);
      })));
  }

  var lib = { Button: Button, Badge: Badge, Field: Field, Chip: Chip, Card: Card, Stepper: Stepper };
  window.ELC = Object.assign(window.ELC || {}, lib);
})();
