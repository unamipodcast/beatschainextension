/**
 * Campaign Manager - Sponsor Campaign Management System
 * Handles campaign creation, scheduling, and performance tracking
 */

class CampaignManager {
    constructor() {
        this.campaigns = new Map();
        this.isInitialized = false;
    }

    async initialize() {
        await this.loadCampaigns();
        this.isInitialized = true;
        console.log('✅ Campaign Manager initialized');
    }

    async loadCampaigns() {
        try {
            const result = await chrome.storage.local.get(['campaigns']);
            const campaignsData = result.campaigns || {};
            
            this.campaigns.clear();
            Object.entries(campaignsData).forEach(([id, campaign]) => {
                this.campaigns.set(id, campaign);
            });
        } catch (error) {
            console.error('Failed to load campaigns:', error);
        }
    }

    async saveCampaigns() {
        try {
            const campaignsData = Object.fromEntries(this.campaigns);
            await chrome.storage.local.set({ campaigns: campaignsData });
        } catch (error) {
            console.error('Failed to save campaigns:', error);
            throw error;
        }
    }

    validateCampaignData(data) {
        const errors = [];
        
        if (!data.name?.trim()) errors.push('Campaign name is required');
        if (data.name?.length > 50) errors.push('Campaign name must be 50 characters or less');
        
        if (!data.sponsorId) errors.push('Sponsor selection is required');
        
        if (!data.startDate) errors.push('Start date is required');
        if (!data.endDate) errors.push('End date is required');
        
        if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
            errors.push('End date must be after start date');
        }
        
        if (data.budget && (isNaN(data.budget) || data.budget < 0)) {
            errors.push('Budget must be a positive number');
        }
        
