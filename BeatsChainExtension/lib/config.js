/**
 * Chrome Extension Configuration Manager
 * Replaces process.env with Chrome storage API for secure credential management
 */

class ConfigManager {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Use hardcoded configuration for Chrome extension (no .env file access)
      const hardcodedConfig = {
        'PINATA_API_KEY': '039a88d61f538316a611',
        'PINATA_SECRET_KEY': '15d14b953368d4d5c830c6e05f4767d63443da92da3359a7223ae115315beb91',
        'ETHERSCAN_API_KEY': '375ZXNRUCQFUE8A31IJ2XUHTB4NXXU1BEZ',
        'SOLANA_RPC_URL': 'https://api.devnet.solana.com',
        'SOLANA_RPC_FALLBACK_1': 'https://api.mainnet-beta.solana.com',
        'SOLANA_PROGRAM_ID': 'BeatsChainSolanaProgram11111111111111111111',
        'METAPLEX_PROGRAM_ID': 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
        'RPC_URL': 'https://rpc.sepolia.org',
        'RPC_FALLBACK_1': 'https://sepolia.gateway.tenderly.co',
        'RPC_FALLBACK_2': 'https://ethereum-sepolia.publicnode.com',
        'CONTRACT_ADDRESS': '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A',
        'TEST_WALLET_PRIVATE_KEY': 'c0c71ecd72b802ba8f19cbe188b7e191f62889bf6adf3bb18265a626a5829171'
      };
      
      const stored = await chrome.storage.local.get(Object.keys(hardcodedConfig));
      
      const finalConfig = { ...hardcodedConfig };
      Object.entries(stored).forEach(([key, value]) => {
        if (value) {
          finalConfig[key] = value;
        }
      });
      
      await chrome.storage.local.set(finalConfig);
      
      this.cache = new Map(Object.entries(finalConfig));
      this.initialized = true;
      
      console.log('✅ Configuration initialized with hardcoded values (Chrome extension mode)');
    } catch (error) {
      console.error('Config initialization failed:', error);
      const fallbackConfig = {
        'PINATA_API_KEY': '039a88d61f538316a611',
        'PINATA_SECRET_KEY': '15d14b953368d4d5c830c6e05f4767d63443da92da3359a7223ae115315beb91',
        'ETHERSCAN_API_KEY': '375ZXNRUCQFUE8A31IJ2XUHTB4NXXU1BEZ'
      };
      this.cache = new Map(Object.entries(fallbackConfig));
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
    await chrome.storage.local.set({ [key]: value });
  }

  async getAll() {
    if (!this.initialized) await this.initialize();
    return Object.fromEntries(this.cache);
  }
}

// Singleton instance
const config = new ConfigManager();

export default config;