const KEYS = {
    KITCHENS: 'moms_data_kitchens',
    DISHES: 'moms_data_dishes',
    ORDERS: 'moms_data_orders',
    USER: 'moms_user_current'
};

let data = {
    kitchens: JSON.parse(localStorage.getItem(KEYS.KITCHENS) || '[]'),
    dishes: JSON.parse(localStorage.getItem(KEYS.DISHES) || '[]'),
    orders: JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]')
};

const user = JSON.parse(localStorage.getItem(KEYS.USER));
if (!user || user.role !== 'admin') {
    window.location.href = 'main.html';
}

function saveData() {
    localStorage.setItem(KEYS.KITCHENS, JSON.stringify(data.kitchens));
    localStorage.setItem(KEYS.DISHES, JSON.stringify(data.dishes));
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(data.orders));
}

// Global functions for HTML
window.switchTab = function(tabId) {
    document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('bg-orange-50', 'text-orange-600', 'font-bold');
        btn.classList.add('text-gray-500', 'hover:bg-gray-50', 'font-medium');
    });
    const activeBtn = document.getElementById(`nav-${tabId}`);
    activeBtn.classList.remove('text-gray-500', 'hover:bg-gray-50', 'font-medium');
    activeBtn.classList.add('bg-orange-50', 'text-orange-600', 'font-bold');
};

window.renderDashboard = function() {
    document.getElementById('stat-orders').textContent = data.orders.length;
    document.getElementById('stat-kitchens').textContent = data.kitchens.length;
    const revenue = data.orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
    document.getElementById('stat-revenue').textContent = '₹' + revenue;

    const tbody = document.getElementById('orders-table-body');
    if (data.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-400">No orders yet. Time to promote!</td></tr>`;
        return;
    }
    tbody.innerHTML = data.orders.sort((a,b) => b.id - a.id).map(order => `
        <tr class="hover:bg-gray-50 transition">
            <td class="p-5 font-mono text-gray-500 text-xs">#${order.id.toString().slice(-6)}</td>
            <td class="p-5 font-bold text-gray-800">${order.userName}</td>
            <td class="p-5 text-sm text-gray-600">${order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
            <td class="p-5 font-bold text-gray-800">₹${order.total}</td>
            <td class="p-5"><span class="px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}">${order.status}</span></td>
            <td class="p-5">
                ${order.status === 'Pending' ? `
                    <div class="flex gap-2">
                        <button onclick="updateStatus(${order.id}, 'Confirmed')" class="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"><i class="ph-bold ph-check"></i></button>
                        <button onclick="updateStatus(${order.id}, 'Cancelled')" class="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"><i class="ph-bold ph-x"></i></button>
                    </div>
                ` : '<span class="text-gray-300 text-xs">Completed</span>'}
            </td>
        </tr>
    `).join('');
};

