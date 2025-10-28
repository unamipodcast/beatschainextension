// Unified Authentication Manager - Consolidates Basic + Enhanced Auth
class UnifiedAuthenticationManager {
    constructor() {
        this.isAuthenticated = false;
        this.userProfile = null;
        this.accessToken = null;
        this.role = 'user';
        this.securityLevel = 'basic';
        this.mfaEnabled = false;
    }

    async initialize() {
        try {
            // Initialize admin wallet manager
            if (window.AdminWalletManager) {
                this.adminWallet = new AdminWalletManager();
                await this.adminWallet.initialize();
            }
            
            // Check existing authentication data
            const stored = await chrome.storage.local.get([
                'auth_token', 'user_profile', 
                'enhanced_wallet_address', 'wallet_address'
            ]);
            
            if (stored.auth_token && stored.user_profile) {
                this.accessToken = stored.auth_token;
                this.userProfile = stored.user_profile;
                this.isAuthenticated = true;
                
                // Determine role and security level
                this.role = this.determineUserRole(stored.user_profile.email);
                this.securityLevel = stored.user_profile.verified_email ? 'enhanced' : 'basic';
                
                // Override role if admin wallet detected
                if (this.adminWallet && this.adminWallet.isAdminMode) {
                    this.role = 'admin';
                    this.securityLevel = 'production';
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Unified auth initialization failed:', error);
            return false;
        }
    }

    determineUserRole(email) {
        const adminEmails = [
            'admin@beatschain.com',
            'developer@beatschain.com', 
            'info@unamifoundation.org',
            'deannecoole5@gmail.com',
            'sihle.zuma680@gmail.com'
        ];
        return adminEmails.includes(email) ? 'admin' : 'user';
    }

    async signInWithGoogle() {
        return new Promise((resolve, reject) => {
            try {
                if (!chrome.identity) {
                    reject(new Error('Google OAuth2 not available'));
                    return;
                }

                chrome.identity.getAuthToken({ interactive: true }, async (token) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error('Google OAuth2 authentication failed: ' + chrome.runtime.lastError.message));
                        return;
                    }

                    try {
                        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        const userInfo = await response.json();
                        
                        this.accessToken = token;
                        this.userProfile = {
                            id: userInfo.id,
                            email: userInfo.email,
                            name: userInfo.name,
                            picture: userInfo.picture,
                            verified_email: userInfo.verified_email
                        };
                        this.isAuthenticated = true;
                        this.role = this.determineUserRole(userInfo.email);
                        this.securityLevel = userInfo.verified_email ? 'enhanced' : 'basic';

                        // Store authentication data
                        await chrome.storage.local.set({
                            'auth_token': token,
                            'user_profile': this.userProfile,
                            'auth_timestamp': Date.now()
                        });

                        // Generate unified wallet
                        await this.generateUnifiedWallet();

                        resolve({
                            success: true,
                            user: this.userProfile,
                            role: this.role,
                            securityLevel: this.securityLevel
                        });

                    } catch (profileError) {
                        reject(profileError);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }



    async generateUnifiedWallet() {
        try {
            // Check if wallet already exists (preserve existing data)
            const existing = await chrome.storage.local.get([
                'wallet_address', 'enhanced_wallet_address'
            ]);
            
            if (existing.wallet_address || existing.enhanced_wallet_address) {
                console.log('✅ Existing wallet preserved');
                return;
            }

            // Generate new unified wallet
            const entropy = new Uint8Array(32);
            crypto.getRandomValues(entropy);
            
            const userSeed = this.userProfile.id + Array.from(entropy).join('');
            const encoder = new TextEncoder();
            const data = encoder.encode(userSeed);
            
            const keyMaterial = await crypto.subtle.importKey(
                'raw', data, { name: 'PBKDF2' }, false, ['deriveBits']
            );
            
            const salt = encoder.encode('BeatsChain-Unified-2024');
            const iterations = this.role === 'admin' ? 200000 : 100000;
            
            const derivedBits = await crypto.subtle.deriveBits({
                name: 'PBKDF2',
                salt: salt,
                iterations: iterations,
                hash: 'SHA-256'
            }, keyMaterial, 256);
            
            const privateKeyArray = new Uint8Array(derivedBits);
            const privateKey = '0x' + Array.from(privateKeyArray, byte => 
                byte.toString(16).padStart(2, '0')
            ).join('');
            
            const addressBytes = new Uint8Array(20);
            crypto.getRandomValues(addressBytes);
            const walletAddress = '0x' + Array.from(addressBytes, byte => 
                byte.toString(16).padStart(2, '0')
            ).join('');
            
            // Store unified wallet data
            await chrome.storage.local.set({
                'unified_wallet_address': walletAddress,
                'unified_wallet_private_key': privateKey, // TODO: Encrypt in production
                'wallet_created': Date.now(),
                'wallet_role': this.role
            });
            
            console.log('✅ Unified wallet generated:', walletAddress.substring(0, 6) + '...');
            
        } catch (error) {
            console.error('Unified wallet generation failed:', error);
        }
    }

    async signOut() {
        try {
            if (this.accessToken) {
                chrome.identity.removeCachedAuthToken({
                    token: this.accessToken
                }, () => {});
            }

            // Clear unified auth data (preserve wallet for migration)
            await chrome.storage.local.remove([
                'auth_token', 'user_profile', 'auth_timestamp'
            ]);

            this.isAuthenticated = false;
            this.userProfile = null;
            this.accessToken = null;
            this.role = 'user';
            this.securityLevel = 'basic';

            return { success: true };
        } catch (error) {
            console.error('Sign-out failed:', error);
            throw error;
        }
    }

    async getWalletAddress() {
        try {
            // Use admin wallet if available and in admin mode
            if (this.adminWallet && this.adminWallet.isAdminMode) {
                return this.adminWallet.deriveAddressFromPrivateKey(this.adminWallet.adminPrivateKey);
            }
            
            // Check unified wallet first, fallback to existing wallets
            const result = await chrome.storage.local.get([
                'unified_wallet_address', 'enhanced_wallet_address', 'wallet_address'
            ]);
            
            return result.unified_wallet_address || 
                   result.enhanced_wallet_address || 
                   result.wallet_address || null;
        } catch (error) {
            console.error('Failed to get wallet address:', error);
            return null;
        }
    }

    getUserProfile() {
        if (this.userProfile && this.isAuthenticated) {
            return {
                ...this.userProfile,
                role: this.role,
                securityLevel: this.securityLevel,
                enhanced: this.securityLevel !== 'basic'
            };
        }
        return null;
    }

    getAccessToken() {
        return this.accessToken;
    }

    hasPermission(action) {
        const permissions = {
            'user': ['mint_nft', 'upload_audio', 'radio_submit'],
            'admin': ['*']
        };
        
        const userPermissions = permissions[this.role] || permissions['user'];
        return userPermissions.includes('*') || userPermissions.includes(action);
    }

    // Backward compatibility methods
    isAuthenticated() {
        return this.isAuthenticated === true;
    }

    async getWalletBalance() {
        return '0.0000';
    }
}

// Export for Chrome extension compatibility
window.UnifiedAuthenticationManager = UnifiedAuthenticationManager;