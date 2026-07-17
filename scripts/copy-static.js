const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy .next/static to .next/standalone/.next/static
const staticSrc = path.join(__dirname, '../.next/static');
const staticDest = path.join(__dirname, '../.next/standalone/.next/static');
if (fs.existsSync(staticSrc)) {
  copyDir(staticSrc, staticDest);
  console.log('Copied .next/static to standalone build');
} else {
  console.warn('Warning: .next/static not found');
}

// Copy public to .next/standalone/public
const publicSrc = path.join(__dirname, '../public');
const publicDest = path.join(__dirname, '../.next/standalone/public');
if (fs.existsSync(publicSrc)) {
  copyDir(publicSrc, publicDest);
  console.log('Copied public/ to standalone build');
} else {
  console.warn('Warning: public/ folder not found');
}