function getStatusColor(status) {
    if(status === 'Pending') return 'bg-yellow-100 text-yellow-700';
    if(status === 'Confirmed') return 'bg-green-100 text-green-700';
    if(status === 'Cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
}

window.updateStatus = function(id, newStatus) {
    const order = data.orders.find(o => o.id === id);
    if (order) {
        order.status = newStatus;
        saveData();
        window.renderDashboard();
    }
};

window.renderKitchens = function() {
    const grid = document.getElementById('admin-kitchens-grid');
    const select = document.getElementById('d-kitchen');
    
    grid.innerHTML = data.kitchens.map(k => `
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center ${k.active === false ? 'opacity-60 bg-gray-50' : ''}">
            <img src="${k.img}" class="w-20 h-20 rounded-xl object-cover">
            <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-800 truncate">${k.name} ${k.active === false ? '(Inactive)' : ''}</h3>
                <p class="text-xs text-gray-500 truncate">${k.desc}</p>
                <div class="flex gap-2 mt-2">
                    <button onclick="editKitchen(${k.id})" class="text-blue-500 text-xs font-bold hover:underline">Edit</button>
                    <button onclick="toggleKitchen(${k.id})" class="${k.active === false ? 'text-green-500' : 'text-orange-500'} text-xs font-bold hover:underline">${k.active === false ? 'Activate' : 'Deactivate'}</button>
                    <button onclick="deleteKitchen(${k.id})" class="text-red-500 text-xs font-bold hover:underline">Delete</button>
                </div>
            </div>
        </div>
    `).join('');

    select.innerHTML = data.kitchens.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
};

// Helper to read file as Data URL
const readFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Variable to track if we are editing
let editingKitchenId = null;

window.openKitchenModal = function(isEdit = false) {
    const modalTitle = document.querySelector('#kitchen-modal h2');
    const form = document.querySelector('#kitchen-modal form');
    
    if (!isEdit) {
        editingKitchenId = null;
        modalTitle.textContent = "Add New Kitchen";
        form.reset();
    } else {
        modalTitle.textContent = "Edit Kitchen";
    }
    window.openModal('kitchen-modal');
}

window.editKitchen = function(id) {
    const kitchen = data.kitchens.find(k => k.id === id);
    if (!kitchen) return;

    editingKitchenId = id;
    document.getElementById('k-name').value = kitchen.name;
    document.getElementById('k-desc').value = kitchen.desc;
    // Note: We can't set file inputs, but we can set the URL input if it was a URL
    if (!kitchen.img.startsWith('data:')) {
        document.getElementById('k-img-url').value = kitchen.img;
    }
    
    window.openKitchenModal(true);
}

window.toggleKitchen = function(id) {
    const kitchen = data.kitchens.find(k => k.id === id);
    if (kitchen) {
        kitchen.active = kitchen.active === undefined ? false : !kitchen.active; // Default to true if undefined, toggle makes it false
        saveData();
        window.renderKitchens();
        // Also toggle dishes? Optional. For now just the kitchen status.
    }
}

window.addKitchen = async function(e) {
    e.preventDefault();
    const name = document.getElementById('k-name').value;
    const desc = document.getElementById('k-desc').value;
    const urlInput = document.getElementById('k-img-url').value;
    const fileInput = document.getElementById('k-img-file');
    
    let img = urlInput; 

    if (fileInput.files && fileInput.files[0]) {
        try {
            img = await readFile(fileInput.files[0]);
        } catch (err) {
            console.error("Error reading file", err);
            alert("Failed to read image file");
            return;
        }
    }

    // If editing and no new image provided, keep old image
    if (editingKitchenId) {
        const existingKitchen = data.kitchens.find(k => k.id === editingKitchenId);
        if (!img && existingKitchen) {
            img = existingKitchen.img;
        }
    }

    if (!img) {
        alert("Please provide an image URL or select a file.");
        return;
    }

    if (editingKitchenId) {
        // Update existing
        const kitchenIndex = data.kitchens.findIndex(k => k.id === editingKitchenId);
        if (kitchenIndex > -1) {
            data.kitchens[kitchenIndex] = {
                ...data.kitchens[kitchenIndex],
                name,
                desc,
                img
            };
        }
    } else {
        // Create new
        const newKitchen = {
            id: Date.now(),
            name,
            desc,
            img,
            active: true
        };
        data.kitchens.push(newKitchen);
    }

    saveData();
    window.closeModal('kitchen-modal');
    window.renderKitchens();
    window.renderDishes(); // Update dish view in case kitchen name changed
    e.target.reset();
    editingKitchenId = null;
};

window.deleteKitchen = function(id) {
    if(confirm('Delete kitchen and all its dishes?')) {
        data.kitchens = data.kitchens.filter(k => k.id !== id);
        data.dishes = data.dishes.filter(d => d.kitchenId !== id);
        saveData();
        window.renderKitchens();
        window.renderDishes();
    }
};

window.renderDishes = function() {
    const grid = document.getElementById('admin-dishes-grid');
    const kitchens = data.kitchens;

    // Create filter dropdown
    let filterHtml = `
        <div class="col-span-full mb-6 flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <label class="font-bold text-gray-700 whitespace-nowrap">Filter by Kitchen:</label>
            <select id="dish-filter-select" onchange="renderFilteredDishes(this.value)" class="input-modern flex-1">
                <option value="all">All Kitchens</option>
                ${kitchens.map(k => `<option value="${k.id}">${k.name}</option>`).join('')}
            </select>
            <button id="edit-current-kitchen-btn" class="hidden btn-primary px-4 py-2 rounded-lg text-sm font-bold" onclick="editCurrentKitchen()">Edit This Kitchen</button>
        </div>
        <div id="filtered-dishes-container" class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Dishes will be rendered here -->
        </div>
    `;
    
    grid.innerHTML = filterHtml;
    
    // Initial render with 'all' or previously selected
    renderFilteredDishes('all');
};

window.renderFilteredDishes = function(kitchenId) {
    const container = document.getElementById('filtered-dishes-container');
    const editBtn = document.getElementById('edit-current-kitchen-btn');
    
    if (!container) return;

    // Show/Hide Edit Kitchen Button based on selection
    if (kitchenId !== 'all') {
        editBtn.classList.remove('hidden');
        // Store current kitchen ID on the button for easy access
        editBtn.dataset.kitchenId = kitchenId;
    } else {
        editBtn.classList.add('hidden');
    }

    let filteredDishes = data.dishes;
    if (kitchenId !== 'all') {
        filteredDishes = data.dishes.filter(d => d.kitchenId === parseInt(kitchenId));
    }

    if (filteredDishes.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">No dishes found for this selection.</div>`;
        return;
    }

    container.innerHTML = filteredDishes.map(d => `
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group ${d.active === false ? 'opacity-60 bg-gray-50' : ''}">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-800">${d.name}</h3>
                <span class="font-mono text-sm font-bold bg-gray-100 px-2 py-1 rounded-lg">₹${d.price}</span>
            </div>
            <p class="text-xs text-gray-500 mb-4 line-clamp-2">${d.desc}</p>
            <img src="${d.img}" class="w-full h-32 object-cover rounded-xl mb-2">
            <div class="flex justify-between items-center pt-2 border-t border-gray-50">
                <div class="flex gap-2">
                    <button onclick="editDish(${d.id})" class="text-blue-500 bg-blue-50 px-2 py-1 rounded-lg text-xs font-bold hover:bg-blue-100">Edit</button>
                    <button onclick="toggleDish(${d.id})" class="${d.active !== false ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-200'} px-3 py-1 rounded-lg text-xs font-bold transition">
                        ${d.active !== false ? 'Active' : 'Inactive'}
                    </button>
                </div>
                <button onclick="deleteDish(${d.id})" class="text-red-400 hover:text-red-600 transition"><i class="ph-bold ph-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// Wrapper to call editKitchen from the dish filter view
window.editCurrentKitchen = function() {
    const btn = document.getElementById('edit-current-kitchen-btn');
    const kitchenId = parseInt(btn.dataset.kitchenId);
    if (kitchenId) {
        editKitchen(kitchenId);
    }
};

let editingDishId = null;

window.openDishModal = function(isEdit = false) {
    const modalTitle = document.querySelector('#dish-modal h2');
    const form = document.querySelector('#dish-modal form');
    
    if (!isEdit) {
        editingDishId = null;
        modalTitle.textContent = "Add New Dish";
        form.reset();
    } else {
        modalTitle.textContent = "Edit Dish";
    }
    window.openModal('dish-modal');
}

window.editDish = function(id) {
    const dish = data.dishes.find(d => d.id === id);
    if (!dish) return;

    editingDishId = id;
    document.getElementById('d-kitchen').value = dish.kitchenId;
    document.getElementById('d-name').value = dish.name;
    document.getElementById('d-price').value = dish.price;
    document.getElementById('d-desc').value = dish.desc;
    
    if (!dish.img.startsWith('data:')) {
        document.getElementById('d-img-url').value = dish.img;
    }

    window.openDishModal(true);
}

window.addDish = async function(e) {
    e.preventDefault();
    const kitchenId = parseInt(document.getElementById('d-kitchen').value);
    const name = document.getElementById('d-name').value;
    const price = parseInt(document.getElementById('d-price').value);
    const desc = document.getElementById('d-desc').value;
    const urlInput = document.getElementById('d-img-url').value;
    const fileInput = document.getElementById('d-img-file');

    let img = urlInput;

    if (fileInput.files && fileInput.files[0]) {
        try {
            img = await readFile(fileInput.files[0]);
        } catch (err) {
            console.error("Error reading file", err);
            alert("Failed to read image file");
            return;
        }
    }

    if (editingDishId) {
        const existingDish = data.dishes.find(d => d.id === editingDishId);
        if (!img && existingDish) {
            img = existingDish.img;
        }
    }

    if (!img) {
        alert("Please provide an image URL or select a file.");
        return;
    }

    if (editingDishId) {
        const dishIndex = data.dishes.findIndex(d => d.id === editingDishId);
        if (dishIndex > -1) {
            data.dishes[dishIndex] = {
                ...data.dishes[dishIndex],
                kitchenId,
                name,
                price,
                desc,
                img
            };
        }
    } else {
        const newDish = {
            id: Date.now(),
            kitchenId,
            name,
            price,
            desc,
            img,
            active: true
        };
        data.dishes.push(newDish);
    }

    saveData();
    window.closeModal('dish-modal');
    // Re-render with current filter if possible, otherwise default
    const currentFilter = document.getElementById('dish-filter-select') ? document.getElementById('dish-filter-select').value : 'all';
    renderFilteredDishes(currentFilter); 
    
    e.target.reset();
    editingDishId = null;
};

window.deleteDish = function(id) {
    if(confirm('Delete this dish?')) {
        data.dishes = data.dishes.filter(d => d.id !== id);
        saveData();
        const currentFilter = document.getElementById('dish-filter-select') ? document.getElementById('dish-filter-select').value : 'all';
        renderFilteredDishes(currentFilter);
    }
};

window.toggleDish = function(id) {
    const dish = data.dishes.find(d => d.id === id);
    if(dish) {
        dish.active = !dish.active; // Simply toggle boolean state
        saveData();
        const currentFilter = document.getElementById('dish-filter-select') ? document.getElementById('dish-filter-select').value : 'all';
        renderFilteredDishes(currentFilter);
    }
};

window.openModal = function(id) { document.getElementById(id).classList.remove('hidden'); };
window.closeModal = function(id) { document.getElementById(id).classList.add('hidden'); };
window.doLogout = function() { localStorage.removeItem(KEYS.USER); window.location.href = 'main.html'; };

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    window.renderDashboard();
    window.renderKitchens();
    window.renderDishes();
    
    // Overwrite existing onclicks in HTML to use new wrapper functions
    const addKitchenBtn = document.querySelector('button[onclick="openModal(\'kitchen-modal\')"]');
    if(addKitchenBtn) addKitchenBtn.setAttribute('onclick', 'openKitchenModal()');
    
    const addDishBtn = document.querySelector('button[onclick="openModal(\'dish-modal\')"]');
    if(addDishBtn) addDishBtn.setAttribute('onclick', 'openDishModal()');
});