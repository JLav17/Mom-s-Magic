/* --- GLOBAL DEFINITIONS (Attached to window for safety) --- */

window.KEYS = {
    KITCHENS: 'moms_data_kitchens',
    DISHES: 'moms_data_dishes',
    ORDERS: 'moms_data_orders',
    USER: 'moms_user_current',
    CART: 'moms_data_cart',
    ADDRESSES: 'moms_user_addresses'
};

window.appState = {
    user: null,
    cart: [],
    kitchens: [],
    dishes: [],
    addresses: []
};

/* --- CORE FUNCTIONS --- */

// Tab Animation Logic
window.switchLoginTab = function(type) {
    const userForm = document.getElementById('user-login-form');
    const adminForm = document.getElementById('admin-login-form');
    const indicator = document.getElementById('tab-indicator');
    const tabUser = document.querySelector('button[onclick="switchLoginTab(\'user\')"]');
    const tabAdmin = document.querySelector('button[onclick="switchLoginTab(\'admin\')"]');

    if (type === 'user') {
        userForm.classList.remove('opacity-0', 'pointer-events-none', 'translate-x-10');
        adminForm.classList.add('opacity-0', 'pointer-events-none', 'translate-x-10');
        indicator.style.left = '6px';
        tabUser.classList.replace('text-gray-500', 'text-gray-700');
        tabAdmin.classList.replace('text-gray-700', 'text-gray-500');
    } else {
        adminForm.classList.remove('opacity-0', 'pointer-events-none', 'translate-x-10');
        userForm.classList.add('opacity-0', 'pointer-events-none', 'translate-x-10');
        indicator.style.left = 'calc(50% + 0px)'; 
        tabAdmin.classList.replace('text-gray-500', 'text-gray-700');
        tabUser.classList.replace('text-gray-700', 'text-gray-500');
    }
};

window.checkLogin = function() {
    if (window.appState.user) {
        if (window.appState.user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            document.getElementById('login-overlay').classList.add('hidden');
            document.getElementById('app-content').classList.remove('hidden');
            document.getElementById('welcome-msg').textContent = `Hi, ${window.appState.user.name.split(' ')[0]}`;
            window.renderKitchens();
        }
    } else {
        document.getElementById('login-overlay').classList.remove('hidden');
    }
};

window.doLogout = function() {
    localStorage.removeItem(window.KEYS.USER);
    location.reload();
};

window.handleUserLogin = function(e) {
    e.preventDefault();
    const name = document.getElementById('login-name').value;
    const email = document.getElementById('login-email').value;
    
    window.appState.user = { name, email, role: 'customer', id: email };
    localStorage.setItem(window.KEYS.USER, JSON.stringify(window.appState.user));
    window.checkLogin();
    window.showToast(`Welcome to Mom's Magic, ${name}!`);
};

window.handleAdminLogin = function(e) {
    e.preventDefault();
    const pass = document.getElementById('admin-pass').value;
    if (pass === 'admin') {
        window.appState.user = { name: 'Admin', role: 'admin' };
        localStorage.setItem(window.KEYS.USER, JSON.stringify(window.appState.user));
        window.location.href = 'admin.html';
    } else {
        window.showToast('Incorrect password', true);
    }
};

/* --- RENDER LOGIC --- */

window.showSection = function(sectionId) {
    const kSection = document.getElementById('kitchens-section');
    const mSection = document.getElementById('menu-section');
    const hero = document.getElementById('hero-banner');
    
    if (sectionId === 'kitchens') {
        kSection.classList.remove('hidden');
        hero.classList.remove('hidden');
        mSection.classList.add('hidden');
        window.renderKitchens();
    } else if (sectionId === 'menu') {
        mSection.classList.remove('hidden');
        kSection.classList.add('hidden');
        hero.classList.add('hidden');
        window.scrollTo(0,0);
    }
};

