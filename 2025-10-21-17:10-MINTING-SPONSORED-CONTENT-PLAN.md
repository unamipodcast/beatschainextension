# MINTING SPONSORED CONTENT IMPLEMENTATION PLAN

**Date**: October 21, 2025 - 17:10  
**Objective**: Implement sponsored content system for NFT minting flow with admin-controlled IPFS assets  
**Status**: Planning Phase

---

## 🎯 CURRENT RADIO SYSTEM ANALYSIS

### ✅ **Existing Sponsored Content Architecture**

#### **Radio Flow Placements**:
1. **Position 1**: After ISRC Generation (`after_isrc`)
2. **Position 2**: After Validation Click (`validation`) 
3. **Position 3**: Before Package Generation (`before_package`)
4. **Position 4**: Post-Package Success (`post_package`)

#### **Google Drive Manifest System**:
```json
{
  "version": "1.0",
  "sponsors": [
    {
      "id": "radiomonitor_sa",
      "name": "Radiomonitor South Africa",
      "message": "Professional music monitoring and analytics",
      "placement": "after_isrc",
      "active": true,
      "priority": 10,
      "tier": "premium",
      "website": "https://radiomonitor.co.za",
      "logo_url": "https://drive.google.com/uc?id=LOGO_ID"
    }
  ]
}
```

#### **Current Limitations**:
- ❌ **Google Drive Images**: Cannot handle images reliably (CORS, access issues)
- ❌ **No Admin Control**: Manual Google Drive file management
- ❌ **Limited Assets**: Text-only or unreliable image URLs
- ❌ **No Minting Integration**: Only works for radio submission flow

---

## 🚀 PROPOSED MINTING SYSTEM INTEGRATION

### **New Minting Flow Placements**:

#### **Position 1**: After License Generation
- **Trigger**: AI license generation completion
- **Context**: User has generated licensing terms
- **Sponsor Focus**: Legal services, licensing platforms, music lawyers

#### **Position 2**: Before NFT Minting
- **Trigger**: User clicks "Mint NFT" button
- **Context**: About to create blockchain transaction
- **Sponsor Focus**: Blockchain services, NFT marketplaces, wallet services

#### **Position 3**: After Successful Minting
- **Trigger**: NFT minting completion
- **Context**: User has successfully minted NFT
- **Sponsor Focus**: NFT promotion, marketplace listing, social media tools

#### **Position 4**: During Download Package
- **Trigger**: User downloads NFT package
- **Context**: User getting complete NFT files
- **Sponsor Focus**: File storage, backup services, portfolio tools

---

## 🏗️ ADMIN-CONTROLLED IPFS ASSET SYSTEM

### **Architecture Overview**:

```
Admin Dashboard → Upload Assets → IPFS Storage → Manifest Generation → Extension Display
```

### **Asset Management Flow**:

#### **1. Admin Asset Upload**:
```javascript
// New AdminAssetManager class
class AdminAssetManager {
    async uploadSponsorAsset(file, sponsorId, assetType) {
        // Upload to IPFS via Pinata/Thirdweb
        const ipfsHash = await this.uploadToIPFS(file);
        
        // Store in admin database
        await this.storeSponsorAsset({
            sponsorId,
            assetType, // 'logo', 'banner', 'video'
            ipfsHash,
            filename: file.name,
            size: file.size,
            uploadedAt: Date.now()
        });
        
        return ipfsHash;
    }
}
```

#### **2. Dynamic Manifest Generation**:
```javascript
// Generate manifest with IPFS URLs
{
  "version": "2.0",
  "sponsors": [
    {
      "id": "nft_marketplace",
      "name": "OpenSea Pro",
      "message": "List your NFT on the world's largest marketplace",
      "placement": "after_minting",
      "active": true,
      "assets": {
        "logo": "ipfs://QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "banner": "ipfs://QmYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
      }
    }
  ]
}
```

#### **3. Extension Asset Loading**:
```javascript
// Load assets from IPFS with fallbacks
async loadSponsorAssets(sponsor) {
    const assets = {};
    
    for (const [type, ipfsHash] of Object.entries(sponsor.assets)) {
        try {
            assets[type] = await this.loadIPFSAsset(ipfsHash);
        } catch (error) {
            assets[type] = this.getFallbackAsset(type);
        }
    }
    
    return assets;
}
```

---

## 🛠️ IMPLEMENTATION COMPONENTS

### **1. Admin Dashboard Enhancements**

#### **New Admin Panel: Sponsor Asset Management**
```javascript
createSponsorAssetPanel() {
    return `
        <div class="sponsor-asset-panel">
            <h4>🖼️ Sponsor Asset Management</h4>
            
            <div class="asset-upload-section">
                <h5>Upload New Assets</h5>
                <select id="sponsor-select">
                    <option value="">Select Sponsor</option>
                    ${this.getActiveSponsors().map(s => 
                        `<option value="${s.id}">${s.name}</option>`
                    ).join('')}
                </select>
                
                <div class="asset-types">
                    <div class="asset-type">
                        <label>Logo (120x60px)</label>
                        <input type="file" id="logo-upload" accept="image/*">
                        <button onclick="uploadAsset('logo')">Upload to IPFS</button>
                    </div>
                    
                    <div class="asset-type">
                        <label>Banner (300x100px)</label>
                        <input type="file" id="banner-upload" accept="image/*">
                        <button onclick="uploadAsset('banner')">Upload to IPFS</button>
                    </div>
                </div>
            </div>
            
            <div class="asset-library">
                <h5>Asset Library</h5>
                <div id="asset-grid">
                    ${this.renderAssetGrid()}
                </div>
            </div>
            
            <div class="manifest-management">
                <h5>Manifest Management</h5>
                <button onclick="generateManifest()">🔄 Generate New Manifest</button>
                <button onclick="deployManifest()">🚀 Deploy to IPFS</button>
                <div class="manifest-status" id="manifest-status"></div>
            </div>
        </div>
    `;
}
```

