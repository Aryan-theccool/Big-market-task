const fs = require('fs');
const vm = require('vm');

for (const file of ['index.html', 'board.html', 'server.js', 'package.json']) {
  if (!fs.existsSync(file)) {
    console.error(`Missing file: ${file}`);
    process.exit(1);
  }
}

const html = fs.readFileSync('index.html', 'utf8');
const required = [
  'CANVEX',
  'Think in',
  'canvasViewport',
  'toolRail',
  'regionLayer',
  'cmdBackdrop',
  'Pricing',
  'Changelog',
  'Export Board',
  'function renderLasso',
  'function showExportPanel',
  'function showFullExportModal',
  'function startCollab',
  'function importJSON',
  'function alignSelection',
  'function panFromMini',
  'rotate-handle',
  'selection-handle'
];

for (const token of required) {
  if (!html.includes(token)) {
    console.error(`Missing required token: ${token}`);
    process.exit(1);
  }
}

const match = html.match(/<script>([\s\S]*)<\/script>/);
if (!match) {
  console.error('No inline script found.');
  process.exit(1);
}

try {
  new vm.Script(match[1]);
} catch (error) {
  console.error('JavaScript syntax error:');
  console.error(error);
  process.exit(1);
}

console.log('CANVEX smoke test passed: files exist, required UI tokens exist, and JavaScript parses.');
