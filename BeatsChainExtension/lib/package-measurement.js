/**
 * Package Measurement System - Comprehensive Analytics
 * Tracks radio packages, mint packages, ISRC generation, and IPFS storage
 */

class PackageMeasurementSystem {
    constructor() {
        this.storageKey = 'package_measurements';
        this.measurements = null;
        this.consentManager = null;
        this.ipfsManager = null;
        this.isrcManager = null;
    }

    async initialize(consentManager, ipfsManager, isrcManager) {
        this.consentManager = consentManager;
        this.ipfsManager = ipfsManager;
        this.isrcManager = isrcManager;
        
        await this.loadMeasurements();
        console.log('✅ Package Measurement System initialized');
    }

    async loadMeasurements() {
        try {
            const result = await chrome.storage.local.get([this.storageKey]);
            this.measurements = result[this.storageKey] || this.getDefaultMeasurements();
        } catch (error) {
            console.error('Failed to load measurements:', error);
            this.measurements = this.getDefaultMeasurements();
        }
    }

    getDefaultMeasurements() {
        return {
            version: '1.0.0',
            created: Date.now(),
            packages: {
                radio: {
                    total: 0,
                    successful: 0,
                    failed: 0,
                    withISRC: 0,
                    withIPFS: 0,
                    avgFileSize: 0,
                    totalFileSize: 0
                },
                mint: {
                    total: 0,
                    successful: 0,
                    failed: 0,
                    withISRC: 0,
                    withIPFS: 0,
                    avgFileSize: 0,
                    totalFileSize: 0
                }
            },
            isrc: {
                generated: 0,
                stored: 0,
                ipfsStored: 0,
                registrySize: 0,
                lastGenerated: null
            },
            ipfs: {
                uploads: 0,
                successful: 0,
                failed: 0,
                totalSize: 0,
                avgSize: 0,
                isrcMetadata: 0
            },
            daily: {},
            monthly: {}
        };
    }

    async saveMeasurements() {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        try {
            this.measurements.lastUpdated = Date.now();
            await chrome.storage.local.set({ [this.storageKey]: this.measurements });
        } catch (error) {
            console.error('Failed to save measurements:', error);
        }
    }

    // Radio Package Measurements
    async recordRadioPackageStart(packageData) {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        this.measurements.packages.radio.total++;
        await this.recordDailyActivity('radio_package_start');
        await this.saveMeasurements();
    }

    async recordRadioPackageSuccess(packageData) {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        const pkg = this.measurements.packages.radio;
        pkg.successful++;
        
        if (packageData.fileSize) {
            pkg.totalFileSize += packageData.fileSize;
            pkg.avgFileSize = pkg.totalFileSize / pkg.successful;
        }
        
        if (packageData.hasISRC) {
            pkg.withISRC++;
        }
        
        if (packageData.hasIPFS) {
            pkg.withIPFS++;
        }
        
        await this.recordDailyActivity('radio_package_success');
        await this.saveMeasurements();
        
        console.log('📊 Radio package success recorded:', {
            total: pkg.successful,
            withISRC: pkg.withISRC,
            withIPFS: pkg.withIPFS
        });
    }

    async recordRadioPackageFailure(error) {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        this.measurements.packages.radio.failed++;
        await this.recordDailyActivity('radio_package_failure');
        await this.saveMeasurements();
    }

    // Mint Package Measurements
    async recordMintPackageStart(packageData) {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        this.measurements.packages.mint.total++;
        await this.recordDailyActivity('mint_package_start');
        await this.saveMeasurements();
    }

    async recordMintPackageSuccess(packageData) {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        const pkg = this.measurements.packages.mint;
        pkg.successful++;
        
        if (packageData.fileSize) {
            pkg.totalFileSize += packageData.fileSize;
            pkg.avgFileSize = pkg.totalFileSize / pkg.successful;
        }
        
        if (packageData.hasISRC) {
            pkg.withISRC++;
        }
        
        if (packageData.hasIPFS) {
            pkg.withIPFS++;
        }
        
        await this.recordDailyActivity('mint_package_success');
        await this.saveMeasurements();
        
        console.log('📊 Mint package success recorded:', {
            total: pkg.successful,
            withISRC: pkg.withISRC,
            withIPFS: pkg.withIPFS
        });
    }

    async recordMintPackageFailure(error) {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        this.measurements.packages.mint.failed++;
        await this.recordDailyActivity('mint_package_failure');
        await this.saveMeasurements();
    }