### **2. IPFS Asset Manager**

#### **Core Asset Management Class**
```javascript
class IPFSAssetManager {
    constructor() {
        this.pinataApiKey = config.PINATA_API_KEY;
        this.assetCache = new Map();
    }
    
    async uploadAsset(file, metadata = {}) {
        // Validate file
        if (!this.validateAssetFile(file)) {
            throw new Error('Invalid asset file');
        }
        
        // Upload to IPFS
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pinataMetadata', JSON.stringify({
            name: `sponsor_asset_${Date.now()}`,
            keyvalues: metadata
        }));
        
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.pinataApiKey}`
            },
            body: formData
        });
        
        const result = await response.json();
        return result.IpfsHash;
    }
    
    async loadAsset(ipfsHash) {
        // Check cache first
        if (this.assetCache.has(ipfsHash)) {
            return this.assetCache.get(ipfsHash);
        }
        
        // Load from IPFS
        const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        // Cache for reuse
        this.assetCache.set(ipfsHash, objectUrl);
        return objectUrl;
    }
    
    validateAssetFile(file) {
        // Size limits
        if (file.size > 500 * 1024) return false; // 500KB max
        
        // Type validation
        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        return allowedTypes.includes(file.type);
    }
}
```

### **3. Minting Flow Integration**

#### **Enhanced Sponsor Integration for Minting**
```javascript
class MintingSponsorIntegration {
    constructor() {
        this.ipfsAssetManager = new IPFSAssetManager();
        this.manifestUrl = 'ipfs://QmMINTING_MANIFEST_HASH';
    }
    
    // Position 1: After License Generation
    async displayLicensingSponsor() {
        const container = document.getElementById('licensing-section');
        await this.displaySponsorContent('after_license', container);
    }
    
    // Position 2: Before NFT Minting
    async displayPreMintingSponsor() {
        const container = document.getElementById('minting-section');
        await this.displaySponsorContent('before_minting', container);
    }
    
    // Position 3: After Successful Minting
    async displayPostMintingSponsor() {
        const container = document.getElementById('success-section');
        await this.displaySponsorContent('after_minting', container);
    }
    
    // Position 4: During Download Package
    async displayDownloadSponsor() {
        const floatingContainer = this.createFloatingContainer();
        await this.displaySponsorContent('during_download', floatingContainer);
    }
    
    async displaySponsorContent(placement, container) {
        const sponsors = await this.getActiveSponsorsByPlacement(placement);
        if (!sponsors.length) return;
        
        const sponsor = this.selectSponsorByPriority(sponsors);
        const assets = await this.ipfsAssetManager.loadSponsorAssets(sponsor);
        
        const sponsorElement = this.createSponsorElement(sponsor, assets);
        container.appendChild(sponsorElement);
        
        // Track impression
        this.trackSponsorImpression(sponsor.id, placement);
    }
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: IPFS Asset Infrastructure**
- [ ] Create IPFSAssetManager class
- [ ] Integrate Pinata API for asset uploads
- [ ] Build asset validation system
- [ ] Implement asset caching mechanism

### **Phase 2: Admin Dashboard Integration**
- [ ] Add sponsor asset management panel
- [ ] Create asset upload interface
- [ ] Build asset library viewer
- [ ] Implement manifest generation tools

### **Phase 3: Minting Flow Integration**
- [ ] Create MintingSponsorIntegration class
- [ ] Add 4 placement positions to minting flow
- [ ] Implement sponsor selection algorithm
- [ ] Add impression tracking

### **Phase 4: Testing & Deployment**
- [ ] Test IPFS asset loading
- [ ] Verify sponsor display timing
- [ ] Test admin asset management
- [ ] Deploy updated manifest system

---

## 🔧 TECHNICAL REQUIREMENTS

### **Dependencies**:
- IPFS/Pinata integration for asset storage
- Enhanced admin dashboard with file upload
- Updated manifest system with IPFS URLs
- Minting flow integration points

### **Configuration**:
```javascript
// config.js additions
PINATA_API_KEY: 'your_pinata_api_key',
PINATA_SECRET_KEY: 'your_pinata_secret_key',
MINTING_MANIFEST_IPFS: 'QmMintingManifestHash',
ASSET_CACHE_DURATION: 3600000, // 1 hour
MAX_ASSET_SIZE: 524288 // 512KB
```

### **Security Considerations**:
- Asset file validation (type, size)
- IPFS hash verification
- Admin-only asset management access
- Rate limiting for asset uploads

---

## 🎯 SUCCESS METRICS

### **Technical Metrics**:
- Asset loading speed < 2 seconds
- 99.9% asset availability
- Zero CORS errors
- Admin upload success rate > 95%

### **Business Metrics**:
- Sponsor impression tracking
- Click-through rates by placement
- Asset engagement analytics
- Revenue attribution per sponsor

---

**Next Steps**: Begin Phase 1 implementation with IPFS asset infrastructure setup.