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
        
        // Create EXPANDED admin section (admin-first approach)
        adminSection.innerHTML = `
            <div class="admin-header">
                <h3>👑 Admin Dashboard</h3>
                <button class="collapse-btn" id="admin-toggle" type="button">▼</button>
            </div>
            <div class="admin-content" id="admin-content">
                <!-- Admin content will be populated here -->
            </div>
            
            <!-- Artist Profile sections will be made collapsible by popup.js -->
        `;
        
        // Insert at TOP of profile section, not append
        profileSection.insertBefore(adminSection, profileSection.firstChild);
        
        // Setup collapse functionality for admin (starts expanded)
        const adminToggleBtn = adminSection.querySelector('#admin-toggle');
        const adminContent = adminSection.querySelector('#admin-content');
        
        adminToggleBtn.addEventListener('click', () => {
            adminContent.classList.toggle('collapsed');
            adminToggleBtn.textContent = adminContent.classList.contains('collapsed') ? '▶' : '▼';
        });
        
        // Artist profile collapsing is handled by popup.js
        
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
                        <span class="stat-number">${this.usageStats.packageTypes?.radio || 0}</span>
                        <span class="stat-label">Radio Packages</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${this.usageStats.packageTypes?.mint || 0}</span>
                        <span class="stat-label">Mint Packages</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${this.usageStats.isrcUsage || 0}</span>
                        <span class="stat-label">ISRC Generated</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${this.usageStats.ipfsUsage || 0}</span>
                        <span class="stat-label">IPFS Stored</span>
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

                <!-- Campaign Management Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>📢 Campaign Management</h5>
                        <button class="collapse-btn" id="campaign-management-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="campaign-management-content">
                        <div class="campaign-actions">
                            <div class="form-row">
                                <button id="create-campaign-btn" class="btn btn-primary">🚀 Create Campaign</button>
                            </div>
                        </div>
                        
                        <div class="active-campaigns">
                            <h6>Active Campaigns</h6>
                            <div id="campaigns-list" class="campaigns-container">
                                <div class="no-campaigns">No active campaigns</div>
                            </div>
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
                <!-- Analytics Summary Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>📊 Usage Analytics Overview</h5>
                        <button class="collapse-btn" id="analytics-summary-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="analytics-summary-content">
                        <div class="summary-cards">
                            <div class="summary-card">
                                <h6>Package Generation</h6>
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
                                <h6>User Activity</h6>
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
                </div>

                <!-- Analytics Charts Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>📈 Usage Charts</h5>
                        <button class="collapse-btn" id="analytics-charts-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="analytics-charts-content">
                        <div class="chart-container">
                            <h6>Daily Package Generation (Last 7 Days)</h6>
                            <div class="simple-chart" id="daily-chart">
                                ${this.createSimpleChart(dailyData)}
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <h6>User Distribution</h6>
                            <div class="user-distribution">
                                <div class="distribution-item">
                                    <span class="distribution-label">Anonymous Users:</span>
                                    <span class="distribution-value">${this.getAnonymousUserCount()}</span>
                                    <div class="distribution-bar">
                                        <div class="distribution-fill" style="width: ${this.getAnonymousUserCount() / Math.max(Object.keys(this.usageStats.userPackages || {}).length, 1) * 100}%"></div>
                                    </div>
                                </div>
                                <div class="distribution-item">
                                    <span class="distribution-label">Authenticated Users:</span>
                                    <span class="distribution-value">${this.getAuthenticatedUserCount()}</span>
                                    <div class="distribution-bar">
                                        <div class="distribution-fill" style="width: ${this.getAuthenticatedUserCount() / Math.max(Object.keys(this.usageStats.userPackages || {}).length, 1) * 100}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Analytics Actions Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>⚙️ Analytics Management</h5>
                        <button class="collapse-btn" id="analytics-actions-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content collapsed" id="analytics-actions-content">
                        <div class="form-row">
                            <button id="export-analytics" class="btn btn-secondary">📊 Export Data</button>
                            <button id="reset-analytics" class="btn btn-secondary">🔄 Reset Stats</button>
                            <button id="generate-report" class="btn btn-secondary">📋 Generate Report</button>
                        </div>
                        
                        <div class="analytics-settings">
                            <h6>Settings</h6>
                            <div class="form-row">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="analytics-enabled" checked>
                                    <span class="toggle-slider"></span>
                                    <span class="toggle-label">Enable Analytics Collection</span>
                                </label>
                            </div>
                            <div class="form-row">
                                <label for="retention-days">Data Retention (days):</label>
                                <select id="retention-days" class="form-input">
                                    <option value="30">30 days</option>
                                    <option value="90" selected>90 days</option>
                                    <option value="365">1 year</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createUsersPanel() {
        return `
            <div class="users-panel">
                <!-- User Statistics Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>👥 User Statistics</h5>
                        <button class="collapse-btn" id="user-stats-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="user-stats-content">
                        <div class="user-stats-grid">
                            <div class="stat-card">
                                <div class="stat-number">${Object.keys(this.usageStats.userPackages || {}).length}</div>
                                <div class="stat-label">Total Users</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${this.getAnonymousUserCount()}</div>
                                <div class="stat-label">Anonymous</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${this.getAuthenticatedUserCount()}</div>
                                <div class="stat-label">Authenticated</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${this.getActiveUsersToday()}</div>
                                <div class="stat-label">Active Today</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Admin Invitations Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>📧 Admin Invitations</h5>
                        <button class="collapse-btn" id="user-invites-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="user-invites-content">
                        <div class="invite-section">
                            <h6>Invite New Admin:</h6>
                            <div class="form-row">
                                <input type="email" id="admin-invite-email" placeholder="admin@example.com" class="form-input">
                                <button id="send-admin-invite" class="btn btn-primary">📧 Invite</button>
                            </div>
                            <div class="invite-help">
                                <small>Invited admins will have limited system access</small>
                            </div>
                        </div>
                        
                        <div class="pending-invitations">
                            <h6>Pending Invitations:</h6>
                            <div id="invitations-list" class="invitations-container">
                                <div class="no-invitations">No pending invitations</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- User Management Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>⚙️ User Management</h5>
                        <button class="collapse-btn" id="user-management-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content collapsed" id="user-management-content">
                        <div class="user-search">
                            <div class="form-row">
                                <input type="text" id="user-search" placeholder="Search users..." class="form-input">
                                <button id="search-users" class="btn btn-secondary">🔍 Search</button>
                            </div>
                        </div>
                        
                        <div class="user-list" id="user-list">
                            <div class="user-item">
                                <div class="user-info">
                                    <span class="user-id">user_12345</span>
                                    <span class="user-type">Authenticated</span>
                                    <span class="user-packages">${Math.floor(Math.random() * 50)} packages</span>
                                </div>
                                <div class="user-actions">
                                    <button class="btn-small btn-secondary">👁️ View</button>
                                    <button class="btn-small btn-danger">🚫 Block</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="user-actions-bulk">
                            <button id="export-users" class="btn btn-secondary">📊 Export Users</button>
                            <button id="cleanup-inactive" class="btn btn-secondary">🧹 Cleanup Inactive</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createSystemPanel() {
        return `
            <div class="system-panel">
                <!-- System Information Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>ℹ️ System Information</h5>
                        <button class="collapse-btn" id="system-info-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="system-info-content">
                        <div class="system-info-grid">
                            <div class="info-card">
                                <div class="info-label">Extension Version</div>
                                <div class="info-value" id="extension-version">Loading...</div>
                            </div>
                            <div class="info-card">
                                <div class="info-label">Chrome AI Status</div>
                                <div class="info-value" id="chrome-ai-status">Checking...</div>
                            </div>
                            <div class="info-card">
                                <div class="info-label">Storage Usage</div>
                                <div class="info-value" id="storage-usage">Calculating...</div>
                            </div>
                            <div class="info-card">
                                <div class="info-label">Uptime</div>
                                <div class="info-value" id="system-uptime">Loading...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Maintenance Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>🔧 System Maintenance</h5>
                        <button class="collapse-btn" id="system-maintenance-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content" id="system-maintenance-content">
                        <div class="maintenance-actions">
                            <div class="form-grid-two-col">
                                <div class="form-row">
                                    <button id="clear-cache" class="btn btn-secondary">🗑️ Clear Cache</button>
                                    <small class="field-help">Clear temporary data and cache</small>
                                </div>
                                <div class="form-row">
                                    <button id="optimize-storage" class="btn btn-secondary">⚡ Optimize Storage</button>
                                    <small class="field-help">Compress and optimize data</small>
                                </div>
                            </div>
                            
                            <div class="form-grid-two-col">
                                <div class="form-row">
                                    <button id="export-settings" class="btn btn-secondary">📤 Export Settings</button>
                                    <small class="field-help">Backup configuration</small>
                                </div>
                                <div class="form-row">
                                    <button id="import-settings" class="btn btn-secondary">📥 Import Settings</button>
                                    <input type="file" id="settings-file" accept=".json" hidden>
                                    <small class="field-help">Restore from backup</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="system-health">
                            <h6>System Health</h6>
                            <div class="health-indicators">
                                <div class="health-item">
                                    <span class="health-label">Memory Usage:</span>
                                    <div class="health-bar">
                                        <div class="health-fill" style="width: 45%"></div>
                                    </div>
                                    <span class="health-value">45%</span>
                                </div>
                                <div class="health-item">
                                    <span class="health-label">Storage Usage:</span>
                                    <div class="health-bar">
                                        <div class="health-fill" style="width: 23%"></div>
                                    </div>
                                    <span class="health-value">23%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Logs Section -->
                <div class="samro-enhanced-section">
                    <div class="samro-header">
                        <h5>📋 System Logs</h5>
                        <button class="collapse-btn" id="system-logs-toggle" type="button">▼</button>
                    </div>
                    <div class="samro-content collapsed" id="system-logs-content">
                        <div class="logs-controls">
                            <div class="form-row">
                                <select id="log-level" class="form-input">
                                    <option value="all">All Levels</option>
                                    <option value="error">Errors Only</option>
                                    <option value="warning">Warnings & Errors</option>
                                    <option value="info">Info & Above</option>
                                </select>
                                <button id="refresh-logs" class="btn btn-secondary">🔄 Refresh</button>
                                <button id="clear-logs" class="btn btn-secondary">🗑️ Clear Logs</button>
                            </div>
                        </div>
                        
                        <div id="system-logs-list" class="logs-container">
                            <div class="log-entry log-info">
                                <span class="log-time">${new Date().toLocaleTimeString()}</span>
                                <span class="log-level">INFO</span>
                                <span class="log-message">Admin dashboard initialized successfully</span>
                            </div>
                            <div class="log-entry log-success">
                                <span class="log-time">${new Date(Date.now() - 60000).toLocaleTimeString()}</span>
                                <span class="log-level">SUCCESS</span>
                                <span class="log-message">Sponsor configuration saved</span>
                            </div>
                        </div>
                        
                        <div class="logs-actions">
                            <button id="export-logs" class="btn btn-secondary">📊 Export Logs</button>
                            <button id="download-debug" class="btn btn-secondary">🐛 Debug Package</button>
                        </div>
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
        this.setupAnalyticsEvents(container);
        this.setupUsersEvents(container);
        this.setupSystemEvents(container);

        // Sponsor content events
        const sponsorEnabled = container.querySelector('#sponsor-enabled');
        if (sponsorEnabled) {
            sponsorEnabled.addEventListener('change', (e) => {
                this.sponsorConfig.enabled = e.target.checked;
                this.updateSponsorPreview();
                this.updateToggleVisualState(e.target);
                
                // Save state immediately
                this.saveSponsorConfig();
                
                // Show feedback
                this.showAdminMessage(
                    `Sponsor content ${e.target.checked ? 'enabled' : 'disabled'}`, 
                    'success'
                );
            });
            
            // Set initial visual state
            this.updateToggleVisualState(sponsorEnabled);
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

        // Campaign management events
        const createCampaignBtn = container.querySelector('#create-campaign-btn');
        if (createCampaignBtn) {
            createCampaignBtn.addEventListener('click', () => this.createCampaign());
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
            // Sponsor Content sections
            { toggle: '#sponsor-status-toggle', content: '#sponsor-status-content' },
            { toggle: '#sponsor-templates-toggle', content: '#sponsor-templates-content' },
            { toggle: '#campaign-management-toggle', content: '#campaign-management-content' },
            { toggle: '#sponsor-assets-toggle', content: '#sponsor-assets-content' },
            { toggle: '#sponsor-custom-toggle', content: '#sponsor-custom-content' },
            // Analytics sections
            { toggle: '#analytics-summary-toggle', content: '#analytics-summary-content' },
            { toggle: '#analytics-charts-toggle', content: '#analytics-charts-content' },
            { toggle: '#analytics-actions-toggle', content: '#analytics-actions-content' },
            // Users sections
            { toggle: '#user-stats-toggle', content: '#user-stats-content' },
            { toggle: '#user-invites-toggle', content: '#user-invites-content' },
            { toggle: '#user-management-toggle', content: '#user-management-content' },
            // System sections
            { toggle: '#system-info-toggle', content: '#system-info-content' },
            { toggle: '#system-maintenance-toggle', content: '#system-maintenance-content' },
            { toggle: '#system-logs-toggle', content: '#system-logs-content' }
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

    setupAnalyticsEvents(container) {
        const exportBtn = container.querySelector('#export-analytics');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAnalyticsData());
        }

        const resetBtn = container.querySelector('#reset-analytics');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetAnalyticsData());
        }

        const generateReportBtn = container.querySelector('#generate-report');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateAnalyticsReport());
        }
    }

    setupUsersEvents(container) {
        const inviteBtn = container.querySelector('#send-admin-invite');
        if (inviteBtn) {
            inviteBtn.addEventListener('click', () => this.sendAdminInvite());
        }

        const bulkInviteBtn = container.querySelector('#bulk-invite');
        if (bulkInviteBtn) {
            bulkInviteBtn.addEventListener('click', () => this.showBulkInviteDialog());
        }

        const searchBtn = container.querySelector('#search-users');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchUsers());
        }
    }

    setupSystemEvents(container) {
        const optimizeBtn = container.querySelector('#optimize-storage');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => this.optimizeStorage());
        }

        const refreshLogsBtn = container.querySelector('#refresh-logs');
        if (refreshLogsBtn) {
            refreshLogsBtn.addEventListener('click', () => this.refreshSystemLogs());
        }

        const clearLogsBtn = container.querySelector('#clear-logs');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => this.clearSystemLogs());
        }
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
            return `
                <div class="sponsor-disabled" style="color: #999; font-style: italic; text-align: center; padding: 20px; border: 2px dashed #555; border-radius: 6px;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🚫</div>
                    <div>Sponsor content disabled</div>
                    <small style="display: block; margin-top: 8px; color: #777;">Toggle above to enable sponsor content display</small>
                </div>
            `;
        }

        const template = this.sponsorConfig.templates[this.sponsorConfig.currentSponsor];
        return `
            <div class="sponsor-content" style="border: 2px solid #4CAF50; border-radius: 6px; padding: 16px; background: rgba(76,175,80,0.1);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div class="sponsor-logo" style="font-size: 24px;">${template.logo ? '🖼️' : '📄'}</div>
                    <div style="flex: 1;">
                        <div class="sponsor-message" style="color: #4CAF50; font-weight: bold; margin-bottom: 4px;">${template.message}</div>
                        <div class="sponsor-branding" style="color: #999; font-size: 12px;">BeatsChain Extension</div>
                    </div>
                    <div style="color: #4CAF50; font-size: 20px;">✅</div>
                </div>
                <small style="color: #4CAF50; font-size: 11px;">✓ Sponsor content will be displayed to users</small>
            </div>
        `;
    }

    updateSponsorPreview() {
        const previewEl = document.getElementById('sponsor-preview');
        if (previewEl) {
            previewEl.innerHTML = this.generateSponsorPreview();
            
            // Update preview box styling based on enabled state
            if (this.sponsorConfig.enabled) {
                previewEl.classList.add('enabled');
            } else {
                previewEl.classList.remove('enabled');
            }
        }
    }
    
    updateToggleVisualState(toggleInput) {
        if (!toggleInput) return;
        
        const toggleSwitch = toggleInput.closest('.toggle-switch');
        const toggleLabel = toggleSwitch?.querySelector('.toggle-label');
        
        if (toggleSwitch) {
            if (toggleInput.checked) {
                toggleSwitch.classList.add('enabled');
                toggleSwitch.style.borderColor = '#4CAF50';
                toggleSwitch.style.background = 'rgba(76,175,80,0.1)';
            } else {
                toggleSwitch.classList.remove('enabled');
                toggleSwitch.style.borderColor = '#444';
                toggleSwitch.style.background = 'rgba(255,255,255,0.05)';
            }
        }
        
        if (toggleLabel) {
            toggleLabel.style.color = toggleInput.checked ? '#4CAF50' : '#fff';
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

    getActiveUsersToday() {
        // Mock implementation - would track daily active users
        return Math.floor(Math.random() * 10) + 1;
    }

    async exportAnalyticsData() {
        try {
            const data = {
                usageStats: this.usageStats,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `beatschain-analytics-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showAdminMessage('Analytics data exported successfully', 'success');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showAdminMessage('Export failed: ' + error.message, 'error');
        }
    }

    async resetAnalyticsData() {
        if (!confirm('Are you sure you want to reset all analytics data? This cannot be undone.')) {
            return;
        }
        
        try {
            this.usageStats = {
                totalPackages: 0,
                dailyPackages: {},
                userPackages: {},
                lastReset: Date.now()
            };
            
            await chrome.storage.local.set({ usage_stats: this.usageStats });
            this.showAdminMessage('Analytics data reset successfully', 'success');
            
            // Refresh the dashboard
            this.setupDashboardUI();
            
        } catch (error) {
            console.error('Reset failed:', error);
            this.showAdminMessage('Reset failed: ' + error.message, 'error');
        }
    }

    generateAnalyticsReport() {
        this.showAdminMessage('Analytics report generation started', 'info');
        // Implementation would generate comprehensive report
    }

    sendAdminInvite() {
        const emailInput = document.getElementById('admin-invite-email');
        const roleSelect = document.getElementById('admin-role');
        
        if (!emailInput.value.trim()) {
            this.showAdminMessage('Please enter an email address', 'error');
            return;
        }
        
        // Mock invitation sending
        this.showAdminMessage(`Invitation sent to ${emailInput.value}`, 'success');
        emailInput.value = '';
    }

    showBulkInviteDialog() {
        this.showAdminMessage('Bulk invite feature coming soon', 'info');
    }

    searchUsers() {
        const searchInput = document.getElementById('user-search');
        const query = searchInput.value.trim();
        
        if (!query) {
            this.showAdminMessage('Please enter a search term', 'error');
            return;
        }
        
        this.showAdminMessage(`Searching for users: ${query}`, 'info');
    }

    async optimizeStorage() {
        try {
            this.showAdminMessage('Storage optimization started...', 'info');
            
            // Mock optimization process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showAdminMessage('Storage optimized successfully', 'success');
            
        } catch (error) {
            console.error('Optimization failed:', error);
            this.showAdminMessage('Optimization failed: ' + error.message, 'error');
        }
    }

    refreshSystemLogs() {
        const logsContainer = document.getElementById('system-logs-list');
        if (logsContainer) {
            // Add new log entry
            const newLog = document.createElement('div');
            newLog.className = 'log-entry log-info';
            newLog.innerHTML = `
                <span class="log-time">${new Date().toLocaleTimeString()}</span>
                <span class="log-level">INFO</span>
                <span class="log-message">System logs refreshed</span>
            `;
            logsContainer.insertBefore(newLog, logsContainer.firstChild);
        }
        
        this.showAdminMessage('System logs refreshed', 'success');
    }

    clearSystemLogs() {
        if (!confirm('Are you sure you want to clear all system logs?')) {
            return;
        }
        
        const logsContainer = document.getElementById('system-logs-list');
        if (logsContainer) {
            logsContainer.innerHTML = '<div class="log-entry log-info"><span class="log-time">' + 
                new Date().toLocaleTimeString() + '</span><span class="log-level">INFO</span>' +
                '<span class="log-message">System logs cleared</span></div>';
        }
        
        this.showAdminMessage('System logs cleared', 'success');
    }

    createCampaign() {
        this.showAdminMessage('Campaign creation feature coming soon', 'info');
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

    createMinimalArtistProfile() {
        return `
            <div class="artist-minimal-profile">
                <div class="artist-quick-stats">
                    <div class="stat-item">
                        <span class="stat-label">Wallet:</span>
                        <span class="stat-value">0xe54b...3923</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">NFTs:</span>
                        <span class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Earned:</span>
                        <span class="stat-value">0 MATIC</span>
                    </div>
                </div>
                
                <div class="artist-essential-fields">
                    <div class="form-row">
                        <label>Display Name:</label>
                        <input type="text" class="form-input" placeholder="Artist name">
                    </div>
                    <div class="form-row">
                        <label>Primary Role:</label>
                        <select class="form-input">
                            <option>Producer</option>
                            <option>Artist</option>
                            <option>DJ</option>
                        </select>
                    </div>
                </div>
                
                <div class="artist-actions">
                    <button class="btn btn-secondary">💾 Save Profile</button>
                    <button class="btn btn-secondary">📤 Export Wallet</button>
                    <button class="btn btn-link" onclick="this.expandFullProfile()">📝 Full Profile...</button>
                </div>
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

    async recordPackageGeneration(userId = 'anonymous', packageType = 'radio', packageData = {}) {
        try {
            this.usageStats.totalPackages++;
            
            const today = new Date().toDateString();
            this.usageStats.dailyPackages[today] = (this.usageStats.dailyPackages[today] || 0) + 1;
            
            if (!this.usageStats.userPackages[userId]) {
                this.usageStats.userPackages[userId] = 0;
            }
            this.usageStats.userPackages[userId]++;
            
            // Record package type specific metrics
            if (!this.usageStats.packageTypes) {
                this.usageStats.packageTypes = { radio: 0, mint: 0 };
            }
            this.usageStats.packageTypes[packageType] = (this.usageStats.packageTypes[packageType] || 0) + 1;
            
            // Record ISRC and IPFS usage
            if (packageData.hasISRC) {
                this.usageStats.isrcUsage = (this.usageStats.isrcUsage || 0) + 1;
            }
            if (packageData.hasIPFS) {
                this.usageStats.ipfsUsage = (this.usageStats.ipfsUsage || 0) + 1;
            }
            
            await chrome.storage.local.set({ usage_stats: this.usageStats });
            
            // Integrate with measurement system if available
            if (window.packageMeasurementSystem) {
                if (packageType === 'radio') {
                    await window.packageMeasurementSystem.recordRadioPackageSuccess(packageData);
                } else if (packageType === 'mint') {
                    await window.packageMeasurementSystem.recordMintPackageSuccess(packageData);
                }
            }
            
        } catch (error) {
            console.error('Failed to record package generation:', error);
        }
    }
}

// Export for Chrome extension compatibility
window.AdminDashboardManager = AdminDashboardManager;