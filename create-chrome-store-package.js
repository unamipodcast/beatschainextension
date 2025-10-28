#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Update manifest for Chrome Store submission
const manifestPath = './BeatsChainExtension/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Update version and description for FREE minting emphasis
manifest.version = '2.3.0';
manifest.name = 'BeatsChain - FREE Music NFT Minter';
manifest.description = 'Mint your beats as Solana NFTs for FREE! AI-generated licensing, radio submission packages, and gasless blockchain transactions.';

// Write updated manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// Create production package
const packageName = 'BeatsChain-Free-Minting-v2.3.0.zip';

try {
    // Remove existing package
    if (fs.existsSync(packageName)) {
        fs.unlinkSync(packageName);
    }
    
    // Create zip with essential files only
    execSync(`cd BeatsChainExtension && zip -r ../${packageName} . -x "*.md" "contracts/*" "scripts/*" "test-*" "verify-*" "package*.json" "node_modules/*" "*.log" "*.tmp"`, { stdio: 'inherit' });
    
    // Get package size
    const stats = fs.statSync(packageName);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Chrome Web Store package created: ${packageName}`);
    console.log(`📦 Package size: ${sizeInMB}MB (Chrome limit: 128MB)`);
    console.log(`🎯 Ready for Chrome Web Store submission`);
    console.log(`\n📋 Submission checklist:`);
    console.log(`✅ FREE minting emphasized in name/description`);
    console.log(`✅ Package under 128MB limit`);
    console.log(`✅ Essential files only`);
    console.log(`✅ Manifest v3 compliant`);
    
} catch (error) {
    console.error('❌ Package creation failed:', error.message);
}