/**
 * OAuth Fix - Ensures extension works with or without valid OAuth
 */

// Override OAuth initialization to handle errors gracefully
(function() {
    'use strict';
    
    // Store original chrome.identity methods
    const originalGetAuthToken = chrome.identity?.getAuthToken;
    
    if (originalGetAuthToken) {
        // Wrap getAuthToken with error handling
        chrome.identity.getAuthToken = function(details, callback) {
            try {
                originalGetAuthToken.call(this, details, function(token) {
                    if (chrome.runtime.lastError) {
                        const error = chrome.runtime.lastError.message;
                        
                        // Handle specific OAuth errors
                        if (error.includes('bad client id') || error.includes('invalid_client')) {
                            console.warn('🔧 OAuth client ID invalid - enabling guest mode');
                            
                            // Trigger guest mode in auth manager
                            if (window.UnifiedAuthenticationManager) {
                                const auth = new UnifiedAuthenticationManager();
                                auth.enableGuestMode();
                            }
                            
                            // Call callback with null token (guest mode)
                            callback(null);
                            return;
                        }
                    }
                    
                    // Normal OAuth flow
                    callback(token);
                });
            } catch (error) {
                console.warn('🔧 OAuth error caught:', error.message);
                callback(null);
            }
        };
    }
    
    console.log('🔧 OAuth fix applied - extension will work with or without valid OAuth');
})();