/**
 * Configuration Manager - Non-Module Version
 * Provides configuration access without ES6 modules
 */

class ConfigManager {
    constructor() {
        this.cache = new Map();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            const hardcodedConfig = {
                'PINATA_API_KEY': '039a88d61f538316a611',
                'PINATA_SECRET_KEY': '15d14b953368d4d5c830c6e05f4767d63443da92da3359a7223ae115315beb91',
                'SOLANA_RPC_URL': 'https://api.devnet.solana.com',
                'SOLANA_PROGRAM_ID': 'BeatsChainSolanaProgram11111111111111111111',
                'RPC_URL': 'https://rpc.sepolia.org'
            };
            
            this.cache = new Map(Object.entries(hardcodedConfig));
            this.initialized = true;
            console.log('✅ Config Manager initialized');
        } catch (error) {
            console.error('Config initialization failed:', error);
            this.initialized = true;
        }
    }

    async get(key) {
        if (!this.initialized) await this.initialize();
        return this.cache.get(key);
    }

    async set(key, value) {
        if (!this.initialized) await this.initialize();
        this.cache.set(key, value);
    }
}

window.config = new ConfigManager();