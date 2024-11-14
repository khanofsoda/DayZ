document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchResults = document.getElementById('search-results');
    const inventory = document.getElementById('inventory');
    const calculateButton = document.getElementById('calculate');
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
            // Assuming each file contains an array of recipes
            recipes = recipes.concat(file.recipes);
            file.recipes.forEach(recipe => {
                Object.keys(recipe.materials).forEach(material => {
                    if (!items.some(item => item.name === material)) {
                        items.push({ name: material, icon: `${material.toLowerCase().replace(/ /g, '_')}.png` });
                    }
                });
            });
        });
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        searchResults.innerHTML = '';
        const filteredItems = items.filter(item => item.name.toLowerCase().includes(query));
        filteredItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `<img src="${item.icon}" alt="${item.name}"><p>${item.name}</p><button onclick="addToInventory('${item.name}')">+</button>`;
            searchResults.appendChild(itemDiv);
        });
    });

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
                <img src="${item.icon}" alt="${item.name}">
                <div>
                    <button onclick="changeQuantity('${itemName}', -1)">-</button>
                    <input type="number" class="amount" value="1" readonly>
                    <button onclick="changeQuantity('${itemName}', 1)">+</button>
                </div>
                <button onclick="removeFromInventory('${itemName}')">x</button>
            `;
            inventory.appendChild(itemDiv);
        }
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
    };

    window.removeFromInventory = function(itemName) {
        const itemDiv = document.getElementById(`inventory-${itemName}`);
        inventory.removeChild(itemDiv);
    };

    calculateButton.addEventListener('click', () => {
        const inventoryItems = Array.from(inventory.querySelectorAll('.item')).reduce((acc, itemDiv) => {
            const itemName = itemDiv.id.replace('inventory-', '');
            const amount = parseInt(itemDiv.querySelector('.amount').value);
            acc[itemName] = amount;
            return acc;
        }, {});

        crafts.innerHTML = '';
        recipes.forEach(recipe => {
            const canCraft = Object.keys(recipe.requires).every(reqItem => inventoryItems[reqItem] >= recipe.requires[reqItem]);
            if (canCraft) {
                const craftDiv = document.createElement('div');
                craftDiv.className = 'item';
                craftDiv.innerHTML = `<p>${recipe.result}</p>`;
                crafts.appendChild(craftDiv);
            }
        });
    });
});
