document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchResults = document.createElement('div');
    searchResults.id = 'search-results';
    searchInput.parentNode.appendChild(searchResults);
    const inventory = document.getElementById('inventory');
    const crafts = document.getElementById('crafts');

    let items = [];
    let recipes = [];

    // Fetch items and recipes from JSON files
    Promise.all([
        fetch('base_building.json').then(response => response.json()),
        fetch('clothing.json').then(response => response.json()),
        fetch('communication.json').then(response => response.json()),
        fetch('crafting.json').then(response => response.json()),
        fetch('fishing.json').then(response => response.json()),
        fetch('horticulture.json').then(response => response.json()),
        fetch('light_sources.json').then(response => response.json()),
        fetch('medical.json').then(response => response.json()),
        fetch('personal_storage.json').then(response => response.json()),
        fetch('power_source.json').then(response => response.json()),
        fetch('protective_gear.json').then(response => response.json()),
        fetch('repair_kits.json').then(response => response.json()),
        fetch('survival.json').then(response => response.json()),
        fetch('tools.json').then(response => response.json()),
        fetch('vehicle_parts.json').then(response => response.json()),
        fetch('miscellaneous.json').then(response => response.json())
    ]).then(jsonFiles => {
        jsonFiles.forEach(file => {
            recipes = recipes.concat(file.recipes);
            file.recipes.forEach(recipe => {
                recipe.materials.forEach(material => {
                    if (!items.some(item => item.name === material)) {
                        items.push({ name: material, icon: `${material.toLowerCase().replace(/ /g, '_')}.png` });
                    }
                });
            });
        });
        initSearch();
    });

    function initSearch() {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            searchResults.innerHTML = '';
            if (query.trim() === '') {
                searchResults.style.display = 'none';
                return;
            }
            const filteredItems = items.filter(item => item.name.toLowerCase().includes(query));
            filteredItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'dropdown-item';
                itemDiv.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    <div class="item-button">
                        <button onclick="addToInventory('${item.name}')">+</button>
                    </div>`;
                searchResults.appendChild(itemDiv);
            });
            searchResults.style.display = filteredItems.length ? 'block' : 'none';
        });

        searchInput.addEventListener('focus', () => {
            const query = searchInput.value.toLowerCase();
            if (query) {
                searchResults.style.display = 'block';
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                searchResults.style.display = 'none';
            }, 200); // Delay to allow click on search results
        });
    }

    window.addToInventory = function(itemName) {
        const item = items.find(i => i.name === itemName);
        const existingItem = document.getElementById(`inventory-${itemName}`);
        if (existingItem) {
            const amountInput = existingItem.querySelector('.amount');
            amountInput.value = parseInt(amountInput.value) + 1;
        } else {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.id = `inventory-${itemName}`;
            itemDiv.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${item.name}</span>
                    <button class="remove-item" onclick="removeFromInventory('${item.name}')">x</button>
                </div>
                <img src="${item.icon}" alt="${item.name}">
                <div class="item-controls">
                    <button onclick="changeQuantity('${item.name}', -1)">-</button>
                    <input type="number" class="amount" value="1" readonly>
                    <button onclick="changeQuantity('${item.name}', 1)">+</button>
                </div>`;
            inventory.appendChild(itemDiv);
        }
        updateCrafts();
    };

    window.changeQuantity = function(itemName, delta) {
        const itemDiv = document.getElementById(`inventory-${itemName}`);
        const amountInput = itemDiv.querySelector('.amount');
        const newValue = parseInt(amountInput.value) + delta;
        if (newValue <= 0) {
            removeFromInventory(itemName);
        } else {
            amountInput.value = newValue;
        }
        updateCrafts();
    };

    window.removeFromInventory = function(itemName) {
        const itemDiv = document.getElementById(`inventory-${itemName}`);
        inventory.removeChild(itemDiv);
        updateCrafts();
    };

    function updateCrafts() {
        const inventoryItems = Array.from(inventory.querySelectorAll('.item')).reduce((acc, itemDiv) => {
            const itemName = itemDiv.id.replace('inventory-', '');
            const amount = parseInt(itemDiv.querySelector('.amount').value);
            acc[itemName] = amount;
            return acc;
        }, {});

        crafts.innerHTML = '';
        recipes.forEach(recipe => {
            const canCraft = recipe.materials.every(material => inventoryItems[material] > 0);
            if (canCraft) {
                const craftDiv = document.createElement('div');
                craftDiv.className = 'item';
                craftDiv.innerHTML = `<p>${recipe.name}</p>`;
                crafts.appendChild(craftDiv);
            }
        });
    }
});
