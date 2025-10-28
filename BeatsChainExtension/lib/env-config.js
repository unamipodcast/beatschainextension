// Environment Configuration Loader
class EnvConfigLoader {
    constructor() {
        this.config = null;
        this.loaded = false;
    }

    async loadConfig() {
        if (this.loaded) {
            return this.config;
        }

        try {
            // Production configuration with real wallet
            this.config = {
                // Solana Configuration
                SOLANA_NETWORK: 'devnet',
                SOLANA_RPC_URL: 'https://api.devnet.solana.com',
                SOLANA_MAINNET_RPC_URL: 'https://api.mainnet-beta.solana.com',
                SOLANA_PROGRAM_ID: 'BeatsChainSolanaProgram11111111111111111111',
                METAPLEX_PROGRAM_ID: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',

                // Google OAuth2 Configuration
                GOOGLE_CLIENT_ID: '239753403483-58n7vlbvs1nsu9qnf1qmoenh2cjjimbc.apps.googleusercontent.com',

                // IPFS Configuration
                NEXT_PUBLIC_IPFS_GATEWAY: 'https://ipfs.io/ipfs/',
                PINATA_API_KEY: '039a88d61f538316a611',
                PINATA_SECRET_KEY: '15d14b953368d4d5c830c6e05f4767d63443da92da3359a7223ae115315beb91',

                // Security Configuration
                WALLET_ENCRYPTION_KEY: 'BeatsChain2024SecureKey!@#$%^&*()',
                TEST_WALLET_PRIVATE_KEY: 'c0c71ecd72b802ba8f19cbe188b7e191f62889bf6adf3bb18265a626a5829171',
                ADMIN_WALLET_ADDRESS: '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10'
            };

            // Make config globally available
            window.envConfig = this.config;
            this.loaded = true;

            console.log('✅ Environment configuration loaded with production settings');
            return this.config;

        } catch (error) {
            console.error('❌ Failed to load environment configuration:', error);
            
            // Fallback configuration
            this.config = {
                TEST_WALLET_PRIVATE_KEY: 'c0c71ecd72b802ba8f19cbe188b7e191f62889bf6adf3bb18265a626a5829171',
                ADMIN_WALLET_ADDRESS: '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10'
            };
            
            window.envConfig = this.config;
            this.loaded = true;
            
            return this.config;
        }
    }

    getConfig(key) {
        if (!this.loaded) {
            console.warn('⚠️ Config not loaded yet, call loadConfig() first');
            return null;
        }
        return this.config[key];
    }

    isProduction() {
        return this.config && this.config.TEST_WALLET_PRIVATE_KEY === 'c0c71ecd72b802ba8f19cbe188b7e191f62889bf6adf3bb18265a626a5829171';
    }
}

// Initialize and load configuration immediately
const envConfigLoader = new EnvConfigLoader();
envConfigLoader.loadConfig();

// Export for use in other modules
window.EnvConfigLoader = EnvConfigLoader;
window.envConfigLoader = envConfigLoader;