window.renderKitchens = function() {
    const grid = document.getElementById('kitchens-grid');
    grid.innerHTML = window.appState.kitchens.map(k => `
        <div onclick="openKitchen(${k.id})" class="glass-card rounded-3xl overflow-hidden cursor-pointer card-hover group">
            <div class="h-56 overflow-hidden relative">
                <img src="${k.img}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div class="absolute bottom-4 left-4 text-white">
                    <h3 class="text-2xl font-bold font-kalam">${k.name}</h3>
                </div>
            </div>
            <div class="p-6">
                <p class="text-gray-500 text-sm mb-4 line-clamp-2">${k.desc}</p>
                <div class="flex justify-end items-center">
                    <button class="text-orange-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Menu <i class="ph-bold ph-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

window.openKitchen = function(id) {
    const kitchen = window.appState.kitchens.find(k => k.id == id);
    const dishes = window.appState.dishes.filter(d => d.kitchenId == id && d.active);
    
    document.getElementById('menu-kitchen-name').textContent = kitchen.name;
    document.getElementById('menu-kitchen-desc').textContent = kitchen.desc;
    document.getElementById('menu-kitchen-img').src = kitchen.img;

    const grid = document.getElementById('dishes-grid');
    if (dishes.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <i class="ph ph-cooking-pot text-4xl mb-2"></i>
                <p>Chef is taking a break. No dishes available.</p>
            </div>`;
    } else {
        grid.innerHTML = dishes.map(d => `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 card-hover group">
                <div class="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
                    <img src="${d.img}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                </div>
                <div class="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-gray-800 text-lg leading-tight">${d.name}</h4>
                            <img src="https://img.icons8.com/color/48/vegetarian-food-symbol.png" class="w-4 h-4 opacity-50">
                        </div>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">${d.desc}</p>
                    </div>
                    <div class="flex items-center justify-between mt-3">
                        <span class="font-bold text-xl text-gray-800">₹${d.price}</span>
                        <button onclick="addToCart(${d.id})" class="bg-gray-900 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:scale-110 transition shadow-md">
                            <i class="ph-bold ph-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    window.showSection('menu');
};

/* --- CART --- */

window.toggleCart = function() {
    const modal = document.getElementById('cart-modal');
    const panel = document.getElementById('cart-panel');
    
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        // Re-fetch addresses just in case
        window.appState.addresses = JSON.parse(localStorage.getItem(window.KEYS.ADDRESSES) || '[]');
        window.renderCart();
        requestAnimationFrame(() => panel.classList.remove('translate-x-full'));
    } else {
        panel.classList.add('translate-x-full');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
};

window.addToCart = function(dishId) {
    const dish = window.appState.dishes.find(d => d.id == dishId);
    const existing = window.appState.cart.find(item => item.id == dishId);
    if (existing) {
        existing.qty++;
    } else {
        window.appState.cart.push({ ...dish, qty: 1 });
    }
    window.updateCart();
    window.showToast(`Added ${dish.name}`);
};

window.updateCart = function() {
    localStorage.setItem(window.KEYS.CART, JSON.stringify(window.appState.cart));
    window.renderCartBadge();
    window.renderCart();
};

window.renderCartBadge = function() {
    const count = window.appState.cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        if (count === 0) badge.classList.add('scale-0');
        else badge.classList.remove('scale-0');
    }
};

window.renderCart = function() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (window.appState.cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-300">
                <i class="ph-fill ph-shopping-bag-open text-6xl mb-4"></i>
                <p class="font-medium">Your plate is empty</p>
                <button onclick="toggleCart()" class="mt-4 text-orange-600 font-bold text-sm hover:underline">Browse Menu</button>
            </div>`;
        totalEl.textContent = '₹0';
        if(checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    let total = 0;
    let html = window.appState.cart.map((item, index) => {
        total += item.price * item.qty;
        return `
            <div class="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition">
                <img src="${item.img}" class="w-16 h-16 rounded-lg object-cover">
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800 text-sm line-clamp-1">${item.name}</h4>
                    <p class="text-xs text-gray-500 font-medium">₹${item.price}</p>
                </div>
                <div class="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                    <button onclick="changeQty(${index}, -1)" class="text-gray-400 hover:text-red-500 transition"><i class="ph-bold ph-minus"></i></button>
                    <span class="text-sm font-bold w-4 text-center">${item.qty}</span>
                    <button onclick="changeQty(${index}, 1)" class="text-gray-400 hover:text-green-500 transition"><i class="ph-bold ph-plus"></i></button>
                </div>
            </div>
        `;
    }).join('');

    // --- ADDRESS SELECTION IN CART ---
    const userAddresses = window.appState.addresses.filter(a => a.userId === window.appState.user.id);
    
    html += `
        <div class="mt-6 pt-4 border-t border-gray-100">
            <div class="flex justify-between items-center mb-3">
                <h4 class="text-sm font-bold text-gray-700">Delivery Address</h4>
                <a href="user.html" class="text-orange-600 text-xs font-bold hover:underline">+ Manage</a>
            </div>
    `;

    if (userAddresses.length === 0) {
        html += `
            <div class="p-3 border border-dashed border-orange-200 rounded-xl bg-orange-50 text-orange-600 text-sm text-center">
                No addresses found. <br>
                <a href="user.html" class="font-bold underline">Add one in Profile</a>
            </div>
            <input type="hidden" id="selected-address" value="">
        `;
    } else {
        html += `<div class="space-y-2">`;
        userAddresses.forEach((addr, idx) => {
            const isChecked = idx === 0 ? 'checked' : '';
            html += `
                <label class="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition bg-white">
                    <input type="radio" name="delivery_address" value="${addr.text}" ${isChecked} class="mt-1 text-orange-600 focus:ring-orange-500">
                    <div>
                        <span class="block text-xs font-bold text-gray-800 uppercase bg-gray-100 px-1.5 rounded w-fit mb-1">${addr.label}</span>
                        <span class="text-sm text-gray-600 leading-tight">${addr.text}</span>
                    </div>
                </label>
            `;
        });
        html += `</div>`;
    }
    html += `</div>`;

    // --- PAYMENT OPTIONS (UPDATED WITH FAKE INPUTS) ---
    html += `
        <div id="payment-options" class="mt-6 pt-4 border-t border-gray-100">
            <h4 class="text-sm font-bold text-gray-700 mb-3">Payment Method</h4>
            <div class="space-y-3">
                <!-- UPI Option -->
                <div class="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <label class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition">
                        <input type="radio" name="payment" value="UPI" checked class="text-orange-600 focus:ring-orange-500" onchange="togglePaymentDetails('UPI')">
                        <div class="flex items-center gap-2">
                            <i class="ph-fill ph-qr-code text-purple-600 text-xl"></i>
                            <span class="text-sm font-medium">UPI / GPay / PhonePe</span>
                        </div>
                    </label>
                    <div id="details-UPI" class="p-3 bg-gray-50 border-t border-gray-100">
                        <input type="text" placeholder="Enter UPI ID (e.g. name@upi)" class="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500">
                    </div>
                </div>

                <!-- Card Option -->
                <div class="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <label class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition">
                        <input type="radio" name="payment" value="Card" class="text-orange-600 focus:ring-orange-500" onchange="togglePaymentDetails('Card')">
                        <div class="flex items-center gap-2">
                            <i class="ph-fill ph-credit-card text-blue-600 text-xl"></i>
                            <span class="text-sm font-medium">Credit / Debit Card</span>
                        </div>
                    </label>
                    <div id="details-Card" class="p-3 bg-gray-50 border-t border-gray-100 hidden">
                        <input type="text" placeholder="Card Number" class="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 mb-2">
                        <div class="flex gap-2">
                            <input type="text" placeholder="MM/YY" class="w-1/2 p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500">
                            <input type="password" placeholder="CVV" class="w-1/2 p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500">
                        </div>
                    </div>
                </div>

                <!-- COD Option -->
                <div class="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <label class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition">
                        <input type="radio" name="payment" value="COD" class="text-orange-600 focus:ring-orange-500" onchange="togglePaymentDetails('COD')">
                        <div class="flex items-center gap-2">
                            <i class="ph-fill ph-money text-green-600 text-xl"></i>
                            <span class="text-sm font-medium">Cash on Delivery</span>
                        </div>
                    </label>
                    <!-- No details needed for COD -->
                    <div id="details-COD" class="hidden"></div> 
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    totalEl.textContent = `₹${total}`;
    if(checkoutBtn) checkoutBtn.disabled = false;
};

// Function to toggle visibility of fake payment details
window.togglePaymentDetails = function(selectedMethod) {
    ['UPI', 'Card', 'COD'].forEach(method => {
        const el = document.getElementById(`details-${method}`);
        if (el) {
            if (method === selectedMethod && method !== 'COD') {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
};

window.changeQty = function(index, change) {
    if (window.appState.cart[index].qty + change <= 0) {
        window.appState.cart.splice(index, 1);
    } else {
        window.appState.cart[index].qty += change;
    }
    window.updateCart();
};

window.checkout = function() {
    if (window.appState.cart.length === 0) return;

    // Address Validation
    const selectedAddrInput = document.querySelector('input[name="delivery_address"]:checked');
    const addressText = selectedAddrInput ? selectedAddrInput.value : null;

    if (!addressText) {
        window.showToast("Please select or add a delivery address!", true);
        // Optional: highlight the address section or redirect
        return;
    }

    const btn = document.getElementById('checkout-btn');
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    btn.disabled = true;
    btn.innerHTML = `<i class="ph-bold ph-spinner animate-spin"></i> Processing ${paymentMethod}...`;
    
    setTimeout(() => {
        const orders = JSON.parse(localStorage.getItem(window.KEYS.ORDERS) || '[]');
        const total = window.appState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        const newOrder = {
            id: Date.now(),
            userId: window.appState.user.id || 'guest',
            userName: window.appState.user.name,
            date: new Date().toISOString(),
            items: window.appState.cart,
            total: total,
            paymentMethod: paymentMethod,
            address: addressText, // Save address to order
            status: 'Pending'
        };
        
        orders.push(newOrder);
        localStorage.setItem(window.KEYS.ORDERS, JSON.stringify(orders));
        
        window.appState.cart = [];
        window.updateCart();
        window.toggleCart();
        
        window.showToast(`Payment via ${paymentMethod} Successful! Order Placed 🍲`);
        
        setTimeout(() => {
            window.location.href = 'user.html';
        }, 1500);

    }, 2000);
};

window.showToast = function(msg, isError = false) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    const icon = document.getElementById('toast-icon');
    
    msgEl.textContent = msg;
    icon.className = isError ? 'ph-fill ph-warning-circle text-xl text-red-500' : 'ph-fill ph-check-circle text-xl text-green-500';
    toast.children[0].className = isError ? 'bg-red-100 text-red-600 p-2 rounded-full' : 'bg-green-100 text-green-600 p-2 rounded-full';
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
};

function safeJSONParse(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } 
    catch (e) { return fallback; }
}

document.addEventListener('DOMContentLoaded', () => {
    window.appState.user = safeJSONParse(window.KEYS.USER, null);
    window.appState.cart = safeJSONParse(window.KEYS.CART, []);
    window.appState.kitchens = safeJSONParse(window.KEYS.KITCHENS, []);
    window.appState.dishes = safeJSONParse(window.KEYS.DISHES, []);
    window.appState.addresses = safeJSONParse(window.KEYS.ADDRESSES, []); // Load addresses

// Load existing kitchens from localStorage
    window.appState.kitchens = safeJSONParse(window.KEYS.KITCHENS, []);
    window.appState.dishes = safeJSONParse(window.KEYS.DISHES, []);


    window.checkLogin();
    window.renderCartBadge();
    
    const userForm = document.getElementById('user-login-form');
    const adminForm = document.getElementById('admin-login-form');
    if (userForm) userForm.addEventListener('submit', window.handleUserLogin);
    if (adminForm) adminForm.addEventListener('submit', window.handleAdminLogin);
});