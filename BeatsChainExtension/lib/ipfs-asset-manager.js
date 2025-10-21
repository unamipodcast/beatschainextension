/**
 * IPFS Asset Manager - Admin-Controlled Sponsor Assets
 * Replaces Google Drive with IPFS for reliable asset management
 */

class IPFSAssetManager {
    constructor() {
        this.pinataApiKey = '039a88d61f538316a611';
        this.pinataSecretKey = '15d14b953368d4d5c830c6e05f4767d63443da92da3359a7223ae115315beb91';
        this.assetCache = new Map();
        this.gateway = 'https://gateway.pinata.cloud/ipfs/';
    }

    async uploadAsset(file, metadata = {}) {
        if (!this.validateAssetFile(file)) {
            throw new Error('Invalid asset file');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('pinataMetadata', JSON.stringify({
            name: `sponsor_asset_${Date.now()}`,
            keyvalues: {
                ...metadata,
                uploadedBy: 'BeatsChain_Admin',
                timestamp: Date.now().toString()
            }
        }));

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': this.pinataApiKey,
                'pinata_secret_api_key': this.pinataSecretKey
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`IPFS upload failed: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Asset uploaded to IPFS:', result.IpfsHash);
        return result.IpfsHash;
    }

    async loadAsset(ipfsHash) {
        if (this.assetCache.has(ipfsHash)) {
            return this.assetCache.get(ipfsHash);
        }

        const url = `${this.gateway}${ipfsHash}`;
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        this.assetCache.set(ipfsHash, objectUrl);
        return objectUrl;
    }

    validateAssetFile(file) {
        if (file.size > 500 * 1024) return false; // 500KB max
        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        return allowedTypes.includes(file.type);
    }

    async generateManifest(sponsors) {
        const manifest = {
            version: '2.0',
            generated: Date.now(),
            settings: {
                refresh_interval: 3600000,
                max_sponsors_per_placement: 3,
                post_package_delay: 2000,
                post_package_duration: 10000
            },
            sponsors: sponsors.map(sponsor => ({
                id: sponsor.id,
                name: sponsor.name,
                message: sponsor.message,
                website: sponsor.website,
                placement: sponsor.placement,
                active: sponsor.active,
                priority: sponsor.priority || 1,
                assets: sponsor.assets || {}
            }))
        };

        const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { 
            type: 'application/json' 
        });
        
        const manifestHash = await this.uploadAsset(manifestBlob, { 
            type: 'manifest',
            sponsorCount: sponsors.length 
        });
        
        return { manifest, manifestHash };
    }
}

window.IPFSAssetManager = IPFSAssetManager;