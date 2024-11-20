/**
 * Copyright (c) 2024 NishantApps
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting MathSketch setup...');

// Install dependencies
try {
    console.log('\x1b[33m%s\x1b[0m', '📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error installing dependencies:', error);
    process.exit(1);
}

// Create .env file
try {
    //The following AUTH_TOKEN is a temporary token for testing purposes for testing server.
    console.log('\x1b[33m%s\x1b[0m', '🔑 Creating environment configuration...');
    const envContent = `NEXT_PUBLIC_SERVER_URL=https://ai-calculator-server-1.onrender.com
NEXT_PUBLIC_AUTH_TOKEN=AwgGBIAXd5iGeHeAi3UjwE8D+w==
`;
    fs.writeFileSync('.env', envContent);
    console.log('\x1b[32m%s\x1b[0m', '✅ Created .env file');
    console.log('\x1b[37m%s\x1b[0m', 'Note: The above AUTH_TOKEN is a temporary token for testing purposes for testing server.');
} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error creating .env file:', error);
    process.exit(1);
}

// Update package.json
try {
    console.log('\x1b[33m%s\x1b[0m', '📝 Updating package.json...');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = require(packageJsonPath);
    
    packageJson.scripts.start = 'next start';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('\x1b[32m%s\x1b[0m', '✅ Updated package.json');
} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error updating package.json:', error);
    process.exit(1);
}

// Build the project
try {
    console.log('\x1b[33m%s\x1b[0m', '🏗️ Building project...');
    execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error building project:', error);
    process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✨ Setup completed successfully!');
console.log('\x1b[36m%s\x1b[0m', '\nTo start MathSketch:');
console.log('\x1b[37m%s\x1b[0m', '2. Run: npm start\n');

// Self-delete
try {
    fs.unlinkSync(__filename);
    console.log('\x1b[32m%s\x1b[0m', '🧹 Cleanup completed');
} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '⚠️ Warning: Could not delete setup file');
} 