    // ISRC Measurements
    async recordISRCGeneration(isrcData) {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        const isrc = this.measurements.isrc;
        isrc.generated++;
        isrc.lastGenerated = Date.now();
        
        // Check if ISRC is stored locally
        if (this.isrcManager?.registry?.codes) {
            isrc.registrySize = Object.keys(this.isrcManager.registry.codes).length;
            isrc.stored = isrc.registrySize;
        }
        
        await this.recordDailyActivity('isrc_generated');
        await this.saveMeasurements();
        
        console.log('📊 ISRC generation recorded:', {
            generated: isrc.generated,
            stored: isrc.stored
        });
    }

    async recordISRCIPFSStorage(isrcData, ipfsResult) {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        if (ipfsResult.success) {
            this.measurements.isrc.ipfsStored++;
            await this.recordDailyActivity('isrc_ipfs_stored');
        }
        
        await this.saveMeasurements();
        
        console.log('📊 ISRC IPFS storage recorded:', {
            ipfsStored: this.measurements.isrc.ipfsStored,
            success: ipfsResult.success
        });
    }

    // IPFS Measurements
    async recordIPFSUpload(uploadData, result) {
        if (!this.consentManager?.hasAnalyticsConsent()) return;
        
        const ipfs = this.measurements.ipfs;
        ipfs.uploads++;
        
        if (result.success) {
            ipfs.successful++;
            if (result.size) {
                ipfs.totalSize += result.size;
                ipfs.avgSize = ipfs.totalSize / ipfs.successful;
            }
        } else {
            ipfs.failed++;
        }
        
        // Track ISRC metadata uploads
        if (uploadData.type === 'isrc_metadata') {
            ipfs.isrcMetadata++;
        }
        
        await this.recordDailyActivity('ipfs_upload');
        await this.saveMeasurements();
        
        console.log('📊 IPFS upload recorded:', {
            uploads: ipfs.uploads,
            successful: ipfs.successful,
            totalSize: this.formatBytes(ipfs.totalSize)
        });
    }

    // Daily Activity Tracking
    async recordDailyActivity(activity) {
        const today = new Date().toDateString();
        
        if (!this.measurements.daily[today]) {
            this.measurements.daily[today] = {};
        }
        
        this.measurements.daily[today][activity] = (this.measurements.daily[today][activity] || 0) + 1;
        
        // Also record monthly
        const monthKey = this.getMonthKey();
        if (!this.measurements.monthly[monthKey]) {
            this.measurements.monthly[monthKey] = {};
        }
        
        this.measurements.monthly[monthKey][activity] = (this.measurements.monthly[monthKey][activity] || 0) + 1;
    }

