const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\omar ali';

// Quick check of known paths
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
  // Let's do a fast recursive search excluding AppData, Downloads, OneDrive, etc.
  console.log('Searching recursively for bun.exe via Node fs...');
  function findBun(dir, depth = 0) {
    if (depth > 5) return null;
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (let file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          // Exclude large directories
          if (file.name.startsWith('.') && file.name !== '.local' && file.name !== '.gemini') continue;
          if (['node_modules', 'AppData', 'Downloads', 'OneDrive', 'Documents', 'Desktop', 'Projects', 'Creative Cloud Files'].includes(file.name)) continue;
          if (file.name.startsWith('Creative Cloud Files')) continue;
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
  console.error('bun.exe could not be found!');
  process.exit(1);
}

console.log(`Found bun.exe at: ${bunPath}`);

// Run the specified command (passed as arguments to this script)
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('No command specified. Exiting.');
  process.exit(0);
}

console.log(`Executing: bun ${args.join(' ')}`);

const child = spawn(bunPath, args, {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
  process.exit(code);
});
