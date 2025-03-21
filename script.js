document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchResults = document.createElement('div');
    searchResults.id = 'search-results';
    searchInput.parentNode.appendChild(searchResults);

    const inventory = document.getElementById('inventory');
    const crafts = document.getElementById('crafts');
    const itemOverlay = document.getElementById('item-overlay');
    const overlayItemName = document.getElementById('overlay-item-name');
    const overlayItemImage = document.getElementById('overlay-item-image');
    const overlayItemAmount = document.getElementById('overlay-item-amount');

    let items = [];
    let recipes = [];

    const jsonFiles = [
        'base_building.json', 'clothing.json', 'communication.json', 'crafting.json',
        'fishing.json', 'horticulture.json', 'light_sources.json', 'medical.json',
        'personal_storage.json', 'power_source.json', 'protective_gear.json',
        'repair_kits.json', 'survival.json', 'tools.json', 'vehicle_parts.json',
        'miscellaneous.json'
    ];

    fetchJSONFiles(jsonFiles).then(() => initSearch());

    function fetchJSONFiles(files) {
        return Promise.all(files.map(file => fetch(file).then(res => res.json())))
            .then(jsonData => processJSONData(jsonData));
    }

    function processJSONData(jsonData) {
        const uniqueItems = new Set();

        jsonData.forEach(data => {
            recipes.push(...data.recipes);
            data.recipes.forEach(recipe => {
                recipe.materials.forEach(material => {
                    if (!uniqueItems.has(material)) {
                        uniqueItems.add(material);
                        items.push({ 
                            name: material, 
                            icon: `${material.toLowerCase().replace(/ /g, '_')}.png` 
                        });
                    }
                });
            });
        });
    }

    function initSearch() {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            searchResults.innerHTML = '';

            if (!query) {
                searchResults.style.display = 'none';
                return;
            }

            const filteredItems = items.filter(item => item.name.toLowerCase().includes(query));
            const fragment = document.createDocumentFragment();

            filteredItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'dropdown-item';
                itemDiv.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    <div class="item-button">
                        <button onclick="addToInventory('${item.name}')">+</button>
                    </div>`;
                fragment.appendChild(itemDiv);
            });

            searchResults.appendChild(fragment);
            searchResults.style.display = filteredItems.length ? 'block' : 'none';
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                searchResults.style.display = 'block';
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => searchResults.style.display = 'none', 200); // Allow click on results
        });
    }

    window.addToInventory = function(itemName) {
        console.log(`Adding ${itemName} to inventory`);
        // Add inventory handling logic here
    };
});