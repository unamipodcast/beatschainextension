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
        // Hook into ISRC generation button click
        const isrcButton = document.getElementById('generate-isrc-btn');
        if (isrcButton) {
            const originalClick = isrcButton.onclick;
            isrcButton.addEventListener('click', () => {
                // Show sponsor after ISRC generation
                setTimeout(() => {
                    this.displaySponsorAfterISRC();
                }, 1500);
            });
        }
        
        // Also hook into the ISRC manager method if available
        if (app.isrcManager && app.isrcManager.handleISRCGeneration) {
            const originalMethod = app.isrcManager.handleISRCGeneration.bind(app.isrcManager);
            app.isrcManager.handleISRCGeneration = async function() {
                const result = await originalMethod();
                
                // Show sponsor after ISRC generation
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
        console.log('🎯 Attempting to display sponsor after ISRC...');
        
        // Find container AFTER the ISRC input group, not inside it
        let container = document.querySelector('.isrc-input-group')?.parentElement;
        if (!container) {
            container = document.getElementById('radio-isrc')?.closest('.form-row')?.parentElement;
        }
        if (!container) {
            container = document.getElementById('radio-step-2');
        }
        
        console.log('📍 Container found:', !!container, container?.id || container?.className);
        console.log('📊 Google Drive Manager:', !!this.googleDriveManager);
        
        if (container && this.googleDriveManager) {
            try {
                // Create separate sponsor section
                let sponsorSection = container.querySelector('.sponsor-section');
                if (!sponsorSection) {
                    sponsorSection = document.createElement('div');
                    sponsorSection.className = 'sponsor-section';
                    sponsorSection.style.marginTop = '15px';
                    container.appendChild(sponsorSection);
                }
                
                await this.googleDriveManager.displaySponsorContent('after_isrc', sponsorSection);
                console.log('✅ Sponsor content displayed successfully');
            } catch (error) {
                console.error('❌ Sponsor display failed:', error);
            }
        } else {
            console.warn('⚠️ Missing container or Google Drive manager for sponsor display');
        }
    }

    async displaySponsorBeforePackage() {
        const container = document.getElementById('radio-step-6') || 
                         document.querySelector('.package-summary') ||
                         document.getElementById('generate-radio-package')?.parentElement;
        
        if (container && this.googleDriveManager) {
            // Create separate sponsor section
            let sponsorSection = container.querySelector('.before-package-sponsor-section');
            if (!sponsorSection) {
                sponsorSection = document.createElement('div');
                sponsorSection.className = 'before-package-sponsor-section';
                sponsorSection.style.marginBottom = '15px';
                container.insertBefore(sponsorSection, container.firstChild);
            }
            
            await this.googleDriveManager.displaySponsorContent('before_package', sponsorSection);
        }
    }

    async displaySponsorAfterPackage() {
        const container = document.getElementById('radio-step-6') || 
                         document.querySelector('.package-actions') ||
                         document.getElementById('generate-radio-package')?.parentElement;
        
        if (container && this.googleDriveManager) {
            // Create separate sponsor section
            let sponsorSection = container.querySelector('.after-package-sponsor-section');
            if (!sponsorSection) {
                sponsorSection = document.createElement('div');
                sponsorSection.className = 'after-package-sponsor-section';
                sponsorSection.style.marginTop = '15px';
                container.appendChild(sponsorSection);
            }
            
            await this.googleDriveManager.displaySponsorContent('after_package', sponsorSection);
        }
    }

    // Position 2: After "Validate for Radio" click
    async displayValidationSponsor() {
        const container = document.getElementById('radio-results') || document.getElementById('radio-step-4');
        
        if (container && this.googleDriveManager) {
            // Clear any existing validation sponsors
            const existing = container.querySelector('.validation-sponsor-section');
            if (existing) existing.remove();
            
            const sponsorSection = document.createElement('div');
            sponsorSection.className = 'validation-sponsor-section';
            sponsorSection.style.cssText = 'margin: 15px 0; clear: both;';
            container.appendChild(sponsorSection);
            
            await this.googleDriveManager.displaySponsorContent('before_package', sponsorSection);
        }
    }
    
    // Position 3: Before "Generate Radio Package" button
    async displayPackageSponsor() {
        const generateBtn = document.getElementById('generate-radio-package');
        const container = generateBtn?.parentElement;
        
        if (container && this.googleDriveManager) {
            // Clear any existing package sponsors
            const existing = container.querySelector('.package-sponsor-section');
            if (existing) existing.remove();
            
            const sponsorSection = document.createElement('div');
            sponsorSection.className = 'package-sponsor-section';
            sponsorSection.style.cssText = 'margin: 15px 0 10px 0; clear: both;';
            container.insertBefore(sponsorSection, generateBtn);
            
            await this.googleDriveManager.displaySponsorContent('after_package', sponsorSection);
        }
    }
    
    // Position 4: Post-Package Success (NEW)
    async displayPostPackageSponsor(fileCount, title) {
        if (!this.googleDriveManager) {
            console.warn('⚠️ Google Drive manager not available for post-package sponsor');
            return;
        }
        
        // Create floating sponsor container
        const sponsorContainer = document.createElement('div');
        sponsorContainer.className = 'post-package-sponsor-container';
        sponsorContainer.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            max-width: 320px; z-index: 10001;
        `;
        
        document.body.appendChild(sponsorContainer);
        
        // Display Google Drive sponsor content
        await this.googleDriveManager.displaySponsorContent('post_package', sponsorContainer);
        
        // Auto-remove after 10 seconds if no interaction
        setTimeout(() => {
            if (sponsorContainer.parentNode && !sponsorContainer.querySelector('.sponsor-interacted')) {
                sponsorContainer.remove();
            }
        }, 10000);
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

    // Manual trigger for testing
    async testSponsorDisplay(placement = 'after_isrc') {
        console.log(`🧪 Testing sponsor display for placement: ${placement}`);
        
        if (!this.googleDriveManager) {
            console.error('❌ Google Drive manager not available');
            return false;
        }
        
        // Find any suitable container
        const containers = [
            document.querySelector('.isrc-input-group'),
            document.getElementById('radio-isrc')?.parentElement,
            document.querySelector('.form-row'),
            document.getElementById('radio-step-2'),
            document.querySelector('.radio-step.active')
        ].filter(Boolean);
        
        if (containers.length === 0) {
            console.error('❌ No suitable container found for sponsor display');
            return false;
        }
        
        const container = containers[0];
        console.log(`📍 Using container:`, container.id || container.className);
        
        try {
            await this.googleDriveManager.displaySponsorContent(placement, container);
            console.log('✅ Test sponsor display successful');
            return true;
        } catch (error) {
            console.error('❌ Test sponsor display failed:', error);
            return false;
        }
    }
    
    // Static integration method
    static enhanceApp(app) {
        const integration = new EnhancedSponsorIntegration();
        app.enhancedSponsorIntegration = integration;
        
        // Make available globally for testing
        window.testSponsorDisplay = () => integration.testSponsorDisplay();
        
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