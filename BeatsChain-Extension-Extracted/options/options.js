document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const credentials = {
        THIRDWEB_CLIENT_ID: document.getElementById('thirdweb-client-id').value.trim(),
        PINATA_API_KEY: document.getElementById('pinata-api-key').value.trim(),
        PINATA_SECRET_KEY: document.getElementById('pinata-secret-key').value.trim()
    };
    
    try {
        await chrome.storage.local.set(credentials);
        showStatus('Configuration saved successfully!', 'success');
    } catch (error) {
        showStatus('Failed to save configuration', 'error');
    }
});

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    setTimeout(() => status.textContent = '', 3000);
}

// Load existing values
chrome.storage.local.get(['THIRDWEB_CLIENT_ID', 'PINATA_API_KEY', 'PINATA_SECRET_KEY']).then(result => {
    if (result.THIRDWEB_CLIENT_ID) document.getElementById('thirdweb-client-id').value = result.THIRDWEB_CLIENT_ID;
    if (result.PINATA_API_KEY) document.getElementById('pinata-api-key').value = result.PINATA_API_KEY;
    if (result.PINATA_SECRET_KEY) document.getElementById('pinata-secret-key').value = result.PINATA_SECRET_KEY;
});