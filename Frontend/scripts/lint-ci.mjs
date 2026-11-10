import { readFile } from 'node:fs/promises';
import { ESLint } from 'eslint';
import { collectErrors, compareBaseline } from './lint-baseline.mjs';

const results = await new ESLint().lintFiles(['.']);
for (const result of results) {
  if (result.errorCount && !result.source) result.source = await readFile(result.filePath, 'utf8');
}
const baseline = JSON.parse(await readFile(new URL('../eslint-baseline.json', import.meta.url), 'utf8'));
const comparison = compareBaseline(collectErrors(results, process.cwd()), baseline);
const warnings = results.reduce((sum, result) => sum + result.warningCount, 0);
console.log(`ESLint: ${comparison.existingCount} errores existentes, ${comparison.newErrors.length} nuevos y ${warnings} advertencias.`);
if (comparison.resolvedCount) console.log(`${comparison.resolvedCount} hallazgos del baseline ya no aparecen; retirar esas entradas al revisar el cambio.`);
for (const error of comparison.newErrors) console.error(`${error.file}:${error.line} ${error.rule}: ${error.description}`);
if (comparison.newErrors.length) {
  console.error('CI bloqueado: corregir los errores nuevos. El baseline no se actualiza automáticamente.');
  process.exitCode = 1;
}
