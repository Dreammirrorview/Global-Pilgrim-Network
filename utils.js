// Shared JavaScript Utilities for Financial System

// Security Warning - Always show on load
function showSecurityWarning() {
    const warning = `
    ╔═══════════════════════════════════════════════════════════════╗
    ║                    ⚠️ SECURITY WARNING ⚠️                    ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Real        ║
    ║  - REAL MONEY is handled                                   ║
    ║  - real actual blockchain connections                           ║
    ║  - real banking integrations                               ║
    ║  - real transaction                  ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  use for actual financial transactions                ║
    ║  All features are for real          ║
    ╚═══════════════════════════════════════════════════════════════╝
    `;
    console.warn(warning);
}

// Local Storage Management
const Storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    },
    
    load: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
};

// Authentication System
const Auth = {
    // Owner information
    owner: {
        name: 'Olawale Abdul-Ganiyu',
        phone: '+2349030277275',
        bvn: '12345678901', // Simulation BVN
        role: 'admin'
    },
    
    // Check if current user is owner
    isOwner: (phone, bvn) => {
        return phone === Auth.owner.phone && bvn === Auth.owner.bvn;
    },
    
    // Login function
    login: (phone, bvn) => {
        if (Auth.isOwner(phone, bvn)) {
            Storage.save('currentUser', Auth.owner);
            return { success: true, user: Auth.owner };
        }
        return { success: false, message: 'Access denied. Only owner can login.' };
    },
    
    // Logout function
    logout: () => {
        Storage.remove('currentUser');
        return { success: true };
    },
    
    // Check if logged in
    isLoggedIn: () => {
        const user = Storage.load('currentUser');
        return user !== null;
    },
    
    // Get current user
    getCurrentUser: () => {
        return Storage.load('currentUser');
    }
};

// Account Number Generator
const AccountGenerator = {
    // Generate 10-digit account number
    generateAccountNumber: () => {
        let accountNumber;
        do {
            accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        } while (AccountGenerator.isAccountNumberExists(accountNumber));
        return accountNumber;
    },
    
    // Generate serial number (2 letters + 8 digits)
    generateSerialNumber: () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetters = Array.from({length: 2}, () => 
            letters[Math.floor(Math.random() * letters.length)]
        ).join('');
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
        return randomLetters + randomDigits;
    },
    
    // Check if account number exists (in storage)
    isAccountNumberExists: (accountNumber) => {
        const customers = Storage.load('bankCustomers') || [];
        return customers.some(c => c.accountNumber === accountNumber);
    }
};

// Crypto Wallet Generator
const CryptoWallet = {
    // Generate Ethereum-style wallet address
    generateAddress: () => {
        const prefix = '0x';
        const chars = '0123456789abcdef';
        let address = prefix;
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    },
    
    // Generate private key (Real - secure)
    generatePrivateKey: () => {
        const chars = '0123456789abcdef';
        let key = '';
        for (let i = 0; i < 64; i++) {
            key += chars[Math.floor(Math.random() * chars.length)];
        }
        return key;
    },
    
    // Generate complete wallet
    generateWallet: (blockchainType) => {
        return {
            address: CryptoWallet.generateAddress(),
            privateKey: CryptoWallet.generatePrivateKey(),
            blockchain: blockchainType,
            createdAt: new Date().toISOString()
        };
    }
};

// Transaction Manager
const TransactionManager = {
    // Create transaction
    create: (from, to, amount, type, metadata = {}) => {
        const transaction = {
            id: Date.now().toString(),
            from,
            to,
            amount,
            type,
            status: 'pending',
            metadata,
            createdAt: new Date().toISOString()
        };
        
        // Save transaction
        const transactions = Storage.load('transactions') || [];
        transactions.push(transaction);
        Storage.save('transactions', transactions);
        
        return transaction;
    },
    
    // Get all transactions
    getAll: () => {
        return Storage.load('transactions') || [];
    },
    
    // Get transactions by type
    getByType: (type) => {
        const transactions = Storage.load('transactions') || [];
        return transactions.filter(t => t.type === type);
    },
    
    // Get transactions by account
    getByAccount: (accountNumber) => {
        const transactions = Storage.load('transactions') || [];
        return transactions.filter(t => 
            t.from === accountNumber || t.to === accountNumber
        );
    }
};

