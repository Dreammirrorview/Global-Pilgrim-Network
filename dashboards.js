// Pilgrim Coin Dashboards JavaScript

// Global variables
let miningInterval = null;
let miningActive = false;
let totalMined = 0;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initializeDashboard();
    setupEventListeners();
    startNetworkMonitoring();
});

// Check if user is authenticated
function checkAuthentication() {
    const user = Auth.getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display current user
    document.getElementById('currentUser').textContent = user.name;
}

// Initialize dashboard
function initializeDashboard() {
    // Initialize storage if not exists
    if (!Storage.load('pilgrimCustomers')) {
        Storage.save('pilgrimCustomers', []);
    }
    
    if (!Storage.load('pilgrimWallets')) {
        Storage.save('pilgrimWallets', []);
    }
    
    if (!Storage.load('pilgrimTransactions')) {
        Storage.save('pilgrimTransactions', []);
    }
    
    if (!Storage.load('totalMined')) {
        Storage.save('totalMined', 0);
    }
    
    // Load data
    loadDashboardData();
    updateNetworkMonitor();
}

// Load dashboard data
function loadDashboardData() {
    const customers = Storage.load('pilgrimCustomers') || [];
    const wallets = Storage.load('pilgrimWallets') || [];
    const transactions = Storage.load('pilgrimTransactions') || [];
    totalMined = Storage.load('totalMined') || 0;
    
    // Update stats
    updateStats(customers, wallets, transactions);
    
    // Update lists
    updateCustomersList(customers);
    updateWalletsList(wallets);
    updateTransactionsList(transactions);
    
    // Update form selects
    updateFormSelects(customers, wallets);
}

// Update statistics
function updateStats(customers, wallets, transactions) {
    // Calculate total balance
    let totalBalance = 0;
    customers.forEach(c => {
        totalBalance += parseFloat(c.balance) || 0;
    });
    
    // Update display
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance * 0.5, 'USD');
    document.getElementById('pilgrimBalance').textContent = totalBalance.toFixed(2) + ' PLC';
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('totalWallets').textContent = wallets.length;
    document.getElementById('todayMining').textContent = formatCurrency(totalMined * 0.5, 'USD');
    document.getElementById('todayPilgrim').textContent = totalMined.toFixed(2) + ' PLC';
    document.getElementById('minedToday').textContent = totalMined.toFixed(2) + ' PLC';
}