    getMonthKey() {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}`;
    }

    // Analytics and Reporting
    generatePackageReport() {
        const radio = this.measurements.packages.radio;
        const mint = this.measurements.packages.mint;
        
        return {
            radio: {
                total: radio.total,
                successful: radio.successful,
                failed: radio.failed,
                successRate: radio.total > 0 ? ((radio.successful / radio.total) * 100).toFixed(1) : 0,
                isrcRate: radio.successful > 0 ? ((radio.withISRC / radio.successful) * 100).toFixed(1) : 0,
                ipfsRate: radio.successful > 0 ? ((radio.withIPFS / radio.successful) * 100).toFixed(1) : 0,
                avgFileSize: this.formatBytes(radio.avgFileSize)
            },
            mint: {
                total: mint.total,
                successful: mint.successful,
                failed: mint.failed,
                successRate: mint.total > 0 ? ((mint.successful / mint.total) * 100).toFixed(1) : 0,
                isrcRate: mint.successful > 0 ? ((mint.withISRC / mint.successful) * 100).toFixed(1) : 0,
                ipfsRate: mint.successful > 0 ? ((mint.withIPFS / mint.successful) * 100).toFixed(1) : 0,
                avgFileSize: this.formatBytes(mint.avgFileSize)
            },
            combined: {
                totalPackages: radio.successful + mint.successful,
                totalISRC: radio.withISRC + mint.withISRC,
                totalIPFS: radio.withIPFS + mint.withIPFS
            }
        };
    }

    generateISRCReport() {
        const isrc = this.measurements.isrc;
        
        return {
            generated: isrc.generated,
            stored: isrc.stored,
            ipfsStored: isrc.ipfsStored,
            registrySize: isrc.registrySize,
            ipfsStorageRate: isrc.generated > 0 ? ((isrc.ipfsStored / isrc.generated) * 100).toFixed(1) : 0,
            lastGenerated: isrc.lastGenerated ? new Date(isrc.lastGenerated).toLocaleString() : 'Never'
        };
    }

    generateIPFSReport() {
        const ipfs = this.measurements.ipfs;
        
        return {
            uploads: ipfs.uploads,
            successful: ipfs.successful,
            failed: ipfs.failed,
            successRate: ipfs.uploads > 0 ? ((ipfs.successful / ipfs.uploads) * 100).toFixed(1) : 0,
            totalSize: this.formatBytes(ipfs.totalSize),
            avgSize: this.formatBytes(ipfs.avgSize),
            isrcMetadata: ipfs.isrcMetadata
        };
    }

    generateDailyReport(days = 7) {
        const report = {};
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toDateString();
            
            report[dateKey] = this.measurements.daily[dateKey] || {};
        }
        
        return report;
    }

    // Compliance and Quality Metrics
    getComplianceMetrics() {
        const radio = this.measurements.packages.radio;
        const mint = this.measurements.packages.mint;
        const isrc = this.measurements.isrc;
        
        return {
            isrcCompliance: {
                radioPackages: radio.successful > 0 ? ((radio.withISRC / radio.successful) * 100).toFixed(1) : 0,
                mintPackages: mint.successful > 0 ? ((mint.withISRC / mint.successful) * 100).toFixed(1) : 0,
                overall: (radio.successful + mint.successful) > 0 ? 
                    (((radio.withISRC + mint.withISRC) / (radio.successful + mint.successful)) * 100).toFixed(1) : 0
            },
            ipfsCompliance: {
                radioPackages: radio.successful > 0 ? ((radio.withIPFS / radio.successful) * 100).toFixed(1) : 0,
                mintPackages: mint.successful > 0 ? ((mint.withIPFS / mint.successful) * 100).toFixed(1) : 0,
                overall: (radio.successful + mint.successful) > 0 ? 
                    (((radio.withIPFS + mint.withIPFS) / (radio.successful + mint.successful)) * 100).toFixed(1) : 0
            },
            qualityScore: this.calculateQualityScore()
        };
    }

    calculateQualityScore() {
        const radio = this.measurements.packages.radio;
        const mint = this.measurements.packages.mint;
        const ipfs = this.measurements.ipfs;
        
        let score = 0;
        let factors = 0;
        
        // Success rate factor (40%)
        const totalPackages = radio.total + mint.total;
        const successfulPackages = radio.successful + mint.successful;
        if (totalPackages > 0) {
            score += (successfulPackages / totalPackages) * 40;
            factors++;
        }
        
        // ISRC compliance factor (30%)
        if (successfulPackages > 0) {
            const isrcCompliance = (radio.withISRC + mint.withISRC) / successfulPackages;
            score += isrcCompliance * 30;
            factors++;
        }
        
        // IPFS success rate factor (30%)
        if (ipfs.uploads > 0) {
            score += (ipfs.successful / ipfs.uploads) * 30;
            factors++;
        }
        
        return factors > 0 ? Math.round(score / factors * 100) / 100 : 0;
    }

    // Export and Integration
    async exportMeasurements() {
        const report = {
            packages: this.generatePackageReport(),
            isrc: this.generateISRCReport(),
            ipfs: this.generateIPFSReport(),
            compliance: this.getComplianceMetrics(),
            daily: this.generateDailyReport(),
            exportedAt: new Date().toISOString(),
            version: this.measurements.version
        };
        
        return report;
    }

    // Store ISRC metadata on IPFS
    async storeISRCMetadataOnIPFS(isrcData) {
        if (!this.ipfsManager) return null;
        
        try {
            const metadata = {
                isrc: isrcData.isrc,
                trackTitle: isrcData.trackTitle,
                artistName: isrcData.artistName,
                generated: isrcData.generated,
                registrant: '80G',
                territory: 'ZA',
                beatsChainVersion: '2.4.1',
                timestamp: Date.now()
            };
            
            const result = await this.ipfsManager.uploadJSON(metadata, `isrc-${isrcData.isrc}.json`);
            
            if (result.success) {
                await this.recordISRCIPFSStorage(isrcData, result);
                console.log('✅ ISRC metadata stored on IPFS:', result.ipfsHash);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Failed to store ISRC metadata on IPFS:', error);
            return { success: false, error: error.message };
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

window.PackageMeasurementSystem = PackageMeasurementSystem;