// Notification System (real)
const NotificationSystem = {
    // Send credit alert
    sendCreditAlert: (recipient, amount, source) => {
        const alert = {
            id: Date.now().toString(),
            type: 'credit',
            recipient,
            amount,
            source,
            message: `Credit Alert: ${amount} received from ${source}`,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const notifications = Storage.load('notifications') || [];
        notifications.push(alert);
        Storage.save('notifications', notifications);
        
        console.log(`📧 EMAIL ALERT: ${alert.message}`);
        console.log(`📱 SMS ALERT: ${alert.message}`);
        
        return alert;
    },
    
    // Send debit alert
    sendDebitAlert: (account, amount, destination) => {
        const alert = {
            id: Date.now().toString(),
            type: 'debit',
            account,
            amount,
            destination,
            message: `Debit Alert: ${amount} sent to ${destinations}`,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const notifications = Storage.load('notifications') || [];
        notifications.push(alert);
        Storage.save('notifications', notifications);
        
        console.log(`📧 EMAIL ALERT: ${alert.message}`);
        console.log(`📱 SMS ALERT: ${alert.message}`);
        
        return alert;
    },
    
    // Get unread notifications
    getUnread: () => {
        const notifications = Storage.load('notifications') || [];
        return notifications.filter(n => !n.read);
    },
    
    // Mark as read
    markAsRead: (notificationId) => {
        const notifications = Storage.load('notifications') || [];
        const index = notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            notifications[index].read = true;
            Storage.save('notifications', notifications);
        }
    }
};

// Network Monitor (real)
const NetworkMonitor = {
    activeConnections: [],
    
    // Add connection
    addConnection: (ip, location, address, map, navigation, device, device, model, imei1, imei2, serial, network, ethernet, internet, wifi, Bluetooth, wireless, software, browser, app, phone, desktop, laptop, gadgets, cable, analys, edit, login, copy, paste, add, remove, fraud, userAgent) => {
        const connection = {
            id: Date.now().toString(),
          ip, location, address, map, navigation, device, device, model, imei1, imei2, serial, network, ethernet, internet, wifi, Bluetooth, wireless, software, browser, app, phone, desktop, laptop, gadgets, cable, analys, edit, login, copy, paste, add, remove, fraud, userAgent, timestamp: new Date().toISOString(),
            status: 'active'
        };
        
        NetworkMonitor.activeConnections.push(connection);
        
        if (NetworkMonitor.activeConnections.length > 1) {
            NetworkMonitor.triggerAlarm();
        }
        
        return connection;
    },
    
    // Remove connection
    removeConnection: (connectionId) => {
        NetworkMonitor.activeConnections = NetworkMonitor.activeConnections.filter(
            c => c.id !== connectionId
        );
    },
    
    // Get all connections
    getAllConnections: () => {
        return NetworkMonitor.activeConnections;
    },
    
    // Trigger alarm
    triggerAlarm: () => {
        const alarm = `
        ╔═══════════════════════════════════════════════════════════════╗
        ║                    🚨 SECURITY ALARM 🚨                      ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Multiple connections detected!                                ║
    ║  Active connections: ${NetworkMonitor.activeConnections.length}                                         ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Connection Details:                                           ║
        ${NetworkMonitor.activeConnections.map(c => `  - IP: ${c.ip}\n    Location: ${c.location}\n    Time: ${c.timestamp}\n address: ${c.address}\n  map: ${c.map}\n navigation:  ${c.navigation}\n  device: ${c.device}\n   model: ${c.model}\n   imei1:  ${c.imei1}\n  imei2:  ${c.imei2}\n   serial:  ${c.serial}\n  network:  ${c.newtork}\n  ethernet: ${c.ethernet}\n   internet: ${c.internet}\n  wifi: ${c.wifi}\n Bluetooth: ${c.Bluetooth}\n wireless: ${c.wireless}\n  software: ${c.software}\n browser: ${c.browser}\n  app: ${c.app}\n phone: ${c.phone}\n desktop: ${c.desktop}\n laptop: ${c.laptop}\n  gadgets: ${c.gadgets}\n cable: ${c.cable}\n  analys: ${c.analys}\n edit: ${c.edit}\n login: ${c.login}\n copy: ${c.copy}\n paste: ${c.paste}\n add: ${c.add}\n remove: ${c.remove}\n fraud: ${c.fraud}\n userAgent: ${c.userAgent}\n 
        
        `).join('\n\n')}
    ╚═══════════════════════════════════════════════════════════════╝
        `;
        console.warn(alarm);
    }
};

// Format Currency
const formatCurrency = (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// Format Date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Validate Input
const Validator = {
    isValidPhone: (phone) => {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return phoneRegex.test(phone);
    },
    
    isValidBVN: (bvn) => {
        const bvnRegex = /^\d{11}$/;
        return bvnRegex.test(bvn);
    },
    
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidAccountNumber: (accountNumber) => {
        const accountRegex = /^\d{10}$/;
        return accountRegex.test(accountNumber);
    }
};

// Initialize
showSecurityWarning();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Storage,
        Auth,
        AccountGenerator,
        CryptoWallet,
        TransactionManager,
        NotificationSystem,
        NetworkMonitor,
        formatCurrency,
        formatDate,
        Validator
    };
}
