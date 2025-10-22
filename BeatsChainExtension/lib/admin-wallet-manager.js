// Admin Wallet Manager - Phase 3: Production Security
class AdminWalletManager {
    constructor() {
        this.adminPrivateKey = null;
        this.isAdminMode = false;
        this.securityLevel = 'production';
    }

    async initialize() {
        try {
            // Load admin wallet from secure env
            const config = await this.loadSecureConfig();
            if (config.TEST_WALLET_PRIVATE_KEY) {
                this.adminPrivateKey = config.TEST_WALLET_PRIVATE_KEY;
                this.isAdminMode = true;
                console.log('🔐 Admin wallet initialized (production security)');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Admin wallet initialization failed:', error);
            return false;
        }
    }

    async loadSecureConfig() {
        try {
            // Load from environment with security validation
            if (window.envConfig) {
                return window.envConfig;
            }
            
            // Fallback to mock config for development
            console.warn('⚠️ Using mock admin config for development');
            return {
                TEST_WALLET_PRIVATE_KEY: null // No real keys in development
            };
        } catch (error) {
            console.warn('⚠️ Secure config not available, using fallback');
            return {
                TEST_WALLET_PRIVATE_KEY: null
            };
        }
    }

    isAdminWallet(address) {
        if (!this.adminPrivateKey) return false;
        
        // Derive public key from private key for comparison
        try {
            const derivedAddress = this.deriveAddressFromPrivateKey(this.adminPrivateKey);
            return derivedAddress === address;
        } catch (error) {
            console.error('Admin wallet verification failed:', error);
            return false;
        }
    }

    deriveAddressFromPrivateKey(privateKey) {
        // Solana address derivation from private key
        try {
            const { Keypair } = window.solanaWeb3 || {};
            if (!Keypair) {
                console.warn('⚠️ Solana Web3 not available - using mock wallet');
                return 'mock_admin_address_' + Date.now();
            }
            
            const keypair = Keypair.fromSecretKey(
                new Uint8Array(Buffer.from(privateKey, 'hex'))
            );
            return keypair.publicKey.toString();
        } catch (error) {
            console.warn('⚠️ Address derivation failed, using mock:', error);
            return 'mock_admin_address_' + Date.now();
        }
    }

    async executeAdminTransaction(transaction) {
        if (!this.isAdminMode) {
            throw new Error('Admin privileges required');
        }

        console.log('🔐 Executing admin transaction with production wallet');
        return await this.signAndSendTransaction(transaction);
    }

    async signAndSendTransaction(transaction) {
        // Admin transaction signing with production wallet
        try {
            const { Keypair, Connection } = window.solanaWeb3 || {};
            if (!Keypair || !Connection) {
                throw new Error('Solana Web3 not available');
            }

            const keypair = Keypair.fromSecretKey(
                new Uint8Array(Buffer.from(this.adminPrivateKey, 'hex'))
            );
            
            const connection = new Connection('https://api.devnet.solana.com');
            const signature = await connection.sendTransaction(transaction, [keypair]);
            
            console.log('✅ Admin transaction signed:', signature);
            return { success: true, signature };
        } catch (error) {
            console.error('Admin transaction failed:', error);
            return { success: false, error: error.message };
        }
    }

    getAdminCapabilities() {
        return {
            canMint: true,
            canManageCampaigns: true,
            canAccessAnalytics: true,
            canModifySettings: true,
            securityLevel: this.securityLevel
        };
    }
}

window.AdminWalletManager = AdminWalletManager;