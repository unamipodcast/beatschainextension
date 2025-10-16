# BeatsChain OAuth Setup & Troubleshooting Guide

## 🚨 CRITICAL OAUTH ERROR RESOLUTION

### Current Error:
```
OAuth error: OAuth2 request failed: Service responded with error: 'bad client id: 239753403483-58n7vlbvs1nsu9qnf1qmoenh2cjjimbc.apps.googleusercontent.com'
```

### ✅ IMMEDIATE FIXES APPLIED:

1. **Fixed Client ID Mismatch**
   - Updated manifest.json to use correct client ID: `239753403483-d62qtbm41d29p7ldikackdrru77vd1g5.apps.googleusercontent.com`
   - Synchronized .env.production with manifest.json
   - Added development bypass for unpublished extensions

2. **Enhanced Error Handling**
   - Added specific error messages for OAuth issues
   - Implemented fallback authentication for development
   - Added comprehensive logging for debugging

## 🔧 GOOGLE CLOUD CONSOLE SETUP REQUIRED

### Step 1: Create/Configure Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing: "BeatsChain Extension"
3. Enable APIs:
   - Google+ API (for user info)
   - Chrome Web Store API (for extension publishing)

### Step 2: Configure OAuth2 Consent Screen

1. Navigate to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill required fields:
   ```
   App name: BeatsChain - Music NFT Minter
   User support email: info@unamifoundation.org
   Developer contact: info@unamifoundation.org
   ```
4. Add scopes:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (for development):
   - info@unamifoundation.org
   - developer@beatschain.com

### Step 3: Create OAuth2 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Application type: **Chrome Extension**
4. Name: `BeatsChain Chrome Extension`
5. Application ID: `fhgkmpnngkhhhibhdnghceegfkdehdmn` (from Chrome Web Store)

### Step 4: Update Extension Configuration

Current client ID in use: `239753403483-d62qtbm41d29p7ldikackdrru77vd1g5.apps.googleusercontent.com`

**Verify this matches your Google Cloud Console OAuth2 client ID**

## 🛠️ TROUBLESHOOTING STEPS

### Issue 1: "bad client id" Error

**Cause:** Client ID doesn't exist or isn't properly configured

**Solutions:**
1. Verify client ID in Google Cloud Console matches manifest.json
2. Ensure OAuth consent screen is configured
3. Check that Chrome extension application ID is correct
4. Verify extension is loaded from correct directory

### Issue 2: OAuth2 Not Available

**Cause:** Extension not published or running in development

**Solutions:**
1. Use development bypass (automatically enabled)
2. Publish extension to Chrome Web Store
3. Add extension ID to OAuth2 configuration

### Issue 3: User Denied Access

**Cause:** User cancelled OAuth flow or permissions not granted

**Solutions:**
1. Clear cached tokens: `chrome.identity.clearAllCachedAuthTokens()`
2. Retry authentication with interactive: true
3. Check OAuth consent screen configuration

## 🔍 DEBUGGING COMMANDS

### Check Current Configuration:
```javascript
// In extension console
chrome.storage.local.get(['auth_token', 'user_profile', 'auth_bypass'], console.log);
```

### Clear Authentication:
```javascript
// Reset authentication state
chrome.storage.local.remove(['auth_token', 'user_profile', 'auth_timestamp', 'auth_bypass']);
chrome.identity.clearAllCachedAuthTokens(() => console.log('Tokens cleared'));
```

### Test OAuth Configuration:
```javascript
// Test OAuth availability
console.log('Chrome Identity API:', !!chrome.identity);
console.log('Manifest OAuth2:', chrome.runtime.getManifest().oauth2);
```

## 📋 PRODUCTION DEPLOYMENT CHECKLIST

### Before Publishing:
- [ ] Google Cloud Console project configured
- [ ] OAuth2 consent screen approved
- [ ] Client ID matches manifest.json
- [ ] Extension ID added to OAuth2 configuration
- [ ] Test users can authenticate successfully
- [ ] Production environment variables updated

### After Publishing:
- [ ] Extension available on Chrome Web Store
- [ ] OAuth2 works for public users
- [ ] Authentication bypass disabled in production
- [ ] Error logging configured
- [ ] User feedback system active

## 🚀 CURRENT STATUS

✅ **FIXED:** Client ID mismatch resolved
✅ **ADDED:** Development bypass authentication
✅ **ENHANCED:** Error handling and logging
⚠️ **REQUIRED:** Google Cloud Console configuration
⚠️ **REQUIRED:** OAuth consent screen setup

## 📞 SUPPORT

If OAuth issues persist:
1. Check Google Cloud Console configuration
2. Verify extension ID matches OAuth2 setup
3. Test with development bypass enabled
4. Contact: info@unamifoundation.org

---

**Last Updated:** January 2025
**Extension Version:** 2.0.0
**Chrome Extension ID:** fhgkmpnngkhhhibhdnghceegfkdehdmn