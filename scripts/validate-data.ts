import fs from 'node:fs';
import { validateProperty, validateSponsor, validatePropertySponsor, formatErrors } from '../src/lib/jsonSchemaValidator';
import { fromWireProperty, fromWireSponsor } from '../src/lib/schemas';

const read = (f: string) => JSON.parse(fs.readFileSync(`data/${f}`, 'utf8')) as Record<string, unknown>[];
const props = read('properties.json');
const sponsors = read('sponsors.json');
const joins = read('property_sponsors.json');
let failures = 0;

function check(label: string, rows: Record<string, unknown>[], v: typeof validateProperty, idKey: string, zod?: (r: unknown) => unknown) {
  rows.forEach((r, i) => {
    const ok = v(r) as boolean;
    let zodOk = true;
    try { zod?.(r); } catch { zodOk = false; }
    console.log(`${ok && zodOk ? 'PASS' : 'FAIL'}  ${label}[${i}] ${String(r[idKey] ?? '')}`);
    if (!ok) { failures++; formatErrors(v.errors).forEach((e) => console.log('      ajv:', e)); }
    if (!zodOk) { failures++; console.log('      zod: parse failed'); }
  });
}
check('property', props, validateProperty, 'property_id', fromWireProperty);
check('sponsor', sponsors, validateSponsor, 'sponsor_id', fromWireSponsor);
check('property_sponsor', joins, validatePropertySponsor, 'property_id');

// Referential integrity (JSON Schema cannot express cross-file FKs)
const pids = new Set(props.map((p) => p.property_id));
const sids = new Set(sponsors.map((s) => s.sponsor_id));
for (const j of joins) {
  if (!pids.has(j.property_id) || !sids.has(j.sponsor_id)) { failures++; console.log('FAIL  dangling FK', j); }
}
for (const p of props) for (const s of (p.local_sponsors as string[] | undefined) ?? []) {
  if (!sids.has(s)) { failures++; console.log(`FAIL  ${p.property_id}.local_sponsors -> missing ${s}`); }
}
console.log(failures ? `\n${failures} problem(s)` : '\nAll records valid; all foreign keys resolve.');
process.exit(failures ? 1 : 0);
