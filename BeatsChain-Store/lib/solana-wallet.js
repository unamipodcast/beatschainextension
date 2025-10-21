// Real Solana Wallet Manager
class SolanaWalletManager {
    constructor() {
        this.wallet = null;
        this.connection = null;
    }

    async initialize() {
        try {
            this.connection = new solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
            
            // Get or create wallet
            this.wallet = await this.getOrCreateWallet();
            
            console.log('✅ Solana wallet initialized:', this.wallet.publicKey.toString());
            return true;
        } catch (error) {
            console.error('❌ Solana wallet initialization failed:', error);
            return false;
        }
    }

    async getOrCreateWallet() {
        try {
            // Try to get existing wallet from storage
            const stored = localStorage.getItem('solana_wallet_keypair');
            if (stored) {
                const secretKey = JSON.parse(stored);
                return solanaWeb3.Keypair.fromSecretKey(new Uint8Array(secretKey));
            }
            
            // Create new wallet
            const wallet = solanaWeb3.Keypair.generate();
            localStorage.setItem('solana_wallet_keypair', JSON.stringify(Array.from(wallet.secretKey)));
            
            console.log('✅ New Solana wallet created:', wallet.publicKey.toString());
            
            // Request airdrop for testing (devnet only)
            await this.requestAirdrop(wallet.publicKey);
            
            return wallet;
        } catch (error) {
            console.error('❌ Wallet creation failed:', error);
            throw error;
        }
    }

    async requestAirdrop(publicKey) {
        try {
            console.log('🪂 Requesting SOL airdrop for testing...');
            const signature = await this.connection.requestAirdrop(
                publicKey,
                solanaWeb3.LAMPORTS_PER_SOL * 0.1 // 0.1 SOL
            );
            
            await this.connection.confirmTransaction(signature);
            console.log('✅ Airdrop successful:', signature);
        } catch (error) {
            console.warn('⚠️ Airdrop failed (may have reached limit):', error.message);
        }
    }

    getPublicKey() {
        return this.wallet ? this.wallet.publicKey.toString() : null;
    }

    async getBalance() {
        if (!this.wallet || !this.connection) return 0;
        
        try {
            const balance = await this.connection.getBalance(this.wallet.publicKey);
            return balance / solanaWeb3.LAMPORTS_PER_SOL;
        } catch (error) {
            console.error('❌ Failed to get balance:', error);
            return 0;
        }
    }

    async signTransaction(transaction) {
        if (!this.wallet) throw new Error('Wallet not initialized');
        
        transaction.sign(this.wallet);
        return transaction;
    }

    exportWallet() {
        if (!this.wallet) throw new Error('Wallet not initialized');
        
        return {
            publicKey: this.wallet.publicKey.toString(),
            secretKey: Array.from(this.wallet.secretKey),
            network: 'devnet'
        };
    }
}

// Export for global use
window.SolanaWalletManager = SolanaWalletManager;