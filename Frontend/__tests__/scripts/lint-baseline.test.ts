import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectErrors, compareBaseline, createBaseline } from '../../scripts/lint-baseline.mjs';

const root = resolve('fixture-project');
function errors(source = 'bad()', line = 1, severity = 2, fatal = false) {
  return collectErrors([{
    filePath: resolve(root, 'src/example.ts'), source,
    messages: [{ severity, fatal, ruleId: 'example/rule', messageId: 'invalid', message: 'Invalid call', line }],
  }], root);
}

describe('baseline de ESLint', () => {
  it('acepta únicamente los errores registrados, aunque cambien sus números de línea', () => {
    const baseline = createBaseline(errors());
    expect(compareBaseline(errors('\n\nbad()', 3), baseline).newErrors).toEqual([]);
  });
  it('bloquea un error que cambia de código o aparece en otro archivo', () => {
    const baseline = createBaseline(errors());
    expect(compareBaseline(errors('anotherBadCall()'), baseline).newErrors).toHaveLength(1);
    const moved = errors().map(error => ({ ...error, file: 'src/another.ts' }));
    expect(compareBaseline(moved, baseline).newErrors).toHaveLength(1);
  });
  it('bloquea otra ocurrencia idéntica que exceda la cantidad registrada', () => {
    const original = errors();
    expect(compareBaseline([...original, ...original], createBaseline(original)).newErrors).toHaveLength(1);
  });
  it('no admite errores sintácticos ni siquiera si coinciden con una entrada', () => {
    expect(() => createBaseline(errors('bad()', 1, 2, true))).toThrow();
    expect(compareBaseline(errors('bad()', 1, 2, true), createBaseline(errors())).newErrors).toHaveLength(1);
  });
  it('reporta la deuda resuelta y no incorpora advertencias al baseline', () => {
    expect(compareBaseline([], createBaseline(errors())).resolvedCount).toBe(1);
    expect(errors('bad()', 1, 1)).toEqual([]);
  });
  it('rechaza entradas mal formadas o repetidas', () => {
    expect(() => compareBaseline([], { version: 99, entries: [] })).toThrow();
    const baseline = createBaseline(errors());
    expect(() => compareBaseline([], { ...baseline, entries: [...baseline.entries, ...baseline.entries] })).toThrow();
  });
});
