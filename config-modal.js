class ItemSelectorModal {
    constructor(options = {}) {
        this.options = options.options || [];
        this.title = options.title || 'Select an item';
        this.onSelect = options.onSelect || (() => {});
        this.allowCustom = options.allowCustom !== false;
        this.modalId = options.id || `item-selector-modal-${Date.now()}`;
        this.multiSelect = options.multiSelect || false;
        this.selectedItems = new Set(Array.isArray(options.selectedItems) ? options.selectedItems : []);
        this.initialized = false;
        this.init();
    }

    init() {
        // Remove any existing modal with the same ID
        const existingModal = document.getElementById(this.modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
    

        this.initialized = true;

        // Create modal container
        const modal = document.createElement('div');
        modal.id = this.modalId;
        modal.className = 'item-selector-modal';
        modal.style.display = 'none';
        
        // Check if options are categorized (object with category keys) or flat array
        const isCategorized = this.options && typeof this.options === 'object' && 
                            !Array.isArray(this.options) && 
                            Object.values(this.options).every(Array.isArray);
        
        // Generate options HTML based on structure
        let optionsHtml = '';
        
        if (isCategorized) {
            // Handle categorized options
            // First, separate custom category if it exists
            const customCategory = 'Custom';
            const sortedCategories = Object.entries(this.options).sort(([catA], [catB]) => {
                if (catA === customCategory) return -1;
                if (catB === customCategory) return 1;
                return catA.localeCompare(catB);
            });
            
            for (const [category, items] of sortedCategories) {
                if (items && items.length > 0) {
                    optionsHtml += `
                        <div class="category-container">
                            <div class="category-header">${category}</div>
                            <div class="category-items">
                                ${items.map(item => {
                                    const isSelected = this.selectedItems.has(item) ? 'selected' : '';
                                    return `
                                    <div class="item-option ${isSelected}" data-value="${item}" role="option">
                                        ${item}
                                    </div>`;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }
            }
        } else {
            // Handle flat array for backward compatibility
            const items = Array.isArray(this.options) ? this.options : [];
            optionsHtml = items.map(item => `
                <div class="item-option" data-value="${item}" role="option">
                    ${item}
                </div>
            `).join('');
        }

        // Modal content with CSS classes
        modal.innerHTML = `
            <div class="item-selector-content">
                <div class="item-selector-header">
                    <h3>${this.title}</h3>
                    <button type="button" class="item-selector-close" aria-label="Close">&times;</button>
                </div>
                <div class="item-selector-search">
                    <input type="text" class="item-search-input" placeholder="Search or type a custom value...">
                </div>
                <div class="item-selector-list">
                    ${optionsHtml}
                </div>
                <div class="item-selector-actions">
                    ${this.multiSelect ? `
                        <button type="button" class="item-select-all">Select All</button>
                        <button type="button" class="item-deselect-all">Clear Selection</button>
                        <button type="button" class="item-custom-submit">Add ${this.selectedItems.size || ''} Selected</button>
                    ` : `
                        <button type="button" class="item-custom-submit">Use Selection or Custom Value</button>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const modal = document.getElementById(this.modalId);
        const closeBtn = modal.querySelector('.item-selector-close');
        const searchInput = modal.querySelector('.item-search-input');
        const itemOptions = modal.querySelectorAll('.item-option');
        const customSubmit = modal.querySelector('.item-custom-submit');

        // Close modal when clicking the close button or outside the modal
        closeBtn.addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });

        // Search functionality with dynamic filtering
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            let hasVisibleItems = false;
            
            itemOptions.forEach(option => {
                const value = option.getAttribute('data-value').toLowerCase();
                const isVisible = value.includes(searchTerm);
                option.style.display = isVisible ? 'block' : 'none';
                if (isVisible) hasVisibleItems = true;
            });
        });

        // Item selection on click
        itemOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const value = option.getAttribute('data-value');
                
                if (this.multiSelect) {
                    e.stopPropagation();
                    if (option.classList.contains('selected')) {
                        option.classList.remove('selected');
                        this.selectedItems.delete(value);
                    } else {
                        option.classList.add('selected');
                        this.selectedItems.add(value);
                    }
                    this.updateSelectedCount();
                } else {
                    searchInput.value = value;
                    this.selectItem(value);
                }
            });
        });

        // Select All button
        const selectAllBtn = modal.querySelector('.item-select-all');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                itemOptions.forEach(option => {
                    const value = option.getAttribute('data-value');
                    option.classList.add('selected');
                    this.selectedItems.add(value);
                });
                this.updateSelectedCount();
            });
        }

        // Deselect All button
        const deselectAllBtn = modal.querySelector('.item-deselect-all');
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => {
                itemOptions.forEach(option => {
                    option.classList.remove('selected');
                });
                this.selectedItems.clear();
                this.updateSelectedCount();
            });
        }

        // Submit handler
        const handleSubmit = () => {
            if (this.multiSelect) {
                // For multi-select, pass all selected items (can be empty array)
                this.onSelect(Array.from(this.selectedItems));
                this.close();
            } else {
                // For single select or custom value
                const searchValue = searchInput.value.trim();
                if (searchValue) {
                    // Handle both array and object options
                    let isCustom = true;
                    if (Array.isArray(this.options)) {
                        isCustom = !this.options.some(option => 
                            option && option.toLowerCase() === searchValue.toLowerCase()
                        );
                    } else if (this.options && typeof this.options === 'object') {
                        // If options is an object, check if any value matches (case-insensitive)
                        isCustom = !Object.values(this.options).some(option => 
                            option && option.toString().toLowerCase() === searchValue.toLowerCase()
                        );
                    }
                    this.onSelect(searchValue, isCustom);
                    this.close();
                }
            }
        };

        // Handle Enter key in search input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });
        
        // Update search functionality to work with categories
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const allOptions = modal.querySelectorAll('.item-option');
            let hasVisibleItems = false;
            
            // Show all category containers first
            const categoryContainers = modal.querySelectorAll('.category-container');
            categoryContainers.forEach(container => {
                container.style.display = '';
            });
            
            // If search is empty, show all items and return
            if (!searchTerm) {
                allOptions.forEach(option => option.style.display = '');
                return;
            }
            
            // Filter items and update visibility
            allOptions.forEach(option => {
                const value = option.getAttribute('data-value').toLowerCase();
                const isVisible = value.includes(searchTerm);
                option.style.display = isVisible ? '' : 'none';
                if (isVisible) hasVisibleItems = true;
            });
            
            // Hide empty categories
            if (categoryContainers.length > 0) {
                categoryContainers.forEach(container => {
                    const items = container.querySelectorAll('.item-option');
                    const visibleItems = Array.from(items).filter(item => 
                        item.style.display !== 'none'
                    );
                    
                    if (visibleItems.length === 0) {
                        container.style.display = 'none';
                    }
                });
            }
        });

        // Handle submit button click
        if (customSubmit) {
            customSubmit.addEventListener('click', handleSubmit);
        }
    }

    open(options = {}) {
        // Update instance properties if provided
        if (options.title) this.title = options.title;
        if (options.options) this.options = options.options;
        
        // Store the onSelect callback from options if provided
        if (options.onSelect) {
            this.onSelect = options.onSelect;
        }
        
        // Re-initialize to ensure clean state
        this.init();
        
        const modal = document.getElementById(this.modalId);
        if (!modal) return;
        
        // Update title
        modal.querySelector('h3').textContent = this.title;
        
        // Check if options are categorized
        const isCategorized = this.options && typeof this.options === 'object' && 
                            !Array.isArray(this.options) && 
                            Object.values(this.options).every(Array.isArray);
        
        const list = modal.querySelector('.item-selector-list');
        let optionsHtml = '';
        
        if (isCategorized) {
            // Handle categorized options
            // Keep Custom category first, maintain original order for others
            const entries = Object.entries(this.options);
            const customIndex = entries.findIndex(([cat]) => cat === 'Custom');
            
            // If Custom exists, move it to the front
            if (customIndex > -1) {
                const [customEntry] = entries.splice(customIndex, 1);
                entries.unshift(customEntry);
            }

            for (const [category, items] of entries) {
                if (items && items.length > 0) {
                    optionsHtml += `
                        <div class="category-container">
                            <div class="category-header">${category}</div>
                            <div class="category-items">
                                ${items.map(item => {
                                    const isSelected = this.selectedItems.has(item) ? 'selected' : '';
                                    return `
                                    <div class="item-option ${isSelected}" data-value="${item}" role="option">
                                        ${item}
                                    </div>`;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }
            }
        } else {
            // Handle flat array for backward compatibility
            const items = Array.isArray(this.options) ? this.options : [];
            optionsHtml = items.map(item => `
                <div class="item-option" data-value="${item}" role="option">
                    ${item}
                </div>
            `).join('');
        }
        
        list.innerHTML = optionsHtml;
        
        // Reset search
        const searchInput = modal.querySelector('.item-search-input');
        searchInput.value = '';
        
        // Prevent background scrolling with layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        document.body.classList.add('modal-open');
        
        // Show modal with transition
        modal.style.display = 'flex';
        // Force reflow to ensure the initial state is applied
        void modal.offsetHeight;
        // Add active class to trigger the transition
        modal.classList.add('active');
        
        // Focus search input after a short delay
        setTimeout(() => {
            searchInput.focus();
        }, 150);
        
        // Re-attach event listeners
        this.setupEventListeners();
    }

    close() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;
        
        // Start fade out animation
        modal.classList.remove('active');
        
        // After the transition completes, hide the modal and re-enable scrolling
        setTimeout(() => {
            // Re-enable scrolling when modal is closed
            document.body.classList.remove('modal-open');
            document.documentElement.style.removeProperty('--scrollbar-width');
            modal.style.display = 'none';
        }, 300); // Match this with the CSS transition duration
    }

    updateSelectedCount() {
        const submitBtn = document.querySelector(`#${this.modalId} .item-custom-submit`);
        if (submitBtn) {
            const count = this.selectedItems.size;
            submitBtn.textContent = count === 0 ? 'Deselect All' : `Add ${count} Selected`;
            submitBtn.disabled = false; // Always keep the button enabled
        }
    }

    selectItem(value) {
        if (typeof this.onSelect === 'function') {
            this.onSelect(value);
        }
        
        this.close();
    }
}

