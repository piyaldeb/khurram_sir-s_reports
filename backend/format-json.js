// Helper script to format service account JSON for .env file
// Usage: node format-json.js path/to/service-account.json

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: node format-json.js path/to/service-account.json');
  console.log('');
  console.log('This will output your service account JSON as a single line');
  console.log('that you can paste into your .env file');
  process.exit(1);
}

try {
  const fullPath = path.resolve(filePath);
  const jsonContent = fs.readFileSync(fullPath, 'utf8');

  // Parse to validate it's valid JSON
  const parsed = JSON.parse(jsonContent);

  // Output as single line
  const singleLine = JSON.stringify(parsed);

  console.log('\n✅ Valid JSON found!\n');
  console.log('Copy this line and paste it as the value for GOOGLE_SERVICE_ACCOUNT_JSON in your .env file:\n');
  console.log('---START---');
  console.log(singleLine);
  console.log('---END---\n');

  console.log('Full .env line:');
  console.log(`GOOGLE_SERVICE_ACCOUNT_JSON=${singleLine}\n`);

  // Also save to a file
  fs.writeFileSync('service-account-formatted.txt', singleLine);
  console.log('✅ Also saved to: service-account-formatted.txt\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
