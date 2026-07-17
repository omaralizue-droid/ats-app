const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\omar ali';

const possiblePaths = [
  path.join(userProfile, '.local', 'bin', 'bun.exe'),
  path.join(userProfile, '.local', 'bin', 'bun'),
  path.join(userProfile, 'antigravity', 'antigravity', 'antigravity', 'antigravity-ide', 'bun', 'bin', 'bun.exe'),
];

let bunPath = null;
for (let p of possiblePaths) {
  if (fs.existsSync(p)) {
    bunPath = p;
    break;
  }
}

if (!bunPath) {
  // If not found, try to search recursively in user profile (up to depth 4)
  console.log('Searching recursively for bun.exe...');
  function findBun(dir, depth = 0) {
    if (depth > 4) return null;
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (let file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          if (file.name.startsWith('.') && file.name !== '.local' && file.name !== '.gemini') continue;
          if (file.name === 'node_modules' || file.name === 'AppData' || file.name === 'Downloads') continue;
          const found = findBun(fullPath, depth + 1);
          if (found) return found;
        } else if (file.name === 'bun.exe' || file.name === 'bun') {
          return fullPath;
        }
      }
    } catch (e) {}
    return null;
  }
  bunPath = findBun(userProfile);
}

if (!bunPath) {
  console.error('bun.exe could not be found anywhere!');
  process.exit(1);
}

const bunDir = path.dirname(bunPath);
const nodePath = path.join(bunDir, 'node.exe');

// Copy bun.exe to node.exe if not already present to act as node alias
if (!fs.existsSync(nodePath)) {
  try {
    fs.copyFileSync(bunPath, nodePath);
    console.log('Successfully created node.exe copy of bun.exe');
  } catch (e) {
    console.error('Failed to copy bun.exe to node.exe:', e);
  }
}

// Add bunDir to process.env.PATH so both bun and node are in PATH for Next.js subprocesses
process.env.PATH = bunDir + path.delimiter + process.env.PATH;

console.log(`Found bun at: ${bunPath}`);
console.log('Starting Next.js development server...');

// Since we want to run the dev script, let's run "next dev -p 3000" directly
const nextPath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const devServer = spawn(bunPath, [nextPath, 'dev', '-p', '3000'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
  env: process.env
});

devServer.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
});
