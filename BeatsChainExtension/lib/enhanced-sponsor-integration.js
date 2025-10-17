/**
 * Enhanced Sponsor Integration - Google Drive + Legacy System
 * Seamlessly integrates Google Drive sponsors with existing sponsor system
 */

class EnhancedSponsorIntegration {
    constructor() {
        this.googleDriveManager = null;
        this.legacySponsorManager = null;
        this.isInitialized = false;
    }

    async initialize(app) {
        try {
            // Initialize Google Drive manager
            this.googleDriveManager = GoogleDriveSponsorManager.enhanceApp(app);
            
            // Initialize legacy sponsor manager if available
            if (window.SponsorContentManager) {
                this.legacySponsorManager = new SponsorContentManager();
                await this.legacySponsorManager.initialize(app.adminDashboard);
            }

            // Set up integration hooks
            this.setupIntegrationHooks(app);
            
            this.isInitialized = true;
            console.log('✅ Enhanced Sponsor Integration initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Sponsor Integration:', error);
        }
    }

    setupIntegrationHooks(app) {
        // Hook into ISRC generation
        this.enhanceISRCGeneration(app);
        
        // Hook into package generation
        this.enhancePackageGeneration(app);
        
        // Hook into radio submission
        this.enhanceRadioSubmission(app);
    }

    enhanceISRCGeneration(app) {
        if (!app.isrcManager) return;

        const originalHandleGeneration = app.isrcManager.handleISRCGeneration;
        if (originalHandleGeneration) {
            app.isrcManager.handleISRCGeneration = async function() {
                const result = await originalHandleGeneration.call(this);
                
                // Show Google Drive sponsor content after ISRC generation
                setTimeout(() => {
                    app.enhancedSponsorIntegration?.displaySponsorAfterISRC();
                }, 1500);
                
                return result;
            };
        }
    }

    enhancePackageGeneration(app) {
        const originalGeneratePackage = app.generateRadioPackage;
        if (originalGeneratePackage) {
            app.generateRadioPackage = async function() {
                // Show sponsor before package generation
                app.enhancedSponsorIntegration?.displaySponsorBeforePackage();
                
                const result = await originalGeneratePackage.call(this);
                
                // Show sponsor after successful package generation
                if (result) {
                    setTimeout(() => {
                        app.enhancedSponsorIntegration?.displaySponsorAfterPackage();
                    }, 2000);
                }
                
                return result;
            };
        }
    }

    enhanceRadioSubmission(app) {
        // Hook into radio step navigation
        const originalNavigateStep = app.navigateToStep;
        if (originalNavigateStep) {
            app.navigateToStep = function(step) {
                const result = originalNavigateStep.call(this, step);
                
                // Show contextual sponsors based on step
                if (step === 4) { // Validation step
                    setTimeout(() => {
                        app.enhancedSponsorIntegration?.displayContextualSponsor('validation');
                    }, 1000);
                }
                
                return result;
            };
        }
    }

    async displaySponsorAfterISRC() {
        const container = document.querySelector('.isrc-input-group') || 
                         document.getElementById('radio-isrc')?.parentElement;
        
        if (container && this.googleDriveManager) {
            await this.googleDriveManager.displaySponsorContent('after_isrc', container);
        }
    }

    async displaySponsorBeforePackage() {
        const container = document.getElementById('radio-step-6') || 
                         document.querySelector('.package-summary');
        
        if (container && this.googleDriveManager) {
            await this.googleDriveManager.displaySponsorContent('before_package', container);
        }
    }

    async displaySponsorAfterPackage() {
        const container = document.getElementById('package-status') || 
                         document.querySelector('.package-actions');
        
        if (container && this.googleDriveManager) {
            await this.googleDriveManager.displaySponsorContent('after_package', container);
        }
    }

    async displayContextualSponsor(context) {
        let placement = 'after_isrc';
        let container = null;

        switch (context) {
            case 'validation':
                placement = 'validation';
                container = document.getElementById('radio-validation-results');
                break;
            case 'split_sheets':
                placement = 'split_sheets';
                container = document.getElementById('split-sheets');
                break;
            default:
                return;
        }

        if (container && this.googleDriveManager) {
            await this.googleDriveManager.displaySponsorContent(placement, container);
        }
    }

    // Configure Google Drive manifest URL
    setGoogleDriveManifest(url) {
        if (this.googleDriveManager) {
            this.googleDriveManager.setManifestUrl(url);
            console.log('✅ Google Drive manifest URL configured');
        }
    }

    // Get combined analytics from both systems
    async getCombinedAnalytics() {
        const analytics = {
            googleDrive: null,
            legacy: null,
            combined: {
                totalImpressions: 0,
                totalClicks: 0,
                totalInteractions: 0,
                clickThroughRate: 0
            }
        };

        // Google Drive analytics
        if (this.googleDriveManager) {
            analytics.googleDrive = this.googleDriveManager.getAnalyticsSummary();
            analytics.combined.totalImpressions += analytics.googleDrive.totalImpressions;
            analytics.combined.totalClicks += analytics.googleDrive.totalClicks;
            analytics.combined.totalInteractions += analytics.googleDrive.totalInteractions;
        }

        // Legacy system analytics
        if (this.legacySponsorManager) {
            analytics.legacy = await this.legacySponsorManager.getSponsorAnalytics();
            analytics.combined.totalImpressions += analytics.legacy.totalImpressions || 0;
            analytics.combined.totalClicks += analytics.legacy.totalClicks || 0;
        }

        // Calculate combined CTR
        if (analytics.combined.totalImpressions > 0) {
            analytics.combined.clickThroughRate = 
                (analytics.combined.totalClicks / analytics.combined.totalImpressions * 100).toFixed(2);
        }

        return analytics;
    }

    // Admin dashboard integration
    async getAdminDashboardData() {
        const analytics = await this.getCombinedAnalytics();
        
        return {
            status: this.isInitialized ? 'Active' : 'Inactive',
            googleDriveEnabled: !!this.googleDriveManager?.manifestUrl,
            legacyEnabled: !!this.legacySponsorManager?.sponsorConfig?.enabled,
            analytics: analytics.combined,
            lastUpdate: new Date().toISOString()
        };
    }

    // Test Google Drive connection
    async testGoogleDriveConnection() {
        if (!this.googleDriveManager) {
            return { success: false, error: 'Google Drive manager not initialized' };
        }

        try {
            const manifest = await this.googleDriveManager.fetchSponsorManifest();
            return {
                success: !!manifest,
                data: manifest ? {
                    version: manifest.version,
                    sponsorCount: manifest.sponsors?.length || 0,
                    activeSponsors: manifest.sponsors?.filter(s => s.active).length || 0
                } : null
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Static integration method
    static enhanceApp(app) {
        const integration = new EnhancedSponsorIntegration();
        app.enhancedSponsorIntegration = integration;
        
        // Initialize when app is ready
        if (app.isInitialized) {
            integration.initialize(app);
        } else {
            // Wait for app initialization
            const checkInit = setInterval(() => {
                if (app.isInitialized) {
                    clearInterval(checkInit);
                    integration.initialize(app);
                }
            }, 100);
        }

        return integration;
    }
}

window.EnhancedSponsorIntegration = EnhancedSponsorIntegration;