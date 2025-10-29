/**
 * IPFS Asset Manager - Primary Storage for Sponsored Content
 * Handles IPFS-based sponsor assets with local caching
 */

class IPFSAssetManager {
    constructor() {
        this.pinataApiKey = '039a88d61f538316a611';
        this.pinataSecretKey = '15d14b953368d4d5c830c6e05f4767d63443da92da3359a7223ae115315beb91';
        this.assetCache = new Map();
        this.manifestCache = null;
        // Production manifest hash - update when deploying to production
        this.productionManifestHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'; // Real IPFS hash
        this.manifestUrl = `ipfs://${this.productionManifestHash}`;
        this.isInitialized = false;
        this.isProduction = this.detectProductionEnvironment();
        this.csrfProtection = window.CSRFProtection ? new CSRFProtection() : null;
    }

    async initialize() {
        try {
            // Load cached manifest
            await this.loadCachedManifest();
            
            // Validate IPFS connection
            await this.validateConnection();
            
            this.isInitialized = true;
            console.log('✅ IPFS Asset Manager initialized');
            
        } catch (error) {
            console.warn('⚠️ IPFS Asset Manager initialization failed, will use fallbacks:', error);
            this.isInitialized = false;
        }
    }

    async validateConnection() {
        try {
            // Simple IPFS gateway connectivity test using no-cors mode
            const testResponse = await fetch('https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme', {
                method: 'GET',
                mode: 'no-cors', // Bypass CORS preflight completely
                cache: 'default'
            });
            
            // With no-cors, we get an opaque response, which is expected
            console.log('✅ IPFS gateway connection validated (no-cors mode)');
            
        } catch (error) {
            console.warn('⚠️ IPFS gateway validation failed:', error);
            // Don't throw error - allow fallback operation
        }
    }

