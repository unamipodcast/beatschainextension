#!/usr/bin/env node

// Auto Solana Devnet Airdrop via API
const fetch = require('https').request;

const walletAddress = '9yMoXGDhXM9BB1dzrNx5vB3pTnc6g8bQvLyWmM8i2E5o';

async function requestAirdrop() {
    console.log('🚰 Requesting devnet SOL airdrop...');
    
    const faucets = [
        {
            name: 'Solana Faucet',
            url: 'https://faucet.solana.com/airdrop',
            method: 'POST',
            body: JSON.stringify({
                address: walletAddress,
                amount: 2000000000 // 2 SOL in lamports
            })
        },
        {
            name: 'QuickNode Faucet',
            url: 'https://faucet.quicknode.com/api/solana/devnet',
            method: 'POST',
            body: JSON.stringify({
                address: walletAddress
            })
        }
    ];

    for (const faucet of faucets) {
        try {
            console.log(`Trying ${faucet.name}...`);
            
            const response = await makeRequest(faucet.url, {
                method: faucet.method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'BeatsChain/1.0'
                },
                body: faucet.body
            });

            if (response.success) {
                console.log(`✅ Success! Airdrop from ${faucet.name}`);
                console.log(`💰 2 SOL sent to: ${walletAddress}`);
                return true;
            }
        } catch (error) {
            console.log(`❌ ${faucet.name} failed:`, error.message);
        }
    }

    console.log('⚠️ All faucets failed. Manual options:');
    console.log('1. Try https://faucet.solana.com/ manually');
    console.log('2. Use BeatsChain gasless minting (no SOL needed)');
    console.log('3. Try https://solfaucet.com/');
    
    return false;
}

function makeRequest(url, options) {
    return new Promise((resolve, reject) => {
        const req = fetch(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ success: res.statusCode === 200, data: result });
                } catch (e) {
                    resolve({ success: res.statusCode === 200, data });
                }
            });
        });
        
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

// Run airdrop
requestAirdrop().then(success => {
    if (success) {
        console.log('\n🎉 Ready to use BeatsChain with funded wallet!');
    } else {
        console.log('\n💡 Use BeatsChain gasless minting - no SOL required!');
    }
});