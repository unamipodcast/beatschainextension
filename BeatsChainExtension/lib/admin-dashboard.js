/**
 * Admin Dashboard Manager - Centralized Admin Features
 * Handles sponsor content, usage analytics, and system management
 */

class AdminDashboardManager {
    constructor() {
        this.authManager = null;
        this.isInitialized = false;
        this.sponsorConfig = null;
        this.usageStats = null;
    }

    async initialize(authManager) {
        if (!authManager) {
            throw new Error('Authentication manager required');
        }

        this.authManager = authManager;
        
        // Verify admin permissions
        if (!this.authManager.hasPermission || !this.authManager.hasPermission('admin_panel')) {
            throw new Error('Admin permissions required');
        }

        await this.loadSponsorConfig();
        await this.loadUsageStats();
        this.setupDashboardUI();
        
        this.isInitialized = true;
        console.log('✅ Admin Dashboard initialized');
    }

    async loadSponsorConfig() {
        try {
            const result = await chrome.storage.local.get(['sponsor_config']);
            this.sponsorConfig = result.sponsor_config || {
                enabled: false,
                currentSponsor: 'default',
                placement: 'after_isrc',
                message: 'Powered by BeatsChain',
                logo: null,
                templates: this.getDefaultSponsorTemplates()
            };
        } catch (error) {
            console.error('Failed to load sponsor config:', error);
            this.sponsorConfig = { enabled: false, templates: this.getDefaultSponsorTemplates() };
        }
    }

    getDefaultSponsorTemplates() {
        return {
            default: {
                name: 'BeatsChain',
                message: 'Powered by BeatsChain - Professional Music Tools',
                logo: null,
                website: 'https://beatschain.com'
            },
            radiomonitor: {
                name: 'Radiomonitor South Africa',
                message: 'Professional music monitoring and analytics',
                logo: null,
                website: 'https://radiomonitor.co.za'
            },
            samro: {
                name: 'SAMRO',
                message: 'South African Music Rights Organisation',
                logo: null,
                website: 'https://samro.org.za'
            }
        };
    }

    async loadUsageStats() {
        try {
            const result = await chrome.storage.local.get(['usage_stats']);
            this.usageStats = result.usage_stats || {
                totalPackages: 0,
                dailyPackages: {},
                userPackages: {},
                lastReset: Date.now()
            };
        } catch (error) {
            console.error('Failed to load usage stats:', error);
            this.usageStats = { totalPackages: 0, dailyPackages: {}, userPackages: {} };
        }
    }

    setupDashboardUI() {
        // Find or create admin dashboard section
        let adminSection = document.getElementById('admin-dashboard-section');
        
        if (!adminSection) {
            adminSection = this.createAdminDashboardSection();
        }

        this.populateDashboard(adminSection);
    }

    createAdminDashboardSection() {
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) return null;

        const adminSection = document.createElement('div');
        adminSection.id = 'admin-dashboard-section';
        adminSection.className = 'admin-dashboard admin-only';
        
        // Create collapsible admin section
        adminSection.innerHTML = `
            <div class="admin-header">
                <h3>👑 Admin Dashboard</h3>
                <button class="collapse-btn" id="admin-toggle" type="button">▶</button>
            </div>
            <div class="admin-content collapsed" id="admin-content">
                <!-- Admin content will be populated here -->
            </div>
        `;
        
        profileSection.appendChild(adminSection);
        
        // Setup collapse functionality
        const toggleBtn = adminSection.querySelector('#admin-toggle');
        const content = adminSection.querySelector('#admin-content');
        
        toggleBtn.addEventListener('click', () => {
            content.classList.toggle('collapsed');
            toggleBtn.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
        });
        
