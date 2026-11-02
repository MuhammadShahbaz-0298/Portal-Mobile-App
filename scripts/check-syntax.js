// Parses every app JavaScript file with Babel to catch syntax errors early.
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const root = path.resolve(__dirname, '..');
const targets = ['App.js', 'index.js', 'src'];
const files = [];

function collect(target) {
  const full = path.join(root, target);
  if (!fs.existsSync(full)) return;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(full)) collect(path.join(target, entry));
    return;
  }
  if (full.endsWith('.js')) files.push(full);
}

targets.forEach(collect);

let failures = 0;
for (const file of files) {
  try {
    parser.parse(fs.readFileSync(file, 'utf8'), {
      sourceType: 'module',
      plugins: ['jsx'],
    });
  } catch (error) {
    failures += 1;
    const relative = path.relative(root, file);
    console.error(`${relative}:${error.loc?.line || 0}:${error.loc?.column || 0} ${error.message}`);
  }
}

if (failures) {
  console.error(`\n${failures} file(s) failed to parse.`);
  process.exit(1);
}
console.log(`Checked ${files.length} file(s). No syntax errors.`);
