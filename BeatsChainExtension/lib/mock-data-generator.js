// Mock Data Generator for Asset Hub Testing
class MockDataGenerator {
  static async generateMockData() {
    const mockNFTs = [
      {
        id: 'nft_001',
        type: 'nft',
        title: 'Midnight Vibes',
        artist: 'DJ Shadow',
        genre: 'Hip-Hop',
        isrc: 'ZA-80G-25-00001',
        duration: '3:45',
        format: 'MP3',
        audioUrl: 'blob:mock-audio-1',
        coverUrl: 'blob:mock-cover-1',
        blockchain: {
          contract: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A',
          tokenId: '1001',
          transactionHash: '0x123abc...',
          network: 'Polygon Mumbai'
        },
        createdAt: '2025-01-15T10:30:00Z',
        plays: 127,
        likes: 23,
        isMockData: true
      },
      {
        id: 'nft_002',
        type: 'nft',
        title: 'Electric Dreams',
        artist: 'Synth Master',
        genre: 'Electronic',
        isrc: 'ZA-80G-25-00002',
        duration: '4:12',
        format: 'WAV',
        audioUrl: 'blob:mock-audio-2',
        coverUrl: 'blob:mock-cover-2',
        blockchain: {
          contract: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A',
          tokenId: '1002',
          transactionHash: '0x456def...',
          network: 'Polygon Mumbai'
        },
        createdAt: '2025-01-14T15:20:00Z',
        plays: 89,
        likes: 15,
        isMockData: true
      },
      {
        id: 'nft_003',
        type: 'nft',
        title: 'Afro Fusion',
        artist: 'Kwaito King',
        genre: 'Kwaito',
        isrc: 'ZA-80G-25-00003',
        duration: '3:28',
        format: 'MP3',
        audioUrl: 'blob:mock-audio-3',
        coverUrl: 'blob:mock-cover-3',
        blockchain: {
          contract: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A',
          tokenId: '1003',
          transactionHash: '0x789ghi...',
          network: 'Polygon Mumbai'
        },
        createdAt: '2025-01-13T09:15:00Z',
        plays: 203,
        likes: 41,
        isMockData: true
      },
      {
        id: 'nft_004',
        type: 'nft',
        title: 'Gospel Harmony',
        artist: 'Praise Voices',
        genre: 'Gospel',
        isrc: 'ZA-80G-25-00004',
        duration: '5:03',
        format: 'FLAC',
        audioUrl: 'blob:mock-audio-4',
        coverUrl: 'blob:mock-cover-4',
        blockchain: {
          contract: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A',
          tokenId: '1004',
          transactionHash: '0xabcjkl...',
          network: 'Polygon Mumbai'
        },
        createdAt: '2025-01-12T14:45:00Z',
        plays: 156,
        likes: 32,
        isMockData: true
      }
    ];

    const mockCampaigns = [
      {
        id: 'campaign_001',
        type: 'campaign',
        title: 'Summer Music Festival Promo',
        artist: 'Festival Sponsors',
        description: 'Promoting upcoming summer music festival with local artists',
        status: 'active',
        impressions: 15420,
        clicks: 892,
        createdAt: '2025-01-10T08:00:00Z',
        isMockData: true
      },
      {
        id: 'campaign_002',
        type: 'campaign',
        title: 'New Artist Spotlight',
        artist: 'Music Discovery',
        description: 'Highlighting emerging talent in South African music scene',
        status: 'active',
        impressions: 8750,
        clicks: 445,
        createdAt: '2025-01-08T12:30:00Z',
        isMockData: true
      },
      {
        id: 'campaign_003',
        type: 'campaign',
        title: 'Hip-Hop Heritage Month',
        artist: 'Cultural Events',
        description: 'Celebrating hip-hop culture and its impact on South African music',
        status: 'completed',
        impressions: 22100,
        clicks: 1340,
        createdAt: '2025-01-05T16:20:00Z',
        isMockData: true
      }
    ];

    const mockISRCRegistry = [
      {
        id: 'isrc_001',
        isrc: 'ZA-80G-25-00001',
        artist: 'DJ Shadow',
        title: 'Midnight Vibes',
        status: 'active',
        embedded: true,
        createdAt: '2025-01-15T10:25:00Z',
        isMockData: true
      },
      {
        id: 'isrc_002',
        isrc: 'ZA-80G-25-00002',
        artist: 'Synth Master',
        title: 'Electric Dreams',
        status: 'active',
        embedded: true,
        createdAt: '2025-01-14T15:15:00Z',
        isMockData: true
      },
      {
        id: 'isrc_003',
        isrc: 'ZA-80G-25-00003',
        artist: 'Kwaito King',
        title: 'Afro Fusion',
        status: 'active',
        embedded: true,
        createdAt: '2025-01-13T09:10:00Z',
        isMockData: true
      }
    ];

    // Store in Chrome storage
    await chrome.storage.local.set({
      nftAssets: mockNFTs,
      campaigns: mockCampaigns,
      isrcRegistry: mockISRCRegistry
    });

    console.log('✅ Mock data generated and stored');
    return { nftAssets: mockNFTs, campaigns: mockCampaigns, isrcRegistry: mockISRCRegistry };
  }

  static async clearMockData() {
    await chrome.storage.local.remove(['nftAssets', 'campaigns', 'isrcRegistry']);
    console.log('🗑️ Mock data cleared');
  }
}

// Auto-generate mock data on load for testing
document.addEventListener('DOMContentLoaded', async () => {
  // Check if we're in development/testing mode
  const isDev = window.location.hostname === 'localhost' || chrome.runtime?.id?.includes('dev');
  
  if (isDev) {
    // Check if mock data already exists
    const existing = await chrome.storage.local.get(['nftAssets', 'campaigns', 'isrcRegistry']);
    
    if (!existing.nftAssets || existing.nftAssets.length === 0) {
      console.log('🔧 Generating mock data for testing...');
      await MockDataGenerator.generateMockData();
    }
  }
});

window.MockDataGenerator = MockDataGenerator;