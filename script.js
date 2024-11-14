document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchResults = document.createElement('div');
    searchResults.id = 'search-results';
    searchInput.parentNode.appendChild(searchResults);
    const inventory = document.getElementById('inventory');
    const crafts = document.getElementById('crafts');

    let items = [];
    let recipes = [];

    function generateVersionSeed() {
        return Math.random().toString(36).substring(2, 15);
    }

    const versionSeed = generateVersionSeed();

    // Fetch items and recipes from JSON files with version seed to prevent caching
    Promise.all([
        fetch(`base_building.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`clothing.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`communication.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`crafting.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`fishing.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`horticulture.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`light_sources.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`medical.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`personal_storage.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`power_source.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`protective_gear.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`repair_kits.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`survival.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`tools.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`vehicle_parts.json?v=${versionSeed}`).then(response => response.json()),
        fetch(`miscellaneous.json?v=${versionSeed}`).then(response => response.json())
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
                <img src="${item.icon}" alt="${item.name}">
                <div>
                    <button onclick="changeQuantity('${item.name}', -1)">-</button>
                </div>`;
            inventory.appendChild(itemDiv);
        }
    };

    window.changeQuantity = function(itemName, change) {
        const item = document.getElementById(`inventory-${itemName}`);
        const amountInput = item.querySelector('.amount');
        const newAmount = parseInt(amountInput.value) + change;
        if (newAmount <= 0) {
            item.remove();
        } else {
            amountInput.value = newAmount;
        }
    };
});
