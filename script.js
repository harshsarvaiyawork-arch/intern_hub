const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'app', 'dashboard', 'page_final.tsx');
const targetFile = path.join(__dirname, 'app', 'dashboard', 'page.tsx');

try {
  // Read the source file
  const content = fs.readFileSync(sourceFile, 'utf8');
  
  // Write to target file
  fs.writeFileSync(targetFile, content, 'utf8');
  
  console.log(`✓ Successfully copied ${sourceFile} to ${targetFile}`);
} catch (error) {
  console.error(`✗ Error copying file: ${error.message}`);
  process.exit(1);
}