// Update customers list
function updateCustomersList(customers) {
    const container = document.getElementById('customersList');
    
    if (customers.length === 0) {
        container.innerHTML = '<p class="no-data">No customers registered yet</p>';
        return;
    }
    
    let html = '';
    customers.forEach(customer => {
        html += `
            <div class="customer-item">
                <div class="customer-header">
                    <div>
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-details">
                            Account: ${customer.accountNumber} | Serial: ${customer.serialNumber}
                        </div>
                        <div class="customer-details">
                            Phone: ${customer.phone} | Email: ${customer.email}
                        </div>
                    </div>
                    <div class="customer-balance">${customer.balance.toFixed(2)} PLC</div>
                </div>
                <div class="customer-actions">
                    <button class="btn btn-warning btn-sm" onclick="editCustomer('${customer.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${customer.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update wallets list
function updateWalletsList(wallets) {
    const container = document.getElementById('walletsList');
    const filter = document.getElementById('blockchainFilter').value;
    
    let filteredWallets = wallets;
    if (filter !== 'all') {
        filteredWallets = wallets.filter(w => w.blockchain === filter);
    }
    
    if (filteredWallets.length === 0) {
        container.innerHTML = '<p class="no-data">No wallets found</p>';
        return;
    }
    
    let html = '';
    filteredWallets.forEach(wallet => {
        const blockchainNames = {
            ethereum: 'Ethereum (ERC-20)',
            bsc: 'Binance Smart Chain (BEP-20)',
            tron: 'TRON (TRC-20)',
            bitcoin: 'Bitcoin'
        };
        
        html += `
            <div class="wallet-item">
                <div class="wallet-header">
                    <span class="wallet-type">${blockchainNames[wallet.blockchain] || wallet.blockchain}</span>
                    <span class="wallet-balance">${(wallet.balance || 0).toFixed(2)} PLC</span>
                </div>
                <div class="wallet-address">
                    <strong>Address:</strong> ${wallet.address}
                </div>
                <div class="customer-details">
                    ${wallet.customerId ? `Customer ID: ${wallet.customerId}` : 'No customer assigned'}
                </div>
                <div class="customer-details">
                    Created: ${formatDate(wallet.createdAt)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update transactions list
function updateTransactionsList(transactions) {
    const container = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="no-data">No transactions yet</p>';
        return;
    }
    
    // Sort by date descending
    const sortedTransactions = [...transactions].reverse();
    
    let html = '';
    sortedTransactions.forEach(tx => {
        html += `
            <div class="transaction-item ${tx.type}">
                <div class="transaction-header">
                    <span class="transaction-type">${tx.type.toUpperCase()}</span>
                    <span class="transaction-amount ${tx.type}">
                        ${tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)} PLC
                    </span>
                </div>
                <div class="transaction-details">
                    <strong>From:</strong> ${tx.from}<br>
                    <strong>To:</strong> ${tx.to}<br>
                    <strong>Time:</strong> ${formatDate(tx.createdAt)}<br>
                    ${tx.status ? `<strong>Status:</strong> ${tx.status}` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update form selects
function updateFormSelects(customers, wallets) {
    // Update wallet customer select
    const walletCustomerSelect = document.getElementById('walletCustomer');
    walletCustomerSelect.innerHTML = '<option value="">No customer assigned</option>';
    customers.forEach(c => {
        walletCustomerSelect.innerHTML += `<option value="${c.id}">${c.name} (${c.accountNumber})</option>`;
    });
    
    // Update transfer account selects
    const fromAccountSelect = document.getElementById('fromAccount');
    const toAccountSelect = document.getElementById('toAccount');
    
    fromAccountSelect.innerHTML = '<option value="">Select account</option>';
    toAccountSelect.innerHTML = '<option value="">Select account</option>';
    
    customers.forEach(c => {
        const option = `<option value="${c.accountNumber}">${c.accountNumber} - ${c.name}</option>`;
        fromAccountSelect.innerHTML += option;
        toAccountSelect.innerHTML += option;
    });
    
    // Update wallet select
    const fromWalletSelect = document.getElementById('fromWallet');
    fromWalletSelect.innerHTML = '<option value="">Select wallet</option>';
    
    wallets.forEach(w => {
        const blockchainNames = {
            ethereum: 'ETH',
            bsc: 'BSC',
            tron: 'TRON',
            bitcoin: 'BTC'
        };
        fromWalletSelect.innerHTML += `<option value="${w.address}">${blockchainNames[w.blockchain]} - ${w.address.substring(0, 10)}...</option>`;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Generate wallet form
    document.getElementById('generateWalletForm').addEventListener('submit', handleGenerateWallet);
    
    // Create customer form
    document.getElementById('createCustomerForm').addEventListener('submit', handleCreateCustomer);
    
    // Edit customer form
    document.getElementById('editCustomerForm').addEventListener('submit', handleEditCustomer);
    
    // Internal transfer form
    document.getElementById('internalTransferForm').addEventListener('submit', handleInternalTransfer);
    
    // External transfer form
    document.getElementById('externalTransferForm').addEventListener('submit', handleExternalTransfer);
}

// Show tab
function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId).style.display = 'block';
    
    // Activate button
    event.target.classList.add('active');
}

// Show generate wallet modal
function showGenerateWalletModal() {
    document.getElementById('generateWalletModal').classList.add('active');
}

// Show create customer modal
function showCreateCustomerModal() {
    document.getElementById('createCustomerModal').classList.add('active');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Generate wallet handler
function handleGenerateWallet(e) {
    e.preventDefault();
    
    const blockchain = document.getElementById('blockchainType').value;
    const customerId = document.getElementById('walletCustomer').value;
    
    // Generate wallet
    const wallet = CryptoWallet.generateWallet(blockchain);
    wallet.customerId = customerId || null;
    wallet.balance = 0;
    
    // Save wallet
    const wallets = Storage.load('pilgrimWallets') || [];
    wallets.push(wallet);
    Storage.save('pilgrimWallets', wallets);
    
    // Update display
    loadDashboardData();
    
    // Close modal
    closeModal('generateWalletModal');
    
    // Show success
    showSuccessMessage('Wallet generated successfully!');
}

// Create customer handler
function handleCreateCustomer(e) {
    e.preventDefault();
    
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const initialBalance = parseFloat(document.getElementById('initialBalance').value) || 0;
    
    // Generate account number and serial number
    const accountNumber = AccountGenerator.generateAccountNumber();
    const serialNumber = AccountGenerator.generateSerialNumber();
    
    // Create customer
    const customer = {
        id: Date.now().toString(),
        name,
        phone,
        email,
        accountNumber,
        serialNumber,
        balance: initialBalance,
        createdAt: new Date().toISOString()
    };
    
    // Save customer
    const customers = Storage.load('pilgrimCustomers') || [];
    customers.push(customer);
    Storage.save('pilgrimCustomers', customers);
    
    // If initial balance > 0, create transaction
    if (initialBalance > 0) {
        const transaction = {
            id: Date.now().toString(),
            type: 'credit',
            from: 'System',
            to: accountNumber,
            amount: initialBalance,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        const transactions = Storage.load('pilgrimTransactions') || [];
        transactions.push(transaction);
        Storage.save('pilgrimTransactions', transactions);
    }
    
    // Update display
    loadDashboardData();
    
    // Close modal
    closeModal('createCustomerModal');
    
    // Show success
    showSuccessMessage(`Customer account created! Account: ${accountNumber}`);
    
    // Clear form
    e.target.reset();
}

// Edit customer
function editCustomer(customerId) {
    const customers = Storage.load('pilgrimCustomers') || [];
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
        showErrorMessage('Customer not found');
        return;
    }
    
    // Populate form
    document.getElementById('editCustomerId').value = customer.id;
    document.getElementById('editAccountNumber').value = customer.accountNumber;
    document.getElementById('editSerialNumber').value = customer.serialNumber;
    document.getElementById('editCustomerName').value = customer.name;
    document.getElementById('editCustomerBalance').value = customer.balance;
    
    // Show modal
    document.getElementById('editCustomerModal').classList.add('active');
}

// Edit customer handler
function handleEditCustomer(e) {
    e.preventDefault();
    
    const customerId = document.getElementById('editCustomerId').value;
    const name = document.getElementById('editCustomerName').value.trim();
    const balance = parseFloat(document.getElementById('editCustomerBalance').value);
    const action = document.getElementById('balanceAction').value;
    
    const customers = Storage.load('pilgrimCustomers') || [];
    const customerIndex = customers.findIndex(c => c.id === customerId);
    
    if (customerIndex === -1) {
        showErrorMessage('Customer not found');
        return;
    }
    
    const oldBalance = customers[customerIndex].balance;
    let newBalance = oldBalance;
    
    // Apply action
    switch (action) {
        case 'set':
            newBalance = balance;
            break;
        case 'credit':
            newBalance = oldBalance + balance;
            break;
        case 'debit':
            newBalance = Math.max(0, oldBalance - balance);
            break;
    }
    
    // Update customer
    customers[customerIndex].name = name;
    customers[customerIndex].balance = newBalance;
    Storage.save('pilgrimCustomers', customers);
    
    // Create transaction if balance changed
    if (newBalance !== oldBalance) {
        const amount = Math.abs(newBalance - oldBalance);
        const type = newBalance > oldBalance ? 'credit' : 'debit';
        
        const transaction = {
            id: Date.now().toString(),
            type,
            from: type === 'credit' ? 'Admin Adjustment' : customers[customerIndex].accountNumber,
            to: type === 'credit' ? customers[customerIndex].accountNumber : 'Admin Adjustment',
            amount,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        const transactions = Storage.load('pilgrimTransactions') || [];
        transactions.push(transaction);
        Storage.save('pilgrimTransactions', transactions);
    }
    
    // Update display
    loadDashboardData();
    
    // Close modal
    closeModal('editCustomerModal');
    
    // Show success
    showSuccessMessage('Customer account updated!');
}

// Delete customer
function deleteCustomer(customerId) {
    if (!confirm('Are you sure you want to delete this customer?')) {
        return;
    }
    
    let customers = Storage.load('pilgrimCustomers') || [];
    customers = customers.filter(c => c.id !== customerId);
    Storage.save('pilgrimCustomers', customers);
    
    // Update display
    loadDashboardData();
    
    // Show success
    showSuccessMessage('Customer deleted!');
}

// Internal transfer handler
function handleInternalTransfer(e) {
    e.preventDefault();
    
    const fromAccount = document.getElementById('fromAccount').value;
    const toAccount = document.getElementById('toAccount').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    
    // Validate
    if (fromAccount === toAccount) {
        showErrorMessage('Cannot transfer to same account');
        return;
    }
    
    const customers = Storage.load('pilgrimCustomers') || [];
    const fromCustomer = customers.find(c => c.accountNumber === fromAccount);
    const toCustomer = customers.find(c => c.accountNumber === toAccount);
    
    if (!fromCustomer || !toCustomer) {
        showErrorMessage('Account not found');
        return;
    }
    
    if (fromCustomer.balance < amount) {
        showErrorMessage('Insufficient balance');
        return;
    }
    
    // Perform transfer
    fromCustomer.balance -= amount;
    toCustomer.balance += amount;
    
    Storage.save('pilgrimCustomers', customers);
    
    // Create transaction
    const transaction = {
        id: Date.now().toString(),
        type: 'transfer',
        from: fromAccount,
        to: toAccount,
        amount,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    const transactions = Storage.load('pilgrimTransactions') || [];
    transactions.push(transaction);
    Storage.save('pilgrimTransactions', transactions);
    
    // Update display
    loadDashboardData();
    
    // Show success
    showSuccessMessage(`Transfer successful! ${amount} PLC sent to ${toAccount}`);
    
    // Clear form
    e.target.reset();
}

// External transfer handler
function handleExternalTransfer(e) {
    e.preventDefault();
    
    const fromWallet = document.getElementById('fromWallet').value;
    const destinationAddress = document.getElementById('destinationAddress').value.trim();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const targetBlockchain = document.getElementById('targetBlockchain').value;
    
    // Find wallet
    const wallets = Storage.load('pilgrimWallets') || [];
    const wallet = wallets.find(w => w.address === fromWallet);
    
    if (!wallet) {
        showErrorMessage('Wallet not found');
        return;
    }
    
    // Find customer for this wallet
    const customers = Storage.load('pilgrimCustomers') || [];
    const customer = customers.find(c => c.id === wallet.customerId);
    
    if (!customer) {
        showErrorMessage('Customer not found for this wallet');
        return;
    }
    
    if (customer.balance < amount) {
        showErrorMessage('Insufficient balance');
        return;
    }
    
    // Perform withdrawal
    customer.balance -= amount;
    
    Storage.save('pilgrimCustomers', customers);
    
    // Create transaction
    const transaction = {
        id: Date.now().toString(),
        type: 'debit',
        from: customer.accountNumber,
        to: destinationAddress,
        amount,
        status: 'pending',
        metadata: {
            blockchain: targetBlockchain,
            walletAddress: fromWallet
        },
        createdAt: new Date().toISOString()
    };
    
    const transactions = Storage.load('pilgrimTransactions') || [];
    transactions.push(transaction);
    Storage.save('pilgrimTransactions', transactions);
    
    // Update display
    loadDashboardData();
    
    // Show success
    showSuccessMessage(`Withdrawal initiated! ${amount} PLC will be sent to ${destinationAddress.substring(0, 10)}...`);
    
    // Clear form
    e.target.reset();
}

// Mining functions
function startMining() {
    miningActive = true;
    
    document.getElementById('startMiningBtn').style.display = 'none';
    document.getElementById('stopMiningBtn').style.display = 'inline-block';
    
    const miningStatus = document.getElementById('miningStatus');
    miningStatus.classList.add('active');
    miningStatus.innerHTML = '<p>⛏️ Mining is active... Generating Pilgrim Coins</p>';
    
    // Start mining interval
    miningInterval = setInterval(mineBlock, 5000);
    
    addMiningLog('Mining started successfully');
    addMiningLog('Connected to Pilgrim Coin network');
    addMiningLog('Hash rate: 1.25 TH/s');
}

function stopMining() {
    miningActive = false;
    
    document.getElementById('startMiningBtn').style.display = 'inline-block';
    document.getElementById('stopMiningBtn').style.display = 'none';
    
    const miningStatus = document.getElementById('miningStatus');
    miningStatus.classList.remove('active');
    miningStatus.innerHTML = '<p>Mining is currently stopped</p>';
    
    // Stop mining interval
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    addMiningLog('Mining stopped by user');
}

function mineBlock() {
    // Simulate mining reward (random between 0.01 and 0.1 PLC)
    const reward = (Math.random() * 0.09 + 0.01).toFixed(4);
    const rewardFloat = parseFloat(reward);
    
    // Update total mined
    totalMined += rewardFloat;
    Storage.save('totalMined', totalMined);
    
    // Distribute to customers
    distributeMiningReward(rewardFloat);
    
    // Update display
    const customers = Storage.load('pilgrimCustomers') || [];
    const wallets = Storage.load('pilgrimWallets') || [];
    const transactions = Storage.load('pilgrimTransactions') || [];
    updateStats(customers, wallets, transactions);
    
    // Add log
    addMiningLog(`Block mined! Reward: ${reward} PLC (${formatCurrency(rewardFloat * 0.5, 'USD')})`);
}

function distributeMiningReward(reward) {
    const customers = Storage.load('pilgrimCustomers') || [];
    
    if (customers.length === 0) {
        // No customers yet, store in system wallet
        return;
    }
    
    // Distribute equally among customers
    const rewardPerCustomer = reward / customers.length;
    
    customers.forEach(customer => {
        customer.balance += rewardPerCustomer;
    });
    
    Storage.save('pilgrimCustomers', customers);
    
    // Create transaction
    const transaction = {
        id: Date.now().toString(),
        type: 'credit',
        from: 'Mining Reward',
        to: 'All Customers',
        amount: reward,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    const transactions = Storage.load('pilgrimTransactions') || [];
    transactions.push(transaction);
    Storage.save('pilgrimTransactions', transactions);
}

function addMiningLog(message) {
    const logContent = document.getElementById('logContent');
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    
    logContent.insertBefore(logEntry, logContent.firstChild);
    
    // Keep only last 50 entries
    while (logContent.children.length > 50) {
        logContent.removeChild(logContent.lastChild);
    }
}

// Filter wallets
function filterWallets() {
    loadDashboardData();
}

// Show transfer tab
function showTransferTab(tabId) {
    // Hide all transfer tabs
    document.querySelectorAll('.transfer-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.transfer-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId + 'Transfer').style.display = 'block';
    
    // Activate button
    event.target.classList.add('active');
}

// Network monitoring
function startNetworkMonitoring() {
    setInterval(updateNetworkMonitor, 10000);
}

function updateNetworkMonitor() {
    const connections = NetworkMonitor.getAllConnections();
    const networkStatus = document.getElementById('networkStatus');
    
    if (connections.length === 0) {
        networkStatus.innerHTML = '<p class="offline">No connections</p>';
        return;
    }
    
    let html = '';
    connections.forEach(conn => {
        const isCurrent = conn.userAgent === navigator.userAgent;
        html += `
            <div class="connection-item">
                <strong>IP:</strong> ${conn.ip} |
                <strong>Location:</strong> ${conn.location} |
                <strong>Time:</strong> ${formatDate(conn.timestamp)} |
                ${isCurrent ? '<span class="online">● You</span>' : '<span class="warning">⚠️ Other</span>'}
            </div>
        `;
    });
    
    networkStatus.innerHTML = html;
}

// Success message
function showSuccessMessage(message) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create success alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.innerHTML = `✅ ${message}`;
    
    // Insert at top of container
    const container = document.querySelector('.dashboard-container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Error message
function showErrorMessage(message) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create error alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-error';
    alertDiv.innerHTML = `❌ ${message}`;
    
    // Insert at top of container
    const container = document.querySelector('.dashboard-container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Logout function
function logout() {
    // Remove current connection
    const connections = NetworkMonitor.getAllConnections();
    connections.forEach(conn => {
        if (conn.userAgent === navigator.userAgent) {
            NetworkMonitor.removeConnection(conn.id);
        }
    });
    
    // Logout
    Auth.logout();
    
    // Redirect to login
    window.location.href = 'logins.html';
}