        return adminSection;
    }

    populateDashboard(container) {
        if (!container) return;

        const adminContent = container.querySelector('#admin-content') || container;
        adminContent.innerHTML = `
            <div class="admin-dashboard-header">
                <h3>👑 Admin Dashboard</h3>
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <span class="stat-number">${this.usageStats.totalPackages}</span>
                        <span class="stat-label">Total Packages</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${this.getTodayPackageCount()}</span>
                        <span class="stat-label">Today</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${Object.keys(this.usageStats.userPackages || {}).length}</span>
                        <span class="stat-label">Active Users</span>
                    </div>
                </div>
            </div>

            <div class="admin-tabs">
                <button class="admin-tab active" data-tab="sponsor">Sponsor Content</button>
                <button class="admin-tab" data-tab="analytics">Analytics</button>
                <button class="admin-tab" data-tab="users">User Management</button>
                <button class="admin-tab" data-tab="system">System</button>
            </div>

            <div class="admin-tab-content">
                <div id="admin-sponsor-tab" class="tab-panel active">
                    ${this.createSponsorPanel()}
                </div>
                
                <div id="admin-analytics-tab" class="tab-panel">
                    ${this.createAnalyticsPanel()}
                </div>
                
                <div id="admin-users-tab" class="tab-panel">
                    ${this.createUsersPanel()}
                </div>
                
                <div id="admin-system-tab" class="tab-panel">
                    ${this.createSystemPanel()}
                </div>
            </div>
        `;

        this.setupDashboardEvents(adminContent);
    }

    createSponsorPanel() {
        const currentTemplate = this.sponsorConfig.templates[this.sponsorConfig.currentSponsor] || this.sponsorConfig.templates.default;
        
        return `
            <div class="sponsor-panel">
                <!-- Sponsor Status Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>📢 Sponsor Content Management</h5>
                        <button class="collapse-btn" id="sponsor-status-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="sponsor-status-content">
                        <div class="form-row">
                            <label class="toggle-switch">
                                <input type="checkbox" id="sponsor-enabled" ${this.sponsorConfig.enabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                                <span class="toggle-label">Sponsor Content Enabled</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Available Sponsors Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>🏢 Available Sponsors</h5>
                        <button class="collapse-btn" id="sponsor-templates-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="sponsor-templates-content">
                        <div class="template-grid">
                            ${Object.entries(this.sponsorConfig.templates).map(([key, template]) => `
                                <div class="template-card ${this.sponsorConfig.currentSponsor === key ? 'active' : ''}">
                                    <input type="radio" name="sponsor-template" value="${key}" id="template-${key}" 
                                           ${this.sponsorConfig.currentSponsor === key ? 'checked' : ''}>
                                    <label for="template-${key}">
                                        <div class="template-preview">
                                            <div class="template-logo">${template.logo ? '🖼️' : '📄'}</div>
                                            <div class="template-info">
                                                <strong>${template.name}</strong>
                                                <small>${template.message}</small>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- IPFS Asset Management Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>🖼️ IPFS Asset Management</h5>
                        <button class="collapse-btn" id="sponsor-assets-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content collapsed" id="sponsor-assets-content">
                        <div class="asset-upload-section">
                            <div class="form-row">
                                <label for="sponsor-select">Select Sponsor:</label>
                                <select id="sponsor-select" class="form-input">
                                    <option value="">Select Sponsor</option>
                                    ${Object.entries(this.sponsorConfig.templates).map(([key, template]) => 
                                        `<option value="${key}">${template.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-grid-two-col">
                                <div class="form-row">
                                    <label for="logo-upload">Logo (120x60px):</label>
                                    <input type="file" id="logo-upload" accept="image/*" class="form-input">
                                    <small class="field-help">Max 500KB, PNG/JPG/SVG</small>
                                </div>
                                
                                <div class="form-row">
                                    <label for="banner-upload">Banner (300x100px):</label>
                                    <input type="file" id="banner-upload" accept="image/*" class="form-input">
                                    <small class="field-help">Max 500KB, PNG/JPG/SVG</small>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <button id="upload-asset-btn" class="btn btn-primary">📤 Upload to IPFS</button>
                            </div>
                        </div>
                        
                        <div class="asset-library">
                            <h6>Asset Library</h6>
                            <div id="asset-grid" class="asset-grid">
                                <!-- Assets will be populated here -->
                            </div>
                        </div>
                        
                        <div class="manifest-management">
                            <h6>Manifest Management</h6>
                            <div class="form-row">
                                <button id="generate-manifest-btn" class="btn btn-secondary">🔄 Generate Manifest</button>
                                <button id="deploy-manifest-btn" class="btn btn-secondary">🚀 Deploy to IPFS</button>
                            </div>
                            <div class="manifest-status" id="manifest-status"></div>
                        </div>
                    </div>
                </div>

                <!-- Sponsor Customization Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>⚙️ Customize Current Sponsor</h5>
                        <button class="collapse-btn" id="sponsor-custom-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="sponsor-custom-content">
                        <div class="form-grid-two-col">
                            <div class="form-row">
                                <label for="sponsor-message">Message:</label>
                                <input type="text" id="sponsor-message" class="form-input" 
                                       value="${currentTemplate.message}" maxlength="100">
                                <small class="field-help">Max 100 characters</small>
                            </div>
                            
                            <div class="form-row">
                                <label for="sponsor-placement">Placement:</label>
                                <select id="sponsor-placement" class="form-input">
                                    <option value="after_isrc" ${this.sponsorConfig.placement === 'after_isrc' ? 'selected' : ''}>After ISRC Generation</option>
                                    <option value="before_package" ${this.sponsorConfig.placement === 'before_package' ? 'selected' : ''}>Before Package Generation</option>
                                    <option value="after_package" ${this.sponsorConfig.placement === 'after_package' ? 'selected' : ''}>After Package Generation</option>
                                    <option value="after_minting" ${this.sponsorConfig.placement === 'after_minting' ? 'selected' : ''}>After NFT Minting</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="sponsor-preview">
                            <h6>Preview</h6>
                            <div class="sponsor-preview-box" id="sponsor-preview">
                                ${this.generateSponsorPreview()}
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <button id="save-sponsor-config" class="btn btn-primary">💾 Save Configuration</button>
                            <button id="test-sponsor-display" class="btn btn-secondary">👁️ Test Display</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createAnalyticsPanel() {
        const dailyData = this.getDailyAnalytics();
        
        return `
            <div class="analytics-panel">
                <h4>📊 Usage Analytics</h4>
                
                <div class="analytics-summary">
                    <div class="summary-cards">
                        <div class="summary-card">
                            <h5>Package Generation</h5>
                            <div class="metric">
                                <span class="metric-value">${this.usageStats.totalPackages}</span>
                                <span class="metric-label">Total Packages</span>
                            </div>
                            <div class="metric">
                                <span class="metric-value">${this.getTodayPackageCount()}</span>
                                <span class="metric-label">Today</span>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <h5>User Activity</h5>
                            <div class="metric">
                                <span class="metric-value">${Object.keys(this.usageStats.userPackages || {}).length}</span>
                                <span class="metric-label">Active Users</span>
                            </div>
                            <div class="metric">
                                <span class="metric-value">${this.getAuthenticatedUserCount()}</span>
                                <span class="metric-label">Signed In</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="analytics-charts">
                    <div class="chart-container">
                        <h5>Daily Package Generation (Last 7 Days)</h5>
                        <div class="simple-chart" id="daily-chart">
                            ${this.createSimpleChart(dailyData)}
                        </div>
                    </div>
                </div>

                <div class="analytics-actions">
                    <button id="export-analytics" class="btn btn-secondary">📊 Export Data</button>
                    <button id="reset-analytics" class="btn btn-secondary">🔄 Reset Stats</button>
                </div>
            </div>
        `;
    }

    createUsersPanel() {
        return `
            <div class="users-panel">
                <h4>👥 User Management</h4>
                
                <div class="user-stats">
                    <div class="stat-row">
                        <span class="stat-label">Total Users:</span>
                        <span class="stat-value">${Object.keys(this.usageStats.userPackages || {}).length}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Anonymous Users:</span>
                        <span class="stat-value">${this.getAnonymousUserCount()}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Authenticated Users:</span>
                        <span class="stat-value">${this.getAuthenticatedUserCount()}</span>
                    </div>
                </div>

                <div class="user-actions">
                    <h5>Admin Invitations</h5>
                    <div class="invite-section">
                        <div class="form-row">
                            <input type="email" id="admin-invite-email" placeholder="admin@example.com" class="form-input">
                            <button id="send-admin-invite" class="btn btn-primary">📧 Invite Admin</button>
                        </div>
                    </div>
                    
                    <div id="pending-invitations">
                        <h6>Pending Invitations</h6>
                        <div id="invitations-list"></div>
                    </div>
                </div>
            </div>
        `;
    }

    createSystemPanel() {
        return `
            <div class="system-panel">
                <h4>⚙️ System Management</h4>
                
                <div class="system-info">
                    <div class="info-row">
                        <span class="info-label">Extension Version:</span>
                        <span class="info-value" id="extension-version">Loading...</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Chrome AI Status:</span>
                        <span class="info-value" id="chrome-ai-status">Checking...</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Storage Usage:</span>
                        <span class="info-value" id="storage-usage">Calculating...</span>
                    </div>
                </div>

                <div class="system-actions">
                    <h5>Maintenance</h5>
                    <div class="action-buttons">
                        <button id="clear-cache" class="btn btn-secondary">🗑️ Clear Cache</button>
                        <button id="export-settings" class="btn btn-secondary">📤 Export Settings</button>
                        <button id="import-settings" class="btn btn-secondary">📥 Import Settings</button>
                        <input type="file" id="settings-file" accept=".json" hidden>
                    </div>
                </div>

                <div class="system-logs">
                    <h5>Recent Activity</h5>
                    <div id="system-logs-list" class="logs-container">
                        Loading recent activity...
                    </div>
                </div>
            </div>
        `;
    }

    setupDashboardEvents(container) {
        // Tab switching
        container.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Collapsible sections
        this.setupCollapsibleSections(container);

        // Sponsor content events
        const sponsorEnabled = container.querySelector('#sponsor-enabled');
        if (sponsorEnabled) {
            sponsorEnabled.addEventListener('change', (e) => {
                this.sponsorConfig.enabled = e.target.checked;
                this.updateSponsorPreview();
            });
        }

        const sponsorTemplates = container.querySelectorAll('input[name="sponsor-template"]');
        sponsorTemplates.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.sponsorConfig.currentSponsor = e.target.value;
                this.updateSponsorCustomization();
                this.updateSponsorPreview();
            });
        });

        // IPFS Asset Management events
        const uploadAssetBtn = container.querySelector('#upload-asset-btn');
        if (uploadAssetBtn) {
            uploadAssetBtn.addEventListener('click', () => this.uploadSponsorAsset());
        }

        const generateManifestBtn = container.querySelector('#generate-manifest-btn');
        if (generateManifestBtn) {
            generateManifestBtn.addEventListener('click', () => this.generateIPFSManifest());
        }

        const deployManifestBtn = container.querySelector('#deploy-manifest-btn');
        if (deployManifestBtn) {
            deployManifestBtn.addEventListener('click', () => this.deployManifest());
        }

        const saveSponsorBtn = container.querySelector('#save-sponsor-config');
        if (saveSponsorBtn) {
            saveSponsorBtn.addEventListener('click', () => this.saveSponsorConfig());
        }

        const testSponsorBtn = container.querySelector('#test-sponsor-display');
        if (testSponsorBtn) {
            testSponsorBtn.addEventListener('click', () => this.testSponsorDisplay());
        }

        // System events
        const clearCacheBtn = container.querySelector('#clear-cache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearSystemCache());
        }

        // Load system info
        this.loadSystemInfo();
    }

    setupCollapsibleSections(container) {
        const sections = [
            { toggle: '#sponsor-status-toggle', content: '#sponsor-status-content' },
            { toggle: '#sponsor-templates-toggle', content: '#sponsor-templates-content' },
            { toggle: '#sponsor-assets-toggle', content: '#sponsor-assets-content' },
            { toggle: '#sponsor-custom-toggle', content: '#sponsor-custom-content' }
        ];

        sections.forEach(({ toggle, content }) => {
            const toggleBtn = container.querySelector(toggle);
            const contentEl = container.querySelector(content);
            
            if (toggleBtn && contentEl) {
                toggleBtn.addEventListener('click', () => {
                    const isCollapsed = contentEl.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        contentEl.classList.remove('collapsed');
                        toggleBtn.textContent = '▼';
                    } else {
                        contentEl.classList.add('collapsed');
                        toggleBtn.textContent = '▶';
                    }
                });
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`admin-${tabName}-tab`).classList.add('active');
    }

    generateSponsorPreview() {
        if (!this.sponsorConfig.enabled) {
            return '<div class="sponsor-disabled">Sponsor content disabled</div>';
        }

        const template = this.sponsorConfig.templates[this.sponsorConfig.currentSponsor];
        return `
            <div class="sponsor-content">
                <div class="sponsor-logo">${template.logo ? '🖼️' : '📄'}</div>
                <div class="sponsor-message">${template.message}</div>
                <div class="sponsor-branding">BeatsChain Extension</div>
            </div>
        `;
    }

    updateSponsorPreview() {
        const previewEl = document.getElementById('sponsor-preview');
        if (previewEl) {
            previewEl.innerHTML = this.generateSponsorPreview();
        }
    }

    updateSponsorCustomization() {
        const template = this.sponsorConfig.templates[this.sponsorConfig.currentSponsor];
        const messageInput = document.getElementById('sponsor-message');
        
        if (messageInput && template) {
            messageInput.value = template.message;
        }
    }

    async uploadSponsorAsset() {
        const sponsorSelect = document.getElementById('sponsor-select');
        const logoUpload = document.getElementById('logo-upload');
        const bannerUpload = document.getElementById('banner-upload');
        
        if (!sponsorSelect.value) {
            this.showAdminMessage('Please select a sponsor first', 'error');
            return;
        }
        
        const files = [];
        if (logoUpload.files[0]) files.push({ file: logoUpload.files[0], type: 'logo' });
        if (bannerUpload.files[0]) files.push({ file: bannerUpload.files[0], type: 'banner' });
        
        if (files.length === 0) {
            this.showAdminMessage('Please select at least one file to upload', 'error');
            return;
        }
        
        try {
            // Initialize IPFS manager if not available
            if (!window.IPFSAssetManager) {
                this.showAdminMessage('IPFS Asset Manager not available', 'error');
                return;
            }
            
            const ipfsManager = new IPFSAssetManager();
            
            for (const { file, type } of files) {
                const ipfsHash = await ipfsManager.uploadAsset(file, {
                    sponsorId: sponsorSelect.value,
                    assetType: type
                });
                
                // Store asset reference
                await this.storeSponsorAsset(sponsorSelect.value, type, ipfsHash, file.name);
                
                this.showAdminMessage(`${type} uploaded successfully: ${ipfsHash}`, 'success');
            }
            
            // Clear file inputs
            logoUpload.value = '';
            bannerUpload.value = '';
            
            // Refresh asset grid
            this.refreshAssetGrid();
            
        } catch (error) {
            console.error('Asset upload failed:', error);
            this.showAdminMessage('Asset upload failed: ' + error.message, 'error');
        }
    }
    
    async storeSponsorAsset(sponsorId, assetType, ipfsHash, filename) {
        try {
            const key = `sponsor_assets_${sponsorId}`;
            const result = await chrome.storage.local.get([key]);
            const assets = result[key] || {};
            
            assets[assetType] = {
                ipfsHash,
                filename,
                uploadedAt: Date.now()
            };
            
            await chrome.storage.local.set({ [key]: assets });
        } catch (error) {
            console.error('Failed to store asset reference:', error);
        }
    }
    
    async generateIPFSManifest() {
        try {
            const manifest = {
                version: '2.0',
                generated: Date.now(),
                sponsors: []
            };
            
            // Get all sponsor assets
            for (const [sponsorId, template] of Object.entries(this.sponsorConfig.templates)) {
                const key = `sponsor_assets_${sponsorId}`;
                const result = await chrome.storage.local.get([key]);
                const assets = result[key] || {};
                
                const sponsor = {
                    id: sponsorId,
                    name: template.name,
                    message: template.message,
                    website: template.website,
                    active: true,
                    placement: this.sponsorConfig.placement,
                    assets: {}
                };
                
                // Add IPFS asset URLs
                if (assets.logo) {
                    sponsor.assets.logo = `ipfs://${assets.logo.ipfsHash}`;
                }
                if (assets.banner) {
                    sponsor.assets.banner = `ipfs://${assets.banner.ipfsHash}`;
                }
                
                manifest.sponsors.push(sponsor);
            }
            
            // Store manifest locally
            await chrome.storage.local.set({ ipfs_manifest: manifest });
            
            this.showAdminMessage(`Manifest generated with ${manifest.sponsors.length} sponsors`, 'success');
            
            // Update status
            const statusEl = document.getElementById('manifest-status');
            if (statusEl) {
                statusEl.innerHTML = `<small>Generated: ${new Date().toLocaleString()}</small>`;
            }
            
        } catch (error) {
            console.error('Manifest generation failed:', error);
            this.showAdminMessage('Manifest generation failed: ' + error.message, 'error');
        }
    }
    
    async deployManifest() {
        try {
            const result = await chrome.storage.local.get(['ipfs_manifest']);
            const manifest = result.ipfs_manifest;
            
            if (!manifest) {
                this.showAdminMessage('No manifest to deploy. Generate one first.', 'error');
                return;
            }
            
            if (!window.IPFSAssetManager) {
                this.showAdminMessage('IPFS Asset Manager not available', 'error');
                return;
            }
            
            const ipfsManager = new IPFSAssetManager();
            const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
            const manifestHash = await ipfsManager.uploadAsset(manifestBlob, { type: 'manifest' });
            
            // Store manifest hash
            await chrome.storage.local.set({ 
                deployed_manifest_hash: manifestHash,
                manifest_deployed_at: Date.now()
            });
            
            this.showAdminMessage(`Manifest deployed to IPFS: ${manifestHash}`, 'success');
            
            // Update status
            const statusEl = document.getElementById('manifest-status');
            if (statusEl) {
                statusEl.innerHTML = `
                    <small>Deployed: ${new Date().toLocaleString()}</small><br>
                    <small>IPFS: ${manifestHash}</small>
                `;
            }
            
        } catch (error) {
            console.error('Manifest deployment failed:', error);
            this.showAdminMessage('Manifest deployment failed: ' + error.message, 'error');
        }
    }
    
    refreshAssetGrid() {
        const assetGrid = document.getElementById('asset-grid');
        if (assetGrid) {
            assetGrid.innerHTML = '<small>Asset library will be populated here...</small>';
        }
    }
    
    testSponsorDisplay() {
        if (window.testSponsorDisplay) {
            window.testSponsorDisplay();
            this.showAdminMessage('Sponsor display test triggered', 'info');
        } else {
            this.showAdminMessage('Test function not available', 'error');
        }
    }

    async saveSponsorConfig() {
        try {
            // Get current form values
            const messageInput = document.getElementById('sponsor-message');
            const placementSelect = document.getElementById('sponsor-placement');
            
            if (messageInput) {
                const template = this.sponsorConfig.templates[this.sponsorConfig.currentSponsor];
                template.message = messageInput.value.trim();
            }
            
            if (placementSelect) {
                this.sponsorConfig.placement = placementSelect.value;
            }

            // Save to storage
            await chrome.storage.local.set({ sponsor_config: this.sponsorConfig });
            
            // Show success message
            this.showAdminMessage('Sponsor configuration saved successfully', 'success');
            
        } catch (error) {
            console.error('Failed to save sponsor config:', error);
            this.showAdminMessage('Failed to save configuration', 'error');
        }
    }

    async clearSystemCache() {
        try {
            const keysToRemove = ['temp_data', 'cache_data', 'processed_audio'];
            await chrome.storage.local.remove(keysToRemove);
            
            this.showAdminMessage('System cache cleared successfully', 'success');
            
        } catch (error) {
            console.error('Failed to clear cache:', error);
            this.showAdminMessage('Failed to clear cache', 'error');
        }
    }

    async loadSystemInfo() {
        try {
            // Extension version
            const manifest = chrome.runtime.getManifest();
            const versionEl = document.getElementById('extension-version');
            if (versionEl) versionEl.textContent = manifest.version;

            // Chrome AI status
            const aiStatusEl = document.getElementById('chrome-ai-status');
            if (aiStatusEl) {
                const aiAvailable = window.ai && window.ai.languageModel;
                aiStatusEl.textContent = aiAvailable ? 'Available' : 'Not Available';
                aiStatusEl.style.color = aiAvailable ? '#4CAF50' : '#f44336';
            }

            // Storage usage
            const storageEl = document.getElementById('storage-usage');
            if (storageEl) {
                const usage = await this.calculateStorageUsage();
                storageEl.textContent = `${usage.used}KB / ${usage.quota}KB`;
            }

        } catch (error) {
            console.error('Failed to load system info:', error);
        }
    }

    async calculateStorageUsage() {
        try {
            const data = await chrome.storage.local.get(null);
            const used = JSON.stringify(data).length / 1024; // KB
            const quota = 5120; // 5MB limit for local storage
            
            return { used: Math.round(used), quota };
        } catch (error) {
            return { used: 0, quota: 5120 };
        }
    }

    getTodayPackageCount() {
        const today = new Date().toDateString();
        return this.usageStats.dailyPackages[today] || 0;
    }

    getAuthenticatedUserCount() {
        // Count users with non-anonymous IDs
        const users = this.usageStats.userPackages || {};
        return Object.keys(users).filter(id => !id.startsWith('anon_')).length;
    }

    getAnonymousUserCount() {
        const users = this.usageStats.userPackages || {};
        return Object.keys(users).filter(id => id.startsWith('anon_')).length;
    }

    getDailyAnalytics() {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            last7Days.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: this.usageStats.dailyPackages[dateStr] || 0
            });
        }
        
        return last7Days;
    }

    createSimpleChart(data) {
        const maxValue = Math.max(...data.map(d => d.count), 1);
        
        return `
            <div class="chart-bars">
                ${data.map(d => `
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="height: ${(d.count / maxValue) * 100}%"></div>
                        <div class="chart-label">${d.date}</div>
                        <div class="chart-value">${d.count}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showAdminMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `admin-message admin-message-${type}`;
        messageEl.textContent = message;
        
        const dashboard = document.getElementById('admin-dashboard-section');
        if (dashboard) {
            dashboard.insertBefore(messageEl, dashboard.firstChild);
            
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 3000);
        }
    }

    // Public API for sponsor content display
    getSponsorContent() {
        if (!this.sponsorConfig.enabled) return null;
        
        const template = this.sponsorConfig.templates[this.sponsorConfig.currentSponsor];
        return {
            enabled: true,
            placement: this.sponsorConfig.placement,
            content: {
                name: template.name,
                message: template.message,
                logo: template.logo,
                website: template.website
            }
        };
    }

    async recordPackageGeneration(userId = 'anonymous') {
        try {
            this.usageStats.totalPackages++;
            
            const today = new Date().toDateString();
            this.usageStats.dailyPackages[today] = (this.usageStats.dailyPackages[today] || 0) + 1;
            
            if (!this.usageStats.userPackages[userId]) {
                this.usageStats.userPackages[userId] = 0;
            }
            this.usageStats.userPackages[userId]++;
            
            await chrome.storage.local.set({ usage_stats: this.usageStats });
            
        } catch (error) {
            console.error('Failed to record package generation:', error);
        }
    }
}

// Export for Chrome extension compatibility
window.AdminDashboardManager = AdminDashboardManager;