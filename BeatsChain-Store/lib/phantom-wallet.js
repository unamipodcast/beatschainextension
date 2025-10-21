// Phantom Wallet Integration for Real Solana Transactions
class PhantomWalletManager {
    constructor() {
        this.phantom = null;
        this.isConnected = false;
        this.publicKey = null;
    }

    async initialize() {
        try {
            // Check multiple Phantom injection points
            const checkPhantom = () => {
                return (window.solana && window.solana.isPhantom) || 
                       (window.phantom && window.phantom.solana) ||
                       (window.solana && window.solana.phantom);
            };
            
            if (checkPhantom()) {
                this.phantom = window.solana || window.phantom.solana;
                console.log('✅ Phantom wallet detected immediately');
                return true;
            }
            
            // Wait for Phantom to inject with timeout
            let attempts = 0;
            const maxAttempts = 15; // Reduced to prevent endless loops
            while (!checkPhantom() && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 200));
                attempts++;
                
                // Log progress every 5 attempts
                if (attempts % 5 === 0) {
                    console.log(`⏳ Phantom detection attempt ${attempts}/${maxAttempts}...`);
                }
            }
            
            if (checkPhantom()) {
                this.phantom = window.solana || window.phantom.solana;
                console.log('✅ Phantom wallet detected after waiting');
                return true;
            }
            
            // Final check with document ready
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        window.addEventListener('load', resolve);
                    }
                });
                
                if (checkPhantom()) {
                    this.phantom = window.solana || window.phantom.solana;
                    console.log('✅ Phantom wallet detected after page load');
                    return true;
                }
            }
            
            console.warn('⚠️ Phantom wallet not found - extension installed but not injected');
            return false;
        } catch (error) {
            console.error('❌ Phantom initialization failed:', error);
            return false;
        }
    }

    async connect() {
        try {
            if (!this.phantom) {
                throw new Error('Phantom wallet not available. Please install Phantom extension.');
            }

            const response = await this.phantom.connect();
            this.publicKey = response.publicKey.toString();
            this.isConnected = true;
            
            console.log('✅ Connected to Phantom:', this.publicKey);
            return {
                success: true,
                publicKey: this.publicKey,
                wallet: 'phantom'
            };
        } catch (error) {
            console.error('❌ Phantom connection failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async disconnect() {
        try {
            if (this.phantom && this.isConnected) {
                await this.phantom.disconnect();
                this.isConnected = false;
                this.publicKey = null;
                console.log('✅ Disconnected from Phantom');
            }
        } catch (error) {
            console.error('❌ Phantom disconnect failed:', error);
        }
    }

    async signTransaction(transaction) {
        try {
            if (!this.isConnected) {
                throw new Error('Phantom wallet not connected');
            }

            const signedTransaction = await this.phantom.signTransaction(transaction);
            console.log('✅ Transaction signed by Phantom');
            return signedTransaction;
        } catch (error) {
            console.error('❌ Transaction signing failed:', error);
            throw error;
        }
    }

    getPublicKey() {
        return this.publicKey;
    }

    isWalletConnected() {
        return this.isConnected && this.publicKey;
    }

    showInstallPrompt() {
        const installDiv = document.createElement('div');
        installDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: #512da8; color: white;
            padding: 16px 20px; border-radius: 8px;
            z-index: 10000; max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        installDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">👻</span>
                <div>
                    <strong>Phantom Wallet Required</strong><br>
                    <small>Install Phantom to mint Solana NFTs</small><br>
                    <a href="https://phantom.app" target="_blank" style="color: #bb86fc;">Install Phantom →</a>
                </div>
                <button onclick="this.parentNode.parentNode.remove()" style="background: none; border: none; color: white; cursor: pointer;">×</button>
            </div>
        `;
        
        document.body.appendChild(installDiv);
        
        setTimeout(() => {
            if (installDiv.parentNode) {
                installDiv.parentNode.removeChild(installDiv);
            }
        }, 10000);
    }
}

// Export for global use
window.PhantomWalletManager = PhantomWalletManager;