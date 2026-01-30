// Global Bank Nigeria Loginy JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const networkMonitor = document.getElementById('networkMonitor');
    const connectionCount = document.getElementById('connectionCount');
    const alarmModal = document.getElementById('alarmModal');
    const alarmContent = document.getElementById('alarmContent');
    
    // Initialize network monitoring
    initializeNetworkMonitor();
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('phone').value.trim();
        const bvn = document.getElementById('bvn').value.trim();
        const nin = document.getElementById('nin').value.trim();
        
        // Validate inputs
        if (!Validator.isValidPhone(phone)) {
            showError('Invalid phone number format');
            return;
        }
        
        if (!Validator.isValidBVN(bvn)) {
            showError('BVN must be 11 digits');
            return;
        }
        
        if (!Validator.isValidBVN(nin)) {
            showError('NIN must be 11 digits');
            return;
        }
        
        // Attempt login
        const loginResult = Auth.login(phone, bvn);
        
        if (loginResult.success) {
            // Store NIN for bank system
            Storage.save('currentNIN', nin);
            
            // Add current connection to network monitor
            const currentIP = '192.168.1.' + Math.floor(Math.random() * 255);
            const location = 'Lagos, Nigeria';
            const userAgent = navigator.userAgent;
            
            NetworkMonitor.addConnection(currentIP, location, userAgent);
            
            // Show success message
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showError(loginResult.message);
            
            // Log failed attempt
            console.warn(`Failed login attempt from ${phone}`);
        }
    });
    
    // Initialize network monitoring
    function initializeNetworkMonitor() {
        // Simulate initial connection
        const initialIP = '192.168.1.1';
        const location = 'Lagos, Nigeria';
        const userAgent = navigator.userAgent;
        
        NetworkMonitor.addConnection(initialIP, location, userAgent);
        
        // Update connection count
        updateConnectionCount();
        
        // Simulate network activity monitoring
        setInterval(monitorNetworkActivity, 5000);
    }
    
    // Monitor network activity
    function monitorNetworkActivity() {
        // Update connection count
        updateConnectionCount();
        
        // Randomly check for suspicious activity (simulation)
        if (Math.random() < 0.1) {
            simulateSuspiciousActivity();
        }
    }
    
    // Update connection count display
    function updateConnectionCount() {
        const connections = NetworkMonitor.getAllConnections();
        connectionCount.textContent = connections.length;
        
        // Check for multiple connections
        if (connections.length > 1) {
            connectionCount.style.color = '#ff0000';
            connectionCount.style.fontWeight = 'bold';
        } else {
            connectionCount.style.color = '#00ff00';
            connectionCount.style.fontWeight = 'normal';
        }
    }
    
    // Simulate suspicious activity
    function simulateSuspiciousActivity() {
        const suspiciousIP = '203.0.113.' + Math.floor(Math.random() * 255);
        const location = 'Unknown Location';
        const userAgent = 'Suspicious User Agent';
        
        NetworkMonitor.addConnection(suspiciousIP, location, userAgent);
        
        // Show alarm modal
        showAlarmModal(suspiciousIP, location);
    }
    
    // Show alarm modal
    function showAlarmModal(ip, location) {
        const connections = NetworkMonitor.getAllConnections();
        
        let connectionHTML = '<h4>Active Connections:</h4>';
        connections.forEach(conn => {
            connectionHTML += `
                <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                    <strong>IP:</strong> ${conn.ip}<br>
                    <strong>Location:</strong> ${conn.location}<br>
                    <strong>Time:</strong> ${formatDate(conn.timestamp)}
                </div>
            `;
        });
        
        alarmContent.innerHTML = `
            <p style="font-size: 18px; margin-bottom: 20px;">
                Multiple connections detected on Global Bank Nigeria system!
            </p>
            ${connectionHTML}
            <p style="margin-top: 20px; font-weight: bold;">
                This may indicate unauthorized access attempt.
            </p>
        `;
        
        alarmModal.classList.add('active');
    }
    
    // Show error message
    function showError(message) {
        // Remove existing error
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `❌ ${message}`;
        
        // Insert before form
        loginForm.parentNode.insertBefore(errorDiv, loginForm);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    // Show success message
    function showSuccess(message) {
        // Remove existing error
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create success element
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.innerHTML = `✅ ${message}`;
        
        // Insert before form
        loginForm.parentNode.insertBefore(successDiv, loginForm);
    }
});

// Close alarm modal function
function closeAlarmModal() {
    const alarmModal = document.getElementById('alarmModal');
    alarmModal.classList.remove('active');
}

// Make closeAlarmModal available globally
window.closeAlarmModal = closeAlarmModal;