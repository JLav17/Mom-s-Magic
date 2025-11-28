const KEYS = {
    ORDERS: 'moms_data_orders',
    USER: 'moms_user_current',
    ADDRESSES: 'moms_user_addresses' // New key for addresses
};

const user = JSON.parse(localStorage.getItem(KEYS.USER));

if (!user) {
    window.location.href = 'main.html';
}

let addresses = JSON.parse(localStorage.getItem(KEYS.ADDRESSES) || '[]');

// Filter addresses for current user if you want multi-user support on same browser, 
// but for simplicity here we store all in one array or filter by user ID if available.
// Since user object has ID, let's store addresses with userId.

document.addEventListener('DOMContentLoaded', () => {
    // Render User Info
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email || 'Customer';

    renderAddresses();
    renderOrders();
});

/* --- ADDRESS LOGIC --- */

window.renderAddresses = function() {
    const list = document.getElementById('address-list');
    // Filter addresses for this user
    const userAddresses = addresses.filter(a => a.userId === user.id);

    if (userAddresses.length === 0) {
        list.innerHTML = `<div class="col-span-full text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">No addresses saved. Add one to speed up checkout!</div>`;
        return;
    }

    list.innerHTML = userAddresses.map(addr => `
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group">
            <div class="flex justify-between items-start mb-2">
                <span class="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider">${addr.label}</span>
                <button onclick="deleteAddress(${addr.id})" class="text-gray-400 hover:text-red-500 transition"><i class="ph-bold ph-trash"></i></button>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">${addr.text}</p>
        </div>
    `).join('');
};

window.saveNewAddress = function(e) {
    e.preventDefault();
    const label = document.getElementById('addr-label').value;
    const text = document.getElementById('addr-text').value;

    const newAddr = {
        id: Date.now(),
        userId: user.id,
        label,
        text
    };

    addresses.push(newAddr);
    localStorage.setItem(KEYS.ADDRESSES, JSON.stringify(addresses));
    
    window.closeAddressModal();
    window.renderAddresses();
    showToast("Address Saved!");
};

window.deleteAddress = function(id) {
    if(confirm('Remove this address?')) {
        addresses = addresses.filter(a => a.id !== id);
        localStorage.setItem(KEYS.ADDRESSES, JSON.stringify(addresses));
        window.renderAddresses();
    }
};

window.openAddressModal = function() {
    document.getElementById('address-modal').classList.remove('hidden');
    document.getElementById('addr-label').value = '';
    document.getElementById('addr-text').value = '';
};

window.closeAddressModal = function() {
    document.getElementById('address-modal').classList.add('hidden');
};

/* --- ORDERS LOGIC --- */

function renderOrders() {
    const allOrders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    const myOrders = allOrders.filter(o => o.userId === user.id).reverse(); // Match by ID now safely

    const list = document.getElementById('orders-list');

    if (myOrders.length === 0) {
        list.innerHTML = `
            <div class="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div class="inline-block p-4 bg-gray-50 rounded-full mb-4 text-gray-300">
                    <i class="ph-fill ph-receipt text-4xl"></i>
                </div>
                <p class="text-gray-500 font-medium mb-4">You haven't placed any orders yet.</p>
                <a href="main.html" class="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg btn-lift">Order Now</a>
            </div>
        `;
    } else {
        list.innerHTML = myOrders.map(order => `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition hover:shadow-md group">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-50 pb-4 gap-4">
                    <div>
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md">#${order.id.toString().slice(-6)}</span>
                        <p class="text-xs text-gray-400 mt-2 font-medium">${new Date(order.date).toLocaleString()}</p>
                        <!-- Show Delivery Address in History -->
                        <p class="text-xs text-gray-500 mt-1"><i class="ph-bold ph-map-pin mr-1"></i> ${order.address || 'Address not recorded'}</p>
                    </div>
                    <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span class="px-4 py-1.5 rounded-full text-xs font-bold ${getStatusClass(order.status)}">
                            ${order.status}
                        </span>
                        <p class="text-2xl font-bold text-gray-800">₹${order.total}</p>
                    </div>
                </div>
                
                <div class="space-y-3">
                    ${order.items.map(item => `
                        <div class="flex justify-between text-sm items-center bg-gray-50/50 p-3 rounded-xl">
                            <div class="flex items-center gap-3">
                                <div class="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">${item.qty}x</div>
                                <span class="text-gray-700 font-medium">${item.name}</span>
                            </div>
                            <span class="font-bold text-gray-900">₹${item.price * item.qty}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
}

function getStatusClass(status) {
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'Confirmed') return 'bg-green-100 text-green-700';
    if (status === 'Cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
}

window.doLogout = function() {
    localStorage.removeItem(KEYS.USER);
    window.location.href = 'main.html';
};

function showToast(msg) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if(!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}