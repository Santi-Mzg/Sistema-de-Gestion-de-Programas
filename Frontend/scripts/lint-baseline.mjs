import { createHash } from 'node:crypto';
import { relative, sep } from 'node:path';

/** @typedef {{file: string, rule: string, message: string, sourceHash: string, fatal: boolean, line: number, description: string}} LintError */

/**
 * Identifica errores por código y regla, sin depender de su número de línea.
 * @returns {LintError[]}
 */
export function collectErrors(results, root) {
  return results.flatMap(result => result.messages
    .filter(message => message.severity === 2 || message.fatal)
    .map(message => {
      const lines = (result.source ?? '').split(/\r?\n/);
      const start = Math.max(0, (message.line ?? 1) - 1);
      const end = message.endLine ?? message.line ?? 1;
      const fragment = lines.slice(start, end).map(line => line.trim()).join('\n');
      return {
        file: relative(root, result.filePath).split(sep).join('/'),
        rule: message.ruleId ?? 'parse-error',
        message: message.messageId ?? message.message.split('\n')[0],
        sourceHash: createHash('sha256').update(fragment).digest('hex'),
        fatal: Boolean(message.fatal),
        line: message.line ?? 1,
        description: message.message.split('\n')[0],
      };
    }));
}

function key(entry) {
  return JSON.stringify([entry.file, entry.rule, entry.message, entry.sourceHash]);
}

export function createBaseline(errors) {
  if (errors.some(error => error.fatal)) throw new Error('No se admiten errores sintácticos en el baseline.');
  const entries = new Map();
  for (const error of errors) {
    const id = key(error);
    const existing = entries.get(id);
    if (existing) existing.count += 1;
    else entries.set(id, {
      file: error.file, rule: error.rule, message: error.message,
      sourceHash: error.sourceHash, count: 1,
    });
  }
  return { version: 1, entries: [...entries.values()].sort((a, b) => key(a).localeCompare(key(b))) };
}

export function compareBaseline(errors, baseline) {
  if (baseline.version !== 1 || !Array.isArray(baseline.entries)) throw new Error('Baseline de ESLint inválido.');
  const remaining = new Map();
  for (const entry of baseline.entries) {
    if (typeof entry.file !== 'string' || typeof entry.rule !== 'string'
        || typeof entry.message !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sourceHash)
        || !Number.isInteger(entry.count) || entry.count < 1 || remaining.has(key(entry))) {
      throw new Error('Entrada inválida o duplicada en el baseline de ESLint.');
    }
    remaining.set(key(entry), entry.count);
  }
  const newErrors = [];
  for (const error of errors) {
    const id = key(error);
    const available = remaining.get(id) ?? 0;
    if (!error.fatal && available > 0) remaining.set(id, available - 1);
    else newErrors.push(error);
  }
  return {
    newErrors,
    existingCount: errors.length - newErrors.length,
    resolvedCount: [...remaining.values()].reduce((sum, count) => sum + count, 0),
  };
}