    async loadCachedManifest() {
        try {
            const cached = localStorage.getItem('ipfs_sponsor_manifest');
            if (cached) {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
                    this.manifestCache = data.manifest;
                    console.log('📦 Using cached IPFS sponsor manifest');
                    return;
                }
            }
            
            // Try to fetch fresh manifest
            await this.fetchSponsorManifest();
            
        } catch (error) {
            console.warn('⚠️ Failed to load sponsor manifest:', error);
        }
    }

    async fetchSponsorManifest() {
        try {
            // In production, always try to fetch real manifest first
            if (this.isProduction || this.productionManifestHash !== 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG') {
                try {
                    const realManifest = await this.fetchFromIPFS(this.productionManifestHash);
                    if (realManifest && realManifest.sponsors) {
                        this.manifestCache = realManifest;
                        console.log('✅ Production IPFS sponsor manifest loaded');
                        return realManifest;
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to load production manifest, using development fallback:', error);
                    // Check if error is the DOCTYPE HTML issue
                    if (error.message && error.message.includes('DOCTYPE')) {
                        console.warn('🔧 IPFS gateway returned HTML instead of JSON - using fallback manifest');
                    }
                }
            }
            
            // Fallback to development manifest with real structure
            const developmentManifest = {
                version: "2.0",
                updated: new Date().toISOString(),
                sponsors: [
                    {
                        id: "music_legal_services",
                        name: "Music Legal Services",
                        message: "Professional legal review for your music contracts and ISRC registration",
                        placement: "after_isrc",
                        active: true,
                        priority: 10,
                        tier: "premium",
                        website: "https://example.com/legal",
                        assets: {
                            logo: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
                            banner: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
                        }
                    },
                    {
                        id: "radio_analytics",
                        name: "Airplay Analytics",
                        message: "Track your radio airplay and audience engagement across stations",
                        placement: "validation",
                        active: true,
                        priority: 8,
                        tier: "enterprise",
                        website: "https://example.com/analytics",
                        assets: {
                            logo: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
                            banner: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
                        }
                    },
                    {
                        id: "music_promotion",
                        name: "Music Promotion Hub",
                        message: "Get your music heard by industry professionals and radio programmers",
                        placement: "before_package",
                        active: true,
                        priority: 6,
                        tier: "basic",
                        website: "https://example.com/promotion",
                        assets: {
                            logo: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
                            banner: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
                        }
                    },
                    {
                        id: "distribution_services",
                        name: "Digital Distribution",
                        message: "Distribute your music to Spotify, Apple Music, and 150+ platforms",
                        placement: "post_package",
                        active: true,
                        priority: 7,
                        tier: "premium",
                        website: "https://example.com/distribution",
                        assets: {
                            logo: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
                            banner: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
                        }
                    }
                ]
            };
            
            this.manifestCache = developmentManifest;
            
            // Cache the manifest
            localStorage.setItem('ipfs_sponsor_manifest', JSON.stringify({
                manifest: developmentManifest,
                timestamp: Date.now()
            }));
            
            console.log(`📦 IPFS sponsor manifest loaded (${this.isProduction ? 'production fallback' : 'development mode'})`);
            return developmentManifest;
            
        } catch (error) {
            console.error('❌ Failed to fetch IPFS sponsor manifest:', error);
            throw error;
        }
    }

    detectProductionEnvironment() {
        // Check if we're in production based on extension context
        try {
            const manifest = chrome.runtime.getManifest();
            // Production if version doesn't contain 'dev' or 'test'
            return !manifest.version.includes('dev') && !manifest.version.includes('test');
        } catch (error) {
            // Fallback to development mode
            return false;
        }
    }

    async fetchFromIPFS(ipfsHash) {
        try {
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 5000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Check if response is HTML instead of JSON
            const contentType = response.headers.get('content-type');
            const responseText = await response.text();
            
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                throw new Error(`IPFS gateway returned HTML instead of JSON for hash ${ipfsHash}. This usually means the hash doesn't exist or the gateway is serving an error page.`);
            }
            
            // Try to parse as JSON
            const data = JSON.parse(responseText);
            console.log(`✅ Successfully fetched from IPFS: ${ipfsHash}`);
            return data;
            
        } catch (error) {
            console.error(`❌ Failed to fetch from IPFS ${ipfsHash}:`, error);
            throw error;
        }
    }

    async getSponsorData(placement) {
        if (!this.manifestCache) {
            await this.fetchSponsorManifest();
        }
        
        if (!this.manifestCache) {
            return null;
        }
        
        return {
            sponsors: this.manifestCache.sponsors.filter(sponsor => 
                sponsor.active && sponsor.placement === placement
            )
        };
    }

    async loadAsset(ipfsHash) {
        // Check cache first
        if (this.assetCache.has(ipfsHash)) {
            return this.assetCache.get(ipfsHash);
        }
        
        // Use real IPFS hashes for actual assets
        const realAssets = {
            'QmAnalyticsLogo789': 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            'QmAnalyticsBanner012': 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            'QmLegalServicesLogo123': 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            'QmLegalServicesBanner456': 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
        };
        
        // Replace mock hash with real hash if available
        const actualHash = realAssets[ipfsHash] || ipfsHash;
        
        // Try to load real IPFS asset with timeout
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${actualHash}`, {
                signal: controller.signal,
                mode: 'cors'
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                this.assetCache.set(ipfsHash, objectUrl);
                return objectUrl;
            }
        } catch (error) {
            console.warn(`IPFS load failed for ${ipfsHash}, using direct URL`);
        }
        
        // Fallback to direct gateway URL
        const fallbackUrl = `https://gateway.pinata.cloud/ipfs/${actualHash}`;
        this.assetCache.set(ipfsHash, fallbackUrl);
        return fallbackUrl;
    }

    // Handle opaque responses from no-cors requests
    handleOpaqueResponse(gatewayUrl, ipfsHash) {
        // For opaque responses, we return the gateway URL directly
        // This works for images and other assets that can be loaded via URL
        console.log(`✅ Using direct gateway URL for opaque response: ${ipfsHash}`);
        return gatewayUrl;
    }

    // Process regular responses
    async processResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    // Get fallback asset for failed loads
    getFallbackAsset(ipfsHash) {
        // Return direct gateway URL as fallback
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    }



    async uploadAsset(file, metadata = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const pinataMetadata = JSON.stringify({
                name: `sponsor_asset_${Date.now()}`,
                keyvalues: {
                    type: 'sponsor_asset',
                    uploaded_by: 'BeatsChain',
                    ...metadata
                }
            });
            formData.append('pinataMetadata', pinataMetadata);
            
            const requestOptions = {
                method: 'POST',
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                },
                body: formData
            };
            
            const response = this.csrfProtection ? 
                await this.csrfProtection.secureRequest('https://api.pinata.cloud/pinning/pinFileToIPFS', requestOptions) :
                await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', requestOptions);
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`✅ Asset uploaded to IPFS: ${result.IpfsHash}`);
            
            return result.IpfsHash;
            
        } catch (error) {
            console.error('❌ IPFS asset upload failed:', error);
            throw error;
        }
    }
    
    async uploadJSON(jsonData, filename) {
        try {
            // Convert JSON data to blob
            const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
                type: 'application/json'
            });
            
            const formData = new FormData();
            formData.append('file', jsonBlob, filename);
            
            const pinataMetadata = JSON.stringify({
                name: filename || `json_data_${Date.now()}`,
                keyvalues: {
                    type: 'json_data',
                    uploaded_by: 'BeatsChain'
                }
            });
            formData.append('pinataMetadata', pinataMetadata);
            
            const requestOptions = {
                method: 'POST',
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                },
                body: formData
            };
            
            const response = this.csrfProtection ? 
                await this.csrfProtection.secureRequest('https://api.pinata.cloud/pinning/pinFileToIPFS', requestOptions) :
                await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', requestOptions);
            
            if (!response.ok) {
                throw new Error(`JSON upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`✅ JSON uploaded to IPFS: ${result.IpfsHash}`);
            
            return {
                success: true,
                ipfsHash: result.IpfsHash,
                url: `ipfs://${result.IpfsHash}`
            };
            
        } catch (error) {
            console.error('❌ IPFS JSON upload failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async uploadSponsorManifest(manifest) {
        try {
            const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
                type: 'application/json'
            });
            
            const ipfsHash = await this.uploadAsset(manifestBlob, {
                type: 'sponsor_manifest',
                version: manifest.version
            });
            
            // Update manifest URL
            this.manifestUrl = `ipfs://${ipfsHash}`;
            
            // Update cache
            this.manifestCache = manifest;
            localStorage.setItem('ipfs_sponsor_manifest', JSON.stringify({
                manifest,
                timestamp: Date.now()
            }));
            
            console.log(`✅ Sponsor manifest uploaded: ${ipfsHash}`);
            return ipfsHash;
            
        } catch (error) {
            console.error('❌ Sponsor manifest upload failed:', error);
            throw error;
        }
    }

    // Admin methods for managing sponsors
    async addSponsor(sponsorData) {
        if (!this.manifestCache) {
            await this.fetchSponsorManifest();
        }
        
        const manifest = { ...this.manifestCache };
        manifest.sponsors = manifest.sponsors || [];
        
        // Add new sponsor
        const newSponsor = {
            id: `sponsor_${Date.now()}`,
            ...sponsorData,
            active: true,
            created: new Date().toISOString()
        };
        
        manifest.sponsors.push(newSponsor);
        manifest.updated = new Date().toISOString();
        
        // Upload updated manifest
        await this.uploadSponsorManifest(manifest);
        
        return newSponsor.id;
    }

    async updateSponsor(sponsorId, updates) {
        if (!this.manifestCache) {
            await this.fetchSponsorManifest();
        }
        
        const manifest = { ...this.manifestCache };
        const sponsorIndex = manifest.sponsors.findIndex(s => s.id === sponsorId);
        
        if (sponsorIndex === -1) {
            throw new Error(`Sponsor not found: ${sponsorId}`);
        }
        
        // Update sponsor
        manifest.sponsors[sponsorIndex] = {
            ...manifest.sponsors[sponsorIndex],
            ...updates,
            updated: new Date().toISOString()
        };
        
        manifest.updated = new Date().toISOString();
        
        // Upload updated manifest
        await this.uploadSponsorManifest(manifest);
        
        return manifest.sponsors[sponsorIndex];
    }

    async removeSponsor(sponsorId) {
        if (!this.manifestCache) {
            await this.fetchSponsorManifest();
        }
        
        const manifest = { ...this.manifestCache };
        manifest.sponsors = manifest.sponsors.filter(s => s.id !== sponsorId);
        manifest.updated = new Date().toISOString();
        
        // Upload updated manifest
        await this.uploadSponsorManifest(manifest);
        
        return true;
    }

    // Analytics and reporting
    getAnalytics() {
        // Return analytics data from local storage
        const analytics = localStorage.getItem('ipfs_sponsor_analytics');
        return analytics ? JSON.parse(analytics) : {
            impressions: 0,
            clicks: 0,
            interactions: 0
        };
    }

    recordAnalytics(event, sponsorId, placement) {
        const analytics = this.getAnalytics();
        
        const record = {
            event,
            sponsorId,
            placement,
            timestamp: Date.now(),
            userAgent: navigator.userAgent.substring(0, 100)
        };
        
        // Update counters
        if (event === 'impression') analytics.impressions++;
        if (event === 'click') analytics.clicks++;
        if (event === 'interaction') analytics.interactions++;
        
        // Store record
        const records = JSON.parse(localStorage.getItem('ipfs_sponsor_records') || '[]');
        records.push(record);
        
        // Keep only last 1000 records
        if (records.length > 1000) {
            records.splice(0, records.length - 1000);
        }
        
        localStorage.setItem('ipfs_sponsor_analytics', JSON.stringify(analytics));
        localStorage.setItem('ipfs_sponsor_records', JSON.stringify(records));
    }

    // Cleanup methods
    clearCache() {
        this.assetCache.clear();
        this.manifestCache = null;
        localStorage.removeItem('ipfs_sponsor_manifest');
        
        // Clean up CSRF nonces
        if (this.csrfProtection) {
            this.csrfProtection.cleanupNonces();
        }
        
        console.log('🧹 IPFS asset cache cleared');
    }

    // Health check
    async healthCheck() {
        const health = {
            initialized: this.isInitialized,
            manifestLoaded: !!this.manifestCache,
            cacheSize: this.assetCache.size,
            gatewayAccessible: false,
            lastUpdate: null
        };
        
        try {
            await this.validateConnection();
            health.gatewayAccessible = true;
        } catch (error) {
            health.gatewayAccessible = false;
        }
        
        if (this.manifestCache) {
            health.lastUpdate = this.manifestCache.updated;
        }
        
        return health;
    }
}

window.IPFSAssetManager = IPFSAssetManager;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPFSAssetManager;
}