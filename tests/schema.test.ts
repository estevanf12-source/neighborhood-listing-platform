import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateProperty, validateSponsor, validatePropertySponsor, formatErrors } from '../src/lib/jsonSchemaValidator';
import { PropertySchema, fromWireProperty } from '../src/lib/schemas';

const valid = JSON.parse(fs.readFileSync('data/valid-property.json', 'utf8'));
const mutate = (patch: Record<string, unknown>) => ({ ...valid, ...patch });

test('1 valid: well-formed property passes JSON Schema and Zod', () => {
  assert.equal(validateProperty(valid), true, formatErrors(validateProperty.errors).join('; '));
  assert.doesNotThrow(() => fromWireProperty(valid));
});

test('2 invalid: negative price is rejected by both layers', () => {
  const bad = mutate({ price: -5 });
  assert.equal(validateProperty(bad), false);
  assert.match(formatErrors(validateProperty.errors).join(), /price/);
  assert.equal(PropertySchema.safeParse({ ...fromWireProperty(valid), price: -5 }).success, false);
});

test('3 invalid: missing required field (image_alt) is rejected', () => {
  const { image_alt, ...bad } = valid;
  void image_alt;
  assert.equal(validateProperty(bad), false);
  assert.match(formatErrors(validateProperty.errors).join(), /image_alt/);
});

test('4 invalid: property_type outside enum is rejected', () => {
  assert.equal(validateProperty(mutate({ property_type: 'castle' })), false);
  assert.match(formatErrors(validateProperty.errors).join(), /allowed values/);
});

test('5 invalid: wrong type / extra field / bad zip are rejected', () => {
  assert.equal(validateProperty(mutate({ bedrooms: '3' })), false, 'string bedrooms');
  assert.equal(validateProperty(mutate({ surprise: true })), false, 'additionalProperties');
  assert.equal(validateProperty(mutate({ address: { ...valid.address, zip_code: '9110' } })), false, 'zip');
});

test('extra: sponsor and join entity schemas enforce keys', () => {
  assert.equal(validatePropertySponsor({ property_id: 'prop-101', sponsor_id: 'spon-01' }), true);
  assert.equal(validatePropertySponsor({ property_id: 'prop-101' }), false);
  assert.equal(validateSponsor({ sponsor_id: 'spon-01' }), false);
});
