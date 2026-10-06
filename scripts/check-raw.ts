import fs from 'node:fs';
import { validateProperty, formatErrors } from '../src/lib/jsonSchemaValidator';

const file = process.argv[2] ?? 'data/ai-raw-properties.json';
const rows = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>[];
let failed = 0;
rows.forEach((r) => {
  const ok = validateProperty(r) as boolean;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(r.property_id)}`);
  if (!ok) formatErrors(validateProperty.errors).forEach((e) => console.log('      ', e));
});
console.log(`\n${rows.length - failed}/${rows.length} records passed`);
process.exit(failed ? 1 : 0);