        return errors;
    }

    async createCampaign(campaignData) {
        const errors = this.validateCampaignData(campaignData);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const campaign = {
            id: campaignId,
            name: campaignData.name.trim(),
            sponsorId: campaignData.sponsorId,
            placement: campaignData.placement || 'after_isrc',
            startDate: campaignData.startDate,
            endDate: campaignData.endDate,
            budget: parseFloat(campaignData.budget) || 0,
            status: 'scheduled',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            metrics: {
                impressions: 0,
                clicks: 0,
                conversions: 0,
                spend: 0
            }
        };

        this.campaigns.set(campaignId, campaign);
        await this.saveCampaigns();
        
        return campaign;
    }

    async updateCampaign(campaignId, updates) {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const updatedData = { ...campaign, ...updates };
        const errors = this.validateCampaignData(updatedData);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        updatedData.updatedAt = Date.now();
        this.campaigns.set(campaignId, updatedData);
        await this.saveCampaigns();
        
        return updatedData;
    }

    async deleteCampaign(campaignId) {
        if (!this.campaigns.has(campaignId)) {
            throw new Error('Campaign not found');
        }

        this.campaigns.delete(campaignId);
        await this.saveCampaigns();
    }

    getCampaign(campaignId) {
        return this.campaigns.get(campaignId);
    }

    getAllCampaigns() {
        try {
            if (!this.campaigns || typeof this.campaigns.values !== 'function') {
                console.warn('Campaign storage not properly initialized');
                return [];
            }
            
            return Array.from(this.campaigns.values()).map(campaign => {
                // Ensure all campaigns have proper structure with safe fallbacks
                if (!campaign || typeof campaign !== 'object') {
                    console.warn('Invalid campaign object found:', campaign);
                    return {
                        id: 'invalid_' + Date.now(),
                        name: 'Invalid Campaign',
                        status: 'error',
                        metrics: { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
                        sponsorId: 'unknown',
                        startDate: new Date().toISOString(),
                        endDate: new Date().toISOString(),
                        budget: 0
                    };
                }
                
                return {
                    ...campaign,
                    metrics: campaign.metrics || { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
                    status: campaign.status || 'scheduled',
                    name: campaign.name || 'Untitled Campaign',
                    sponsorId: campaign.sponsorId || 'unknown',
                    startDate: campaign.startDate || new Date().toISOString(),
                    endDate: campaign.endDate || new Date().toISOString(),
                    budget: campaign.budget || 0
                };
            });
        } catch (error) {
            console.error('Error in getAllCampaigns:', error);
            return [];
        }
    }

    getActiveCampaigns() {
        const now = Date.now();
        return this.getAllCampaigns().filter(campaign => {
            const startTime = new Date(campaign.startDate).getTime();
            const endTime = new Date(campaign.endDate).getTime();
            return campaign.status === 'active' && now >= startTime && now <= endTime;
        });
    }

    async recordImpression(campaignId) {
        try {
            const campaign = this.campaigns.get(campaignId);
            if (campaign) {
                // Ensure metrics object exists
                if (!campaign.metrics) {
                    campaign.metrics = { impressions: 0, clicks: 0, conversions: 0, spend: 0 };
                }
                campaign.metrics.impressions++;
                campaign.updatedAt = Date.now();
                await this.saveCampaigns();
            }
        } catch (error) {
            console.error('Failed to record impression:', error);
        }
    }

    async recordClick(campaignId) {
        try {
            const campaign = this.campaigns.get(campaignId);
            if (campaign) {
                // Ensure metrics object exists
                if (!campaign.metrics) {
                    campaign.metrics = { impressions: 0, clicks: 0, conversions: 0, spend: 0 };
                }
                campaign.metrics.clicks++;
                campaign.updatedAt = Date.now();
                await this.saveCampaigns();
            }
        } catch (error) {
            console.error('Failed to record click:', error);
        }
    }

    generateCampaignHTML(campaign) {
        // Graceful fallback for campaign metrics
        const metrics = campaign.metrics || { impressions: 0, clicks: 0, conversions: 0, spend: 0 };
        
        const statusColor = {
            'scheduled': '#ffc107',
            'active': '#28a745',
            'paused': '#6c757d',
            'completed': '#17a2b8',
            'cancelled': '#dc3545'
        }[campaign.status] || '#6c757d';

        return `
            <div class="campaign-card" data-campaign-id="${campaign.id}">
                <div class="campaign-header">
                    <div class="campaign-title">
                        <h6>${campaign.name || 'Untitled Campaign'}</h6>
                        <span class="campaign-status" style="background-color: ${statusColor}">${campaign.status || 'unknown'}</span>
                    </div>
                    <div class="campaign-actions">
                        <button class="btn-small btn-secondary edit-campaign" data-campaign-id="${campaign.id}">✏️</button>
                        <button class="btn-small btn-danger delete-campaign" data-campaign-id="${campaign.id}">🗑️</button>
                    </div>
                </div>
                
                <div class="campaign-details">
                    <div class="campaign-info">
                        <small>Sponsor: ${campaign.sponsorId || 'Unknown'}</small>
                        <small>Period: ${campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'TBD'} - ${campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'TBD'}</small>
                        <small>Budget: $${campaign.budget || 0}</small>
                    </div>
                    
                    <div class="campaign-metrics">
                        <div class="metric-item">
                            <span class="metric-value">${metrics.impressions}</span>
                            <span class="metric-label">Impressions</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${metrics.clicks}</span>
                            <span class="metric-label">Clicks</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${metrics.clicks > 0 && metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(1) : 0}%</span>
                            <span class="metric-label">CTR</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCampaignFormHTML(campaign = null, sponsors = {}) {
        const isEdit = !!campaign;
        
        return `
            <div class="campaign-form-overlay">
                <div class="campaign-form-modal">
                    <div class="form-header">
                        <h5>${isEdit ? 'Edit Campaign' : 'Create New Campaign'}</h5>
                        <button class="close-form-btn" type="button">✕</button>
                    </div>
                    
                    <form id="campaign-form" class="campaign-form">
                        <div class="form-row">
                            <label for="campaign-name">Campaign Name *</label>
                            <input type="text" id="campaign-name" class="form-input" 
                                   value="${campaign?.name || ''}" maxlength="50" required>
                            <small class="field-help">Max 50 characters</small>
                        </div>
                        
                        <div class="form-row">
                            <label for="campaign-sponsor">Sponsor *</label>
                            <select id="campaign-sponsor" class="form-input" required>
                                <option value="">Select Sponsor</option>
                                ${Object.entries(sponsors).map(([key, sponsor]) => 
                                    `<option value="${key}" ${campaign?.sponsorId === key ? 'selected' : ''}>${sponsor.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <label for="campaign-placement">Placement</label>
                            <select id="campaign-placement" class="form-input">
                                <option value="after_isrc" ${campaign?.placement === 'after_isrc' ? 'selected' : ''}>After ISRC Generation</option>
                                <option value="before_package" ${campaign?.placement === 'before_package' ? 'selected' : ''}>Before Package Generation</option>
                                <option value="after_package" ${campaign?.placement === 'after_package' ? 'selected' : ''}>After Package Generation</option>
                                <option value="after_minting" ${campaign?.placement === 'after_minting' ? 'selected' : ''}>After NFT Minting</option>
                            </select>
                        </div>
                        
                        <div class="form-grid-two-col">
                            <div class="form-row">
                                <label for="campaign-start-date">Start Date *</label>
                                <input type="datetime-local" id="campaign-start-date" class="form-input" 
                                       value="${campaign ? new Date(campaign.startDate).toISOString().slice(0, 16) : ''}" required>
                            </div>
                            
                            <div class="form-row">
                                <label for="campaign-end-date">End Date *</label>
                                <input type="datetime-local" id="campaign-end-date" class="form-input" 
                                       value="${campaign ? new Date(campaign.endDate).toISOString().slice(0, 16) : ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <label for="campaign-budget">Budget ($)</label>
                            <input type="number" id="campaign-budget" class="form-input" 
                                   value="${campaign?.budget || ''}" min="0" step="0.01">
                            <small class="field-help">Optional budget tracking</small>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary cancel-campaign-btn">Cancel</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Update Campaign' : 'Create Campaign'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
}

window.CampaignManager = CampaignManager;