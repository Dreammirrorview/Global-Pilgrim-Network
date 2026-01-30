// Global Bank Nigeria Dashboardy JavaScript

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
    if (!Storage.load('bankCustomers')) {
        Storage.save('bankCustomers', []);
    }
    
    if (!Storage.load('bankTransactions')) {
        Storage.save('bankTransactions', []);
    }
    
    if (!Storage.load('referrals')) {
        Storage.save('referrals', []);
    }
    
    // Load data
    loadDashboardData();
    updateNetworkMonitor();
}

// Load dashboard data
function loadDashboardData() {
    const customers = Storage.load('bankCustomers') || [];
    const transactions = Storage.load('bankTransactions') || [];
    const referrals = Storage.load('referrals') || [];
    
    // Update stats
    updateStats(customers, transactions, referrals);
    
    // Update lists
    updateCustomersList(customers);
    updateTransactionsList(transactions);
    updateReferralsList(referrals);
    
    // Update form selects
    updateFormSelects(customers);
    
    // Update crypto integration
    updateCryptoIntegration();
}

// Update statistics
function updateStats(customers, transactions, referrals) {
    // Calculate total deposits
    let totalDeposits = 0;
    customers.forEach(c => {
        totalDeposits += parseFloat(c.balance) || 0;
    });
    
    // Calculate today's transactions
    const today = new Date().toDateString();
    const todayTransactions = transactions.filter(t => 
        new Date(t.createdAt).toDateString() === today
    ).length;
    
    // Calculate active referrals
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    
    // Update display
    document.getElementById('totalDeposits').textContent = formatCurrency(totalDeposits, 'NGN');
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('todayTransactions').textContent = todayTransactions;
    document.getElementById('activeReferrals').textContent = activeReferrals;
    document.getElementById('totalReferrals').textContent = referrals.length;
    document.getElementById('activeReferralsCount').textContent = activeReferrals;
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
                        <div class="customer-details">
                            BVN: ${customer.bvn} | NIN: ${customer.nin}
                        </div>
                    </div>
                    <div class="customer-balance">${formatCurrency(customer.balance, 'NGN')}</div>
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
        const typeClass = tx.type === 'credit' || tx.type === 'deposit' ? 'credit' : 'debit';
        html += `
            <div class="transaction-item ${typeClass}">
                <div class="transaction-header">
                    <span class="transaction-type">${tx.type.toUpperCase()}</span>
                    <span class="transaction-amount ${typeClass}">
                        ${typeClass === 'credit' ? '+' : '-'}${formatCurrency(tx.amount, 'NGN')}
                    </span>
                </div>
                <div class="transaction-details">
                    <strong>From:</strong> ${tx.from}<br>
                    <strong>To:</strong> ${tx.to}<br>
                    <strong>Time:</strong> ${formatDate(tx.createdAt)}<br>
                    <strong>Bank:</strong> ${tx.bank || 'Global Bank Nigeria'}<br>
                    ${tx.remark ? `<strong>Remark:</strong> ${tx.remark}` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update referrals list
function updateReferralsList(referrals) {
    const container = document.getElementById('referralsList');
    
    if (referrals.length === 0) {
        container.innerHTML = '<p class="no-data">No referrals yet</p>';
        return;
    }
    
    let html = '';
    referrals.forEach(ref => {
        const statusColor = ref.status === 'active' ? '#22c55e' : '#f59e0b';
        html += `
            <div class="referral-item">
                <h4>${ref.referredCustomerName}</h4>
                <p><strong>Account:</strong> ${ref.referredAccountNumber}</p>
                <p><strong>Date:</strong> ${formatDate(ref.createdAt)}</p>
                <p><strong>Bonus:</strong> ₦${ref.bonus || 500}</p>
                <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${ref.status.toUpperCase()}</span></p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update form selects
function updateFormSelects(customers) {
    // Update transfer account selects
    const fromAccountSelect = document.getElementById('fromAccount');
    const toAccountSelect = document.getElementById('toAccount');
    const interbankFromAccountSelect = document.getElementById('interbankFromAccount');
    const referredBySelect = document.getElementById('referredBy');
    
    fromAccountSelect.innerHTML = '<option value="">Select account</option>';
    toAccountSelect.innerHTML = '<option value="">Select account</option>';
    interbankFromAccountSelect.innerHTML = '<option value="">Select account</option>';
    referredBySelect.innerHTML = '<option value="">No referral</option>';
    
    customers.forEach(c => {
        const option = `<option value="${c.accountNumber}">${c.accountNumber} - ${c.name}</option>`;
        fromAccountSelect.innerHTML += option;
        toAccountSelect.innerHTML += option;
        interbankFromAccountSelect.innerHTML += option;
        referredBySelect.innerHTML += `<option value="${c.accountNumber}">${c.name} (${c.accountNumber})</option>`;
    });
}

// Update crypto integration
function updateCryptoIntegration() {
    // Get crypto balance from Pilgrim Coin system
    const pilgrimCustomers = Storage.load('pilgrimCustomers') || [];
    let totalCryptoBalance = 0;
    
    pilgrimCustomers.forEach(c => {
        totalCryptoBalance += parseFloat(c.balance) || 0;
    });
    
    // Update display
    document.getElementById('linkedCryptoBalance').textContent = totalCryptoBalance.toFixed(2) + ' PLC';
    document.getElementById('linkedCryptoUSD').textContent = formatCurrency(totalCryptoBalance * 0.5, 'USD');
}

// Setup event listeners
function setupEventListeners() {
    // Create customer form
    document.getElementById('createCustomerForm').addEventListener('submit', handleCreateCustomer);
    
    // Edit customer form
    document.getElementById('editCustomerForm').addEventListener('submit', handleEditCustomer);
    
    // Internal transfer form
    document.getElementById('internalTransferForm').addEventListener('submit', handleInternalTransfer);
    
    // Interbank transfer form
    document.getElementById('interbankTransferForm').addEventListener('submit', handleInterbankTransfer);
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

// Show create customer modal
function showCreateCustomerModal() {
    document.getElementById('createCustomerModal').classList.add('active');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Create customer handler
function handleCreateCustomer(e) {
    e.preventDefault();
    
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const bvn = document.getElementById('customerBVN').value.trim();
    const nin = document.getElementById('customerNIN').value.trim();
    const initialBalance = parseFloat(document.getElementById('initialBalance').value) || 0;
    const referredBy = document.getElementById('referredBy').value;
    
    // Validate BVN and NIN
    if (!Validator.isValidBVN(bvn)) {
        showErrorMessage('BVN must be 11 digits');
        return;
    }
    
    if (!Validator.isValidBVN(nin)) {
        showErrorMessage('NIN must be 11 digits');
        return;
    }
    
    // Generate account number and serial number
    const accountNumber = AccountGenerator.generateAccountNumber();
    const serialNumber = AccountGenerator.generateSerialNumber();
    
    // Create customer
    const customer = {
        id: Date.now().toString(),
        name,
        phone,
        email,
        bvn,
        nin,
        accountNumber,
        serialNumber,
        balance: initialBalance,
        createdAt: new Date().toISOString()
    };
    
    // Save customer
    const customers = Storage.load('bankCustomers') || [];
    customers.push(customer);
    Storage.save('bankCustomers', customers);
    
    // Handle referral
    if (referredBy) {
        const referrer = customers.find(c => c.accountNumber === referredBy);
        if (referrer) {
            const referral = {
                id: Date.now().toString(),
                referrerAccount: referredBy,
                referrerName: referrer.name,
                referredAccountNumber: accountNumber,
                referredCustomerName: name,
                bonus: 500,
                status: 'active',
                createdAt: new Date().toISOString()
            };
            
            const referrals = Storage.load('referrals') || [];
            referrals.push(referral);
            Storage.save('referrals', referrals);
            
            // Credit referrer with bonus
            referrer.balance += 500;
            Storage.save('bankCustomers', customers);
            
            // Create transaction for bonus
            const bonusTransaction = {
                id: Date.now().toString(),
                type: 'credit',
                from: 'Referral Bonus',
                to: referredBy,
                amount: 500,
                bank: 'Global Bank Nigeria',
                remark: 'Referral bonus for ' + name,
                createdAt: new Date().toISOString()
            };
            
            const transactions = Storage.load('bankTransactions') || [];
            transactions.push(bonusTransaction);
            Storage.save('bankTransactions', transactions);
        }
    }
    
    // If initial balance > 0, create transaction
    if (initialBalance > 0) {
        const transaction = {
            id: Date.now().toString(),
            type: 'deposit',
            from: 'Cash Deposit',
            to: accountNumber,
            amount: initialBalance,
            bank: 'Global Bank Nigeria',
            remark: 'Initial deposit',
            createdAt: new Date().toISOString()
        };
        
        const transactions = Storage.load('bankTransactions') || [];
        transactions.push(transaction);
        Storage.save('bankTransactions', transactions);
        
        // Send credit alert
        NotificationSystem.sendCreditAlert(accountNumber, initialBalance, 'Cash Deposit');
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
    const customers = Storage.load('bankCustomers') || [];
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
    
    const customers = Storage.load('bankCustomers') || [];
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
    Storage.save('bankCustomers', customers);
    
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
            bank: 'Global Bank Nigeria',
            remark: 'Balance adjustment by admin',
            createdAt: new Date().toISOString()
        };
        
        const transactions = Storage.load('bankTransactions') || [];
        transactions.push(transaction);
        Storage.save('bankTransactions', transactions);
        
        // Send alert
        if (type === 'credit') {
            NotificationSystem.sendCreditAlert(customers[customerIndex].accountNumber, amount, 'Admin Adjustment');
        } else {
            NotificationSystem.sendDebitAlert(customers[customerIndex].accountNumber, amount, 'Admin Adjustment');
        }
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
    
    let customers = Storage.load('bankCustomers') || [];
    customers = customers.filter(c => c.id !== customerId);
    Storage.save('bankCustomers', customers);
    
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
    const fastTransfer = document.getElementById('fastTransfer').checked;
    
    // Validate
    if (fromAccount === toAccount) {
        showErrorMessage('Cannot transfer to same account');
        return;
    }
    
    const customers = Storage.load('bankCustomers') || [];
    const fromCustomer = customers.find(c => c.accountNumber === fromAccount);
    const toCustomer = customers.find(c => c.accountNumber === toAccount);
    
    if (!fromCustomer || !toCustomer) {
        showErrorMessage('Account not found');
        return;
    }
    
    const fee = fastTransfer ? 50 : 0;
    const totalAmount = amount + fee;
    
    if (fromCustomer.balance < totalAmount) {
        showErrorMessage(`Insufficient balance. Required: ₦${totalAmount}`);
        return;
    }
    
    // Perform transfer
    fromCustomer.balance -= totalAmount;
    toCustomer.balance += amount;
    
    Storage.save('bankCustomers', customers);
    
    // Create debit transaction
    const debitTransaction = {
        id: Date.now().toString(),
        type: 'debit',
        from: fromAccount,
        to: toAccount,
        amount: totalAmount,
        bank: 'Global Bank Nigeria',
        remark: fastTransfer ? `Transfer to ${toAccount} (Fast: 1 min)` : `Transfer to ${toAccount}`,
        createdAt: new Date().toISOString()
    };
    
    // Create credit transaction
    const creditTransaction = {
        id: (Date.now() + 1).toString(),
        type: 'credit',
        from: fromAccount,
        to: toAccount,
        amount: amount,
        bank: 'Global Bank Nigeria',
        remark: fastTransfer ? `Transfer from ${fromAccount} (Fast: 1 min)` : `Transfer from ${fromAccount}`,
        createdAt: new Date().toISOString()
    };
    
    const transactions = Storage.load('bankTransactions') || [];
    transactions.push(debitTransaction, creditTransaction);
    Storage.save('bankTransactions', transactions);
    
    // Send alerts
    NotificationSystem.sendDebitAlert(fromAccount, totalAmount, toAccount);
    NotificationSystem.sendCreditAlert(toAccount, amount, fromAccount);
    
    // Update display
    loadDashboardData();
    
    // Show success
    showSuccessMessage(`Transfer successful! ₦${amount} sent to ${toAccount}${fastTransfer ? ' (Fast transfer)' : ''}`);
    
    // Clear form
    e.target.reset();
}

// Interbank transfer handler
function handleInterbankTransfer(e) {
    e.preventDefault();
    
    const fromAccount = document.getElementById('interbankFromAccount').value;
    const destinationBank = document.getElementById('destinationBank').value;
    const destinationAccount = document.getElementById('destinationAccount').value.trim();
    const amount = parseFloat(document.getElementById('interbankAmount').value);
    const beneficiaryName = document.getElementById('beneficiaryName').value.trim();
    const remark = document.getElementById('transferRemark').value.trim();
    
    // Validate account number
    if (!Validator.isValidAccountNumber(destinationAccount)) {
        showErrorMessage('Destination account must be 10 digits');
        return;
    }
    
    // Find customer
    const customers = Storage.load('bankCustomers') || [];
    const fromCustomer = customers.find(c => c.accountNumber === fromAccount);
    
    if (!fromCustomer) {
        showErrorMessage('Account not found');
        return;
    }
    
    const fee = 50; // Interbank transfer fee
    const totalAmount = amount + fee;
    
    if (fromCustomer.balance < totalAmount) {
        showErrorMessage(`Insufficient balance. Required: ₦${totalAmount}`);
        return;
    }
    
    // Perform transfer
    fromCustomer.balance -= totalAmount;
    
    Storage.save('bankCustomers', customers);
    
    // Get bank name
    const bankNames = {
        '057': 'Zenith Bank',
        '011': 'First Bank',
        '033': 'United Bank for Africa',
        '058': 'Guaranty Trust Bank',
        '044': 'Access Bank',
        '035': 'Wema Bank'
    };
    
    // Create transaction
    const transaction = {
        id: Date.now().toString(),
        type: 'debit',
        from: fromAccount,
        to: `${destinationAccount} (${bankNames[destinationBank]})`,
        amount: totalAmount,
        bank: 'Global Bank Nigeria',
        remark: remark || `Transfer to ${beneficiaryName} at ${bankNames[destinationBank]}`,
        destinationBank,
        beneficiaryName,
        createdAt: new Date().toISOString()
    };
    
    const transactions = Storage.load('bankTransactions') || [];
    transactions.push(transaction);
    Storage.save('bankTransactions', transactions);
    
    // Send alert
    NotificationSystem.sendDebitAlert(fromAccount, totalAmount, `${destinationAccount} (${bankNames[destinationBank]})`);
    
    // Update display
    loadDashboardData();
    
    // Show success
    showSuccessMessage(`Interbank transfer initiated! ₦${amount} will be sent to ${beneficiaryName} at ${bankNames[destinationBank]}`);
    
    // Clear form
    e.target.reset();
}

// Copy referral link
function copyReferralLink() {
    const referralLink = document.getElementById('referralLink');
    referralLink.select();
    document.execCommand('copy');
    showSuccessMessage('Referral link copied to clipboard!');
}

// Crypto integration functions
function transferCryptoToBank() {
    showErrorMessage('This feature is in development. Please use the Pilgrim Coin system for crypto operations.');
}

function transferBankToCrypto() {
    showErrorMessage('This feature is in development. Please use the Pilgrim Coin system for crypto operations.');
}

function viewCryptoWallet() {
    window.open('../pilgrim_coin/dashboard.html', '_blank');
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
    window.location.href = 'loginy.html';
}