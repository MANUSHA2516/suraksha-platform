import { readFile, access } from 'node:fs/promises';
const screens = JSON.parse(await readFile('docs/screen-inventory.json', 'utf8'));
const statuses = new Set([
  'IMPLEMENTED',
  'PARTIALLY IMPLEMENTED',
  'BLOCKED BY EXTERNAL SERVICE',
  'NOT SPECIFIED ENOUGH IN SOURCE DOCUMENTS',
]);
const ids = new Set();
const counts = {};
for (const screen of screens) {
  if (ids.has(screen.id)) throw new Error(`Duplicate screen ${screen.id}`);
  ids.add(screen.id);
  if (!statuses.has(screen.status)) throw new Error(`Missing audit status: ${screen.id}`);
  for (const key of [
    'source',
    'role',
    'platform',
    'route',
    'purpose',
    'components',
    'inputs',
    'outputs',
    'api',
    'entities',
    'component',
    'limitations',
  ]) {
    if (!screen[key]) throw new Error(`Missing ${key}: ${screen.id}`);
  }
  await access(screen.source);
  await access(screen.component);
  await access(`docs/${screen.image}`);
  for (const test of screen.testRefs) await access(test);
  counts[screen.status] = (counts[screen.status] || 0) + 1;
}
if (screens.length !== 47 || screens.filter((s) => s.platform === 'mobile').length !== 31)
  throw new Error('Expected 31 mobile + 16 staff screens');
const trace = await readFile('docs/TRACEABILITY_MATRIX.md', 'utf8');
for (const id of ids) if (!trace.includes(`| ${id} |`)) throw new Error(`Missing trace row ${id}`);
for (const name of [
  'REQUIREMENTS',
  'SCREEN_INVENTORY',
  'ROLE_PERMISSION_MATRIX',
  'WORKFLOWS',
  'DATA_MODEL',
  'API_SPEC',
  'DOCUMENTATION_CONFLICTS',
  'OPEN_GAPS',
  'TRACEABILITY_MATRIX',
])
  await access(`docs/${name}.md`);
console.log(
  JSON.stringify({ screens: screens.length, mobile: 31, staff: 16, statuses: counts }, null, 2),
);
console.log(
  'Source/component/test references exist. This structural audit does not certify visual fidelity or behavioral completeness.',
);
