import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import fs from 'node:fs';
import path from 'node:path';

const schemaDir = path.join(process.cwd(), 'schema');
const load = (f: string) => JSON.parse(fs.readFileSync(path.join(schemaDir, f), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

export const validateProperty = ajv.compile(load('property.schema.json'));
export const validateSponsor = ajv.compile(load('sponsor.schema.json'));
export const validatePropertySponsor = ajv.compile(load('property_sponsor.schema.json'));

export function formatErrors(errors: typeof validateProperty.errors): string[] {
  return (errors ?? []).map((e) => `${e.instancePath || '(root)'} ${e.message}`);
}
