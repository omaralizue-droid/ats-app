const fs = require('fs');
const content = [
  "'use client'",
  "export { default } from './landing/page'"
].join('\n') + '\n';
fs.writeFileSync('src/app/page.tsx', content);
console.log('page.tsx written');
