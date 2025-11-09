// Vanilla Module
const VanillaModule = (function() {
    // Private variables
    let isInitialized = false;
    let particleSelector;
    let isEditing = false;
    let currentPairKey = null;
    let materialSelector;
    const self = this; // Store reference to the module instance

    // Setup number inputs with increment/decrement buttons
    function setupNumberInputs() {
        // Get config manager instance
        const configManager = window.configManager || new ConfigManager();
        
        // Define all number inputs and their configuration paths
        const numberInputs = [
            // Entity settings
            { id: 'vanilla-explosion-radius', path: 'entity.explosionRadius' },
            { id: 'vanilla-explosion-factor', path: 'entity.explosionFactor' },
            { id: 'vanilla-underwater-explosion-factor', path: 'entity.underwaterExplosionFactor' },
            { id: 'vanilla-min-travel-distance', path: 'entity.minTravelDistance' },
            { id: 'vanilla-entity-sound-volume', path: 'entity.sound.volume' },
            { id: 'vanilla-entity-sound-pitch', path: 'entity.sound.pitch' },
            
            // Material settings
            { id: 'vanilla-material-damage', path: 'material.damage' },
            { id: 'vanilla-material-drop-chance', path: 'material.dropChance' },
            { id: 'vanilla-material-distance-attenuation', path: 'material.distanceAttenuation' },
            { id: 'vanilla-material-underwater-damage', path: 'material.underwaterDamage' },
            { id: 'vanilla-material-sound-volume', path: 'material.sound.volume' },
            { id: 'vanilla-material-sound-pitch', path: 'material.sound.pitch' },
            
            // Entity particles on hit
            { id: 'vanilla-particles-onhit-amount', path: 'particles.amount' },
            { id: 'vanilla-particles-onhit-size', path: 'particles.size' },
            { id: 'vanilla-particles-onhit-speed', path: 'particles.speed' },
            { id: 'vanilla-particles-onhit-delta-x', path: 'particles.deltaX' },
            { id: 'vanilla-particles-onhit-delta-y', path: 'particles.deltaY' },
            { id: 'vanilla-particles-onhit-delta-z', path: 'particles.deltaZ' },
            { id: 'vanilla-particles-onhit-red', path: 'particles.red' },
            { id: 'vanilla-particles-onhit-green', path: 'particles.green' },
            { id: 'vanilla-particles-onhit-blue', path: 'particles.blue' },
            
            // Entity particles on break
            { id: 'vanilla-particles-onbreak-amount', path: 'particles.amount' },
            { id: 'vanilla-particles-onbreak-size', path: 'particles.size' },
            { id: 'vanilla-particles-onbreak-speed', path: 'particles.speed' },
            { id: 'vanilla-particles-onbreak-delta-x', path: 'particles.deltaX' },
            { id: 'vanilla-particles-onbreak-delta-y', path: 'particles.deltaY' },
            { id: 'vanilla-particles-onbreak-delta-z', path: 'particles.deltaZ' },
            { id: 'vanilla-particles-onbreak-red', path: 'particles.red' },
            { id: 'vanilla-particles-onbreak-green', path: 'particles.green' },
            { id: 'vanilla-particles-onbreak-blue', path: 'particles.blue' },
            
            // Material particles on hit
            { id: 'vanilla-material-particles-onhit-amount', path: 'particles.amount' },
            { id: 'vanilla-material-particles-onhit-size', path: 'particles.size' },
            { id: 'vanilla-material-particles-onhit-speed', path: 'particles.speed' },
            { id: 'vanilla-material-particles-onhit-delta-x', path: 'particles.deltaX' },
            { id: 'vanilla-material-particles-onhit-delta-y', path: 'particles.deltaY' },
            { id: 'vanilla-material-particles-onhit-delta-z', path: 'particles.deltaZ' },
            { id: 'vanilla-material-particles-onhit-red', path: 'particles.red' },
            { id: 'vanilla-material-particles-onhit-green', path: 'particles.green' },
            { id: 'vanilla-material-particles-onhit-blue', path: 'particles.blue' },
            
            // Material particles on break
            { id: 'vanilla-material-particles-onbreak-amount', path: 'particles.amount' },
            { id: 'vanilla-material-particles-onbreak-size', path: 'particles.size' },
            { id: 'vanilla-material-particles-onbreak-speed', path: 'particles.speed' },
            { id: 'vanilla-material-particles-onbreak-delta-x', path: 'particles.deltaX' },
            { id: 'vanilla-material-particles-onbreak-delta-y', path: 'particles.deltaY' },
            { id: 'vanilla-material-particles-onbreak-delta-z', path: 'particles.deltaZ' },
            { id: 'vanilla-material-particles-onbreak-red', path: 'particles.red' },
            { id: 'vanilla-material-particles-onbreak-green', path: 'particles.green' },
            { id: 'vanilla-material-particles-onbreak-blue', path: 'particles.blue' }
        ];
        
        // Convert config paths to input configurations
        const inputConfigs = numberInputs.map(({ id, path }) => {
            const configPath = path.split('.');
            let config = configManager.defaultValues;
            
            // Traverse the config object to get the specific config
            for (const key of configPath) {
                if (config && config[key] !== undefined) {
                    config = config[key];
                } else {
                    console.warn(`Config path not found: ${path}`);
                    return null;
                }
            }
            
            // Extract config values with safe defaults
            if (config.value === undefined) {
                console.warn(`Missing required value for ${id} in path ${path}`);
                return null;
            }
            
            return {
                id,
                min: config.min !== undefined ? parseFloat(config.min) : 0,
                max: config.max !== undefined ? parseFloat(config.max) : 100,
                step: config.step !== undefined ? parseFloat(config.step) : 1,
                defaultValue: parseFloat(config.value)
            };
        }).filter(Boolean); // Remove any null entries from invalid config paths

        // Process each input configuration
        inputConfigs.forEach(({ id, min, max, step, defaultValue }) => {
            const input = document.getElementById(id);
            if (!input) {
                console.warn(`Input element not found: ${id}`);
                return;
            }
            
            const box = input.closest('.number-box');
            const incrementBtn = box?.querySelector('.increment');
            const decrementBtn = box?.querySelector('.decrement');
            
            // If no existing number-box wrapper, create one
            if (!box || !incrementBtn || !decrementBtn) {
                // Create wrapper if it doesn't exist
                const wrapper = document.createElement('div');
                wrapper.className = 'number-box';
                wrapper.style.position = 'relative';
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                
                // Create buttons container
                const buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'buttons';
                buttonsContainer.style.display = 'flex';
                buttonsContainer.style.flexDirection = 'column';
                buttonsContainer.style.marginLeft = '4px';
                
                // Create increment button
                const incrementBtn = document.createElement('div');
                incrementBtn.className = 'button increment';
                incrementBtn.textContent = '▲';
                incrementBtn.style.cursor = 'pointer';
                incrementBtn.style.padding = '2px 6px';
                incrementBtn.style.fontSize = '10px';
                incrementBtn.style.lineHeight = '1';
                incrementBtn.style.backgroundColor = 'var(--bg-secondary)';
                incrementBtn.style.border = '1px solid var(--border-light)';
                incrementBtn.style.borderRadius = '2px 2px 0 0';
                
                // Create decrement button
                const decrementBtn = document.createElement('div');
                decrementBtn.className = 'button decrement';
                decrementBtn.textContent = '▼';
                decrementBtn.style.cursor = 'pointer';
                decrementBtn.style.padding = '2px 6px';
                decrementBtn.style.fontSize = '10px';
                decrementBtn.style.lineHeight = '1';
                decrementBtn.style.backgroundColor = 'var(--bg-secondary)';
                decrementBtn.style.border = '1px solid var(--border-light)';
                decrementBtn.style.borderTop = 'none';
                decrementBtn.style.borderRadius = '0 0 2px 2px';
                
                // Add buttons to container
                buttonsContainer.appendChild(incrementBtn);
                buttonsContainer.appendChild(decrementBtn);
                
                // Wrap the input
                if (input.parentNode) {
                    input.parentNode.insertBefore(wrapper, input);
                    wrapper.appendChild(input);
                    wrapper.appendChild(buttonsContainer);
                }
                
                // Update references
                input.style.width = '80px';
            }
            
            // Now we have the proper structure, get the elements again
            const finalBox = input.closest('.number-box');
            const finalIncrementBtn = finalBox.querySelector('.increment');
            const finalDecrementBtn = finalBox.querySelector('.decrement');
            
            if (!finalBox || !finalIncrementBtn || !finalDecrementBtn) return;
            
            // Set initial value from config if empty
            if (!input.value) {
                input.value = defaultValue;
            }
            
            // Store previous valid value
            let previousValue = parseFloat(input.value) || defaultValue;
            
            // Format number based on step
            function formatNumber(num) {
                return num % 1 === 0 ? num.toString() : num.toFixed(step < 1 ? 1 : 0);
            }
            
            // Validate and update value
            function validateAndUpdate(value) {
                let num = parseFloat(value);
                if (isNaN(num)) {
                    num = defaultValue;
                }
                
                // Apply min/max constraints
                num = Math.max(min, Math.min(max, num));
                
                // Update value if changed
                if (num !== previousValue) {
                    previousValue = num;
                    input.value = formatNumber(num);
                    // Trigger input event to notify any listeners
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    // Ensure the value is properly formatted
                    input.value = formatNumber(num);
                }
                
                return num;
            }
            
            // Button click handlers with disabled state check
            const handleButtonClick = (direction) => {
                if (input.disabled) return;
                const currentValue = parseFloat(input.value) || 0;
                const newValue = currentValue + (direction * step);
                validateAndUpdate(newValue);
            };
            
            finalIncrementBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleButtonClick(1);
            });
            
            finalDecrementBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleButtonClick(-1);
            });
            
            // Prevent wheel events when disabled
            input.addEventListener('wheel', (e) => {
                if (input.disabled) {
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                const direction = Math.sign(e.deltaY) * -1;
                handleButtonClick(direction);
            }, { passive: false });

            // Input validation
            input.addEventListener('input', (e) => {
                // Allow numbers, decimal point, and minus sign
                input.value = input.value.replace(/[^0-9.-]/g, '');
                
                // Only allow one decimal point
                const parts = input.value.split('.');
                if (parts.length > 2) {
                    input.value = parts[0] + '.' + parts.slice(1).join('');
                }
            });
            
            // Validate on blur
            input.addEventListener('blur', () => {
                validateAndUpdate(input.value);
            });
            
            // Handle Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    validateAndUpdate(input.value);
                    input.blur();
                }
            });
            
            // Mouse wheel support
            input.addEventListener('wheel', (e) => {
                e.preventDefault();
                const direction = Math.sign(e.deltaY) * -1; // Invert scroll direction (up = increase, down = decrease)
                const currentValue = parseFloat(input.value) || 0;
                const newValue = currentValue + (direction * step);
                validateAndUpdate(newValue);
            }, { passive: false });
            
            // Initial validation
            validateAndUpdate(input.value);
        });
    }

    // Function to toggle particle controls based on particle type
    function toggleParticleControls(particleName, prefix) {
        const blockParticles = ['BLOCK', 'BLOCK_CRACK', 'BLOCK_DUST', 'BLOCK_MARKER', 'DUST_PILLAR', 'FALLING_DUST', 'ITEM_COBWEB', 'ITEM_SLIME', 'ITEM_SNOWBALL'];
        const isBlockParticle = blockParticles.includes(particleName);
        
        // Function to disable/enable number input and its buttons
        const toggleNumberInput = (inputId) => {
            const input = document.getElementById(inputId);
            if (!input) return;
            
            input.disabled = isBlockParticle;
            input.style.opacity = isBlockParticle ? '0.0' : '1';
            input.style.cursor = isBlockParticle ? 'default' : 'auto';
            input.title = isBlockParticle ? 'RGB: Only for DUST particle type' : '';
            
            const row = input.closest('.vanilla-form-row');
            if (row) {
                row.classList.toggle('disabled', isBlockParticle);
                // Disable/enable increment/decrement buttons
                const buttons = row.querySelectorAll('.button');
                buttons.forEach(btn => {
                    btn.disabled = isBlockParticle;
                    btn.style.opacity = isBlockParticle ? '0.5' : '1';
                    btn.style.cursor = isBlockParticle ? 'not-allowed' : 'pointer';
                });
            }
        };
        
        // Toggle color controls
        ['red', 'green', 'blue'].forEach(color => {
            toggleNumberInput(`${prefix}${color}`);
        });
        
        // Toggle material inputs for DUST particles
        const isDustParticle = particleName === 'DUST';
        // Only disable the material input that corresponds to the current prefix
        const materialInput = document.getElementById(`${prefix}material`);
        if (materialInput) {
            materialInput.disabled = isDustParticle;
            materialInput.style.backgroundColor = isDustParticle ? '#1a1a1a' : '';
            materialInput.style.color = isDustParticle ? '#1a1a1a' : '';
            materialInput.style.cursor = isDustParticle ? 'not-allowed' : 'text';
            materialInput.title = isDustParticle ? 'Material: Only for BLOCK particle type' : '';
        }
        
        // Toggle size control
        toggleNumberInput(`${prefix}size`);
    }

    function setupItemSelectors() {
        // Particle name inputs
        const particleInputs = [
            { id: 'vanilla-particles-onhit-name', prefix: 'vanilla-particles-onhit-' },
            { id: 'vanilla-particles-onbreak-name', prefix: 'vanilla-particles-onbreak-' },
            { id: 'vanilla-material-particles-onhit-name', prefix: 'vanilla-material-particles-onhit-' },
            { id: 'vanilla-material-particles-onbreak-name', prefix: 'vanilla-material-particles-onbreak-' }
        ];

        particleInputs.forEach(({id, prefix}) => {
            const input = document.getElementById(id);
            if (input) {
                // Initial setup
                toggleParticleControls(input.value, prefix);
                
                input.addEventListener('focus', (e) => {
                    e.preventDefault();
                    if (particleSelector) {
                        particleSelector.open({
                            title: 'Select Particle',
                            options: configManager.dropdownOptions.particleNames,
                            onSelect: (value) => {
                                input.value = value;
                                // Toggle controls based on selection
                                toggleParticleControls(value, prefix);
                                // Trigger input event to update any dependent fields
                                const event = new Event('input', { bubbles: true });
                                input.dispatchEvent(event);
                            }
                        });
                    }
                });
                
                // Also handle direct input changes
                input.addEventListener('input', () => {
                    toggleParticleControls(input.value, prefix);
                });
            }
        });

        // Material inputs
        const materialInputs = [
            'vanilla-particles-onhit-material',
            'vanilla-particles-onbreak-material',
            'vanilla-material-particles-onhit-material',
            'vanilla-material-particles-onbreak-material'
        ];

        materialInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('focus', (e) => {
                    e.preventDefault();
                    if (materialSelector) {
                        const materials = configManager.dropdownOptions.materialNames || {};
                        
                        materialSelector.open({
                            title: 'Select Material',
                            options: materials,
                            onSelect: (value, isCustom) => {
                                // Only add 'minecraft:' prefix for non-custom values that don't already have it
                                const finalValue = isCustom || value.startsWith('minecraft:') ? value : `minecraft:${value}`;
                                input.value = finalValue;
                                // Trigger input event to update any dependent fields
                                const event = new Event('input', { bubbles: true });
                                input.dispatchEvent(event);
                            }
                        });
                    }
                });
            }
        });

        // Sound selection for entity and material
        const soundInputs = [
            'vanilla-entity-sound-name',
            'vanilla-material-sound-name'
        ];

        soundInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('focus', (e) => {
                    e.preventDefault();
                    const soundSelector = new ItemSelectorModal({
                        title: 'Select Sound',
                        options: configManager.dropdownOptions.soundNames || [],
                        allowCustom: true,
                        onSelect: (value) => {
                            input.value = value;
                            // Trigger input event to update any dependent fields
                            const event = new Event('input', { bubbles: true });
                            input.dispatchEvent(event);
                        }
                    });
                    soundSelector.open();
                });
            }
        });
    }

    // Public methods
    return {
        init: function() {
            if (isInitialized) return;
            isInitialized = true;
            
            this.createVanillaTabContent();
            this.setupVanillaEventListeners();
            this.updatePairList();
            
            // Setup number inputs
            setupNumberInputs();
            
            // Initialize item selector for entity name
            const entityNameInput = document.getElementById('vanilla-entity-name');
            if (entityNameInput) {
                entityNameInput.addEventListener('focus', (e) => {
                    e.preventDefault();
                    const currentValue = entityNameInput.value.trim();
                    const selector = new ItemSelectorModal({
                        title: 'Select Entity',
                        options: configManager.getDropdownOptions('entityNames') || [],
                        allowCustom: true,
                        selectedItems: currentValue ? [currentValue] : [],
                        onSelect: (value) => {
                            entityNameInput.value = value;
                            configManager.setValue('vanilla-entity-name', value);
                            const event = new Event('input', { bubbles: true });
                            entityNameInput.dispatchEvent(event);
                        }
                    });
                    selector.open();
                });
            }

            // Initialize item selector for material name
            const materialNameInput = document.getElementById('vanilla-material-name');
            if (materialNameInput) {
                materialNameInput.addEventListener('focus', (e) => {
                    e.preventDefault();
                    const materials = configManager.dropdownOptions.materialNames || {};
                    let currentValue = materialNameInput.value.trim();
                    // Remove 'minecraft:' prefix for comparison if present
                    if (currentValue.startsWith('minecraft:')) {
                        currentValue = currentValue.substring(10);
                    }
                    
                    const selector = new ItemSelectorModal({
                        title: 'Select Material',
                        options: materials,
                        allowCustom: true,
                        selectedItems: currentValue ? [currentValue] : [],
                        onSelect: (value, isCustom) => {
                            // Only add 'minecraft:' prefix for non-custom values that don't already have it
                            const finalValue = isCustom || value.startsWith('minecraft:') ? value : `minecraft:${value}`;
                            materialNameInput.value = finalValue;
                            configManager.setValue('vanilla-material-name', finalValue);
                            const event = new Event('input', { bubbles: true });
                            materialNameInput.dispatchEvent(event);
                        }
                    });
                    selector.open();
                });
            }

            // Initialize item selector modals for particle and material inputs
            particleSelector = new ItemSelectorModal({
                title: 'Select Particle',
                options: configManager.dropdownOptions.particleNames || [],
                allowCustom: true,
                onSelect: (value) => {
                    // This will be overridden in setupItemSelectors
                    console.log('[DEBUG] Default particle selection handler:', value);
                }
            });

            // Flatten the categorized particle materials for the selector
            const flatMaterials = [];
            if (configManager.dropdownOptions.materialNames) {
                for (const category in configManager.dropdownOptions.materialNames) {
                    flatMaterials.push(...configManager.dropdownOptions.materialNames[category]);
                }
            }
            
            materialSelector = new ItemSelectorModal({
                title: 'Select Material',
                options: flatMaterials.map(m => m.replace('minecraft:', '')),
                allowCustom: true,
                categorized: true,
                categories: configManager.dropdownOptions.materialNames,
                onSelect: (value, isCustom) => {
                    // Only add 'minecraft:' prefix for non-custom values that don't already have it
                    const finalValue = isCustom || value.startsWith('minecraft:') ? value : `minecraft:${value}`;
                    input.value = finalValue;
                    // Trigger input event to update any dependent fields
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                }
            });

            // Set up event listeners for particle and material inputs
            setupItemSelectors();

            // Reset form to ensure all fields are properly initialized
            this.resetVanillaPairForm();
            
            isInitialized = true;
        },

        createVanillaTabContent: function() {
            const vanillaTab = document.getElementById('vanilla');
            vanillaTab.innerHTML = `
                <div class="main-layout">
                    <div class="content-panel">
                        <div class="vanilla-container">
                            <!-- Left Panel - Entity -->
                            <div class="vanilla-panel">
                                <!-- Main Entity Settings Group -->
                                <div class="vanilla-group" data-group="entity-main">
                                    <div class="vanilla-group-title"><strong>Vanilla Entity Settings</strong></div>
                                    <div class="vanilla-group-list" id="entity-settings-list">
                                        <div class="entity-material-row">
                                            <label class="vanilla-label">Entity Name</label>
                                            <input type="text" id="vanilla-entity-name" class="vanilla-input" autocomplete="off">
                                        </div>
                                        <div class="vanilla-settings-grid highlighted-row" style="grid-template-columns: repeat(2, 1fr);">
                                            <!-- Left Column -->
                                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Explosion Radius
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="The explosion radius of the entity. If set to 0, uses the original radius. This overrides the default radius for all calculations.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">The explosion radius of the entity. If set to 0, uses the original radius. This overrides the default radius for all calculations.</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div class="number-box">
                                                        <input type="text" id="vanilla-explosion-radius" class="number-input" value="0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Explosion Factor
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="Multiplies the explosion radius. For example, 2.0 doubles the radius, 0.5 halves it. Set to 1.0 to use the original radius.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">Multiplies the explosion radius. For example, 2.0 doubles the radius, 0.5 halves it. Set to 1.0 to use the original radius.</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div class="number-box">
                                                        <input type="text" id="vanilla-explosion-factor" class="number-input" value="1.0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Underwater Factor
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="Adjusts explosion radius when underwater. Set to 1.0 for normal behavior, less than 1.0 to reduce underwater effect, or more than 1.0 to enhance it.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">Adjusts explosion radius when underwater. Set to 1.0 for normal behavior, less than 1.0 to reduce underwater effect, or more than 1.0 to enhance it.</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div class="number-box">
                                                        <input type="text" id="vanilla-underwater-explosion-factor" class="number-input" value="1.0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Tool Item
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="The item that must be in the player's hand to enable underwater damage. Set to an empty string to disable this check.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">The item that must be in the player's hand to enable underwater damage. Set to an empty string to disable this check.</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <input type="text" id="vanilla-check-tool-item" class="vanilla-input">
                                                </div>
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Min Travel Dist
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="Minimum distance TNT must travel after being primed to enable underwater damage. Prevents TNT cannons from breaking when ExplosionDamageBlocksUnderwater is true. Set to 0 to disable this check.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">Minimum distance TNT must travel after being primed to enable underwater damage. Prevents TNT cannons from breaking when ExplosionDamageBlocksUnderwater is true. Set to 0 to disable this check.</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div class="number-box">
                                                        <input type="text" id="vanilla-min-travel-distance" class="number-input" value="0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Right Column - Fancy Scrollable Checkbox List (Shows exactly 8 items at a time) -->
                                            <div class="fancy-scrollable-container" style="display: flex; flex-direction: column; margin-top: 4px; height: 353px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(0, 0, 0, 0.2);">
                                                <div style="padding: 8px; height: 335px; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth;" class="fancy-scrollbar">
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-replace-original-explosion" class="vanilla-input">
                                                        <label for="vanilla-replace-original-explosion" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Replaces the original explosion with the configured settings. When enabled, the original explosion effect will be replaced by the custom settings defined here.">
                                                            <span class="setting-label-text">
                                                                Replace Original
                                                                <span class="tooltip-text">Replaces the original explosion with the configured settings. When enabled, the original explosion effect will be replaced by the custom settings defined here.</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-pack-dropped-items" class="vanilla-input">
                                                        <label for="vanilla-pack-dropped-items" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Packs the dropped items into a single entity to reduce lag when many items are dropped.">
                                                            <span class="setting-label-text">
                                                                Pack Drops
                                                                <span class="tooltip-text">Packs the dropped items into a single entity, which will be spawned at the explosion's location. This can help reduce client-side lag when the explosion causes many items to drop (especially with explosion radius > 10). If disabled, items will drop naturally (scattered over the ground).</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-snap-to-block-grid" class="vanilla-input">
                                                        <label for="vanilla-snap-to-block-grid" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Snaps dropped items to the block grid for a cleaner look.">
                                                            <span class="setting-label-text">
                                                                Snap To Grid
                                                                <span class="tooltip-text">When enabled, dropped items will snap to the nearest block grid position. This creates a more organized appearance when items are dropped, making them align with the world grid instead of being placed at exact explosion coordinates.</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-explosion-damage-blocks-underwater" class="vanilla-input">
                                                        <label for="vanilla-explosion-damage-blocks-underwater" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Enables block damage for underwater explosions.">
                                                            <span class="setting-label-text">
                                                                Underwater Damage
                                                                <span class="tooltip-text">By default, underwater explosions don't damage blocks not handled by ExplodeAny. When enabled, underwater explosions will damage blocks as if they were above water. The explosion might be slightly weaker due to water/lava resistance. [Default: false]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-disable-explosion-chaining" class="vanilla-input">
                                                        <label for="vanilla-disable-explosion-chaining" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Prevents explosions from triggering other explosions.">
                                                            <span class="setting-label-text">
                                                                No Chain Reaction
                                                                <span class="tooltip-text">When enabled, prevents explosions from triggering other explosions. This is useful to prevent chain reactions where one explosion triggers another, which could cause excessive damage or lag. [Default: false]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-replace-original-explosion-underwater" class="vanilla-input">
                                                        <label for="vanilla-replace-original-explosion-underwater" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Replaces the original underwater explosion with custom settings.">
                                                            <span class="setting-label-text">
                                                                Replace Underwater
                                                                <span class="tooltip-text">Similar to 'Replace Original', but only applies to underwater explosions. When enabled, the original underwater explosion is cancelled and replaced with a new one using your custom settings (including ExplosionRadius and ExplosionFactor). [Default: true]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-explosion-remove-waterlogged-state" class="vanilla-input">
                                                        <label for="vanilla-explosion-remove-waterlogged-state" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Removes waterlogged state from nearby blocks before explosion.">
                                                            <span class="setting-label-text">
                                                                Remove Waterlogged State
                                                                <span class="tooltip-text">When enabled, removes the waterlogged state from nearby blocks before the explosion occurs. This allows breaking blocks that are normally unbreakable due to being waterlogged, such as waterlogged stairs or slabs. [Default: false]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-explosion-remove-waterlogged-state-surface" class="vanilla-input">
                                                        <label for="vanilla-explosion-remove-waterlogged-state-surface" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Controls waterlogged state removal for surface explosions.">
                                                            <span class="setting-label-text">
                                                                Remove Waterlogged (Surface)
                                                                <span class="tooltip-text">When 'Remove Waterlogged State' is enabled, this setting controls whether waterlogged states are removed for explosions that occur on the surface (not underwater). [Default: true]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-explosion-remove-waterlogged-state-underwater" class="vanilla-input">
                                                        <label for="vanilla-explosion-remove-waterlogged-state-underwater" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Controls waterlogged state removal for underwater explosions.">
                                                            <span class="setting-label-text">
                                                                Remove Waterlogged (Underwater)
                                                                <span class="tooltip-text">When 'Remove Waterlogged State' is enabled, this setting controls whether waterlogged states are removed for explosions that occur underwater (or underlava). [Default: true]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-remove-nearby-waterlogged" class="vanilla-input">
                                                        <label for="vanilla-remove-nearby-waterlogged" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Removes entire waterlogged blocks near the explosion.">
                                                            <span class="setting-label-text">
                                                                Remove Nearby Waterlogged
                                                                <span class="tooltip-text">When enabled, completely removes nearby blocks that are waterlogged before the explosion. This is different from just removing the waterlogged state - it removes the entire block. Useful for breaking blocks that are normally unbreakable when waterlogged. [Default: false]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-remove-nearby-waterlogged-surface" class="vanilla-input">
                                                        <label for="vanilla-remove-nearby-waterlogged-surface" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Controls waterlogged block removal for surface explosions.">
                                                            <span class="setting-label-text">
                                                                Remove Waterlogged (Surface)
                                                                <span class="tooltip-text">When 'Remove Nearby Waterlogged' is enabled, this setting controls whether waterlogged blocks are removed for explosions that occur on the surface (not underwater). [Default: true]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-remove-nearby-waterlogged-underwater" class="vanilla-input">
                                                        <label for="vanilla-remove-nearby-waterlogged-underwater" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Controls waterlogged block removal for underwater explosions.">
                                                            <span class="setting-label-text">
                                                                Remove Waterlogged (Underwater)
                                                                <span class="tooltip-text">When 'Remove Nearby Waterlogged' is enabled, this setting controls whether waterlogged blocks are removed for explosions that occur underwater (or underlava). [Default: true]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-remove-nearby-liquids" class="vanilla-input">
                                                        <label for="vanilla-remove-nearby-liquids" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Removes nearby liquids (water/lava) before explosion.">
                                                            <span class="setting-label-text">
                                                                Remove Nearby Liquids
                                                                <span class="tooltip-text">When enabled, removes nearby liquid blocks (water or lava) before the explosion occurs. This can help break blocks that are normally protected by liquids. [Default: false]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox">
                                                        <input type="checkbox" id="vanilla-remove-nearby-liquids-surface" class="vanilla-input">
                                                        <label for="vanilla-remove-nearby-liquids-surface" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Controls liquid removal for surface explosions.">
                                                            <span class="setting-label-text">
                                                                Remove Liquids (Surface)
                                                                <span class="tooltip-text">When 'Remove Nearby Liquids' is enabled, this setting controls whether liquids are removed for explosions that occur on the surface (not underwater). [Default: true]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div class="vanilla-checkbox-item fancy-checkbox" style="margin-bottom: 4px;">
                                                        <input type="checkbox" id="vanilla-remove-nearby-liquids-underwater" class="vanilla-input">
                                                        <label for="vanilla-remove-nearby-liquids-underwater" class="setting-hint tooltip-trigger" style="cursor: help;" data-tooltip="Controls liquid removal for underwater explosions.">
                                                            <span class="setting-label-text">
                                                                Remove Liquids (Underwater)
                                                                <span class="tooltip-text">When 'Remove Nearby Liquids' is enabled, this setting controls whether liquids are removed for explosions that occur underwater (or underlava). [Default: true]</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Entity Sound & Particle Effects (Nested under Entity Settings) -->
                                        <div class="vanilla-subgroup" style="margin-top: 0; padding-top: 20px; border-top: none;">
                                            <div class="vanilla-group-title" style="margin: -20px 0 16px -16px; font-size: 1.1em; padding-left: 16px;"><strong>Sound & Particle Effects</strong></div>
                                            <div class="vanilla-form-row highlighted-row" style="grid-column: 1 / -1">
                                                <label class="vanilla-label">Sound Name</label>
                                                <input type="text" id="vanilla-entity-sound-name" class="vanilla-input">
                                            </div>
                                            <div class="vanilla-settings-grid highlighted-row" style="grid-template-columns: 1fr 0.8fr;">
                                                <div class="vanilla-form-row">
                                                    <label class="vanilla-label">Volume</label>
                                                    <div class="number-box" style="width: 100px;">
                                                        <input type="text" id="vanilla-entity-sound-volume" class="number-input" value="1.0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vanilla-form-row" style="gap: 8px;">
                                                    <label class="vanilla-label" style="min-width: auto;">Pitch</label>
                                                    <div class="number-box" style="width: 100px;">
                                                        <input type="text" id="vanilla-entity-sound-pitch" class="number-input" value="1.0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Entity Particles (Nested under Sound Settings) -->
                                            <div class="vanilla-subgroup" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light);">
                                                <div class="vanilla-tabs-container">
                                                    <div class="vanilla-tabs-header">
                                                        <button class="vanilla-tab-button active" data-tab="entity-onhit">On Hit</button>
                                                        <button class="vanilla-tab-button" data-tab="entity-onbreak">On Break</button>
                                                    </div>
                                                    <div class="vanilla-tab-content">
                                                        <!-- On Hit Tab -->
                                                        <div class="vanilla-tab-panel active" id="entity-onhit">
                                                            <div class="vanilla-form-grid highlighted-row">
                                                                <div class="vanilla-form-row" style="display: flex; align-items: center;">
                                                                    <label class="toggle-label">
                                                                        <span class="toggle-switch">
                                                                            <input type="checkbox" id="vanilla-particles-onhit-enabled" class="vanilla-input">
                                                                            <span class="toggle-slider"></span>
                                                                        </span>
                                                                        Enabled
                                                                    </label>
                                                                </div>
                                                                <div class="vanilla-checkbox-item" style="margin: 0;">
                                                                    <input type="checkbox" id="vanilla-particles-onhit-force" class="vanilla-input">
                                                                    <label for="vanilla-particles-onhit-force">Force</label>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label"><span class="label-icon">🎯</span> Name</label>
                                                                    <input type="text" id="vanilla-particles-onhit-name" class="vanilla-input" placeholder="Click to select particle..." readonly>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label"><span class="label-icon">🧱</span> Material</label>
                                                                    <input type="text" id="vanilla-particles-onhit-material" class="vanilla-input" placeholder="Enter material name...">
                                                                </div>
                                                            </div>
                                                            <div class="vanilla-particles-grid highlighted-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Amount</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onhit-amount" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Size</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onhit-size" class="number-input" value="1.0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Speed</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onhit-speed" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta X</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onhit-delta-x" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta Y</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onhit-delta-y" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta Z</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onhit-delta-z" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Red</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onhit-red" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Green</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onhit-green" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Blue</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onhit-blue" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <!-- On Break Tab -->
                                                        <div class="vanilla-tab-panel" id="entity-onbreak">
                                                            <div class="vanilla-form-grid highlighted-row">
                                                                <div class="vanilla-form-row" style="display: flex; align-items: center;">
                                                                    <label class="toggle-label">
                                                                        <span class="toggle-switch">
                                                                            <input type="checkbox" id="vanilla-particles-onbreak-enabled" class="vanilla-input">
                                                                            <span class="toggle-slider"></span>
                                                                        </span>
                                                                        Enabled
                                                                    </label>
                                                                </div>
                                                                <div class="vanilla-checkbox-item" style="margin: 0;">
                                                                    <input type="checkbox" id="vanilla-particles-onbreak-force" class="vanilla-input">
                                                                    <label for="vanilla-particles-onbreak-force">Force</label>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label"><span class="label-icon">🎯</span> Name</label>
                                                                    <input type="text" id="vanilla-particles-onbreak-name" class="vanilla-input" placeholder="Click to select particle..." readonly>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label"><span class="label-icon">🧱</span> Material</label>
                                                                    <input type="text" id="vanilla-particles-onbreak-material" class="vanilla-input" placeholder="Enter material name...">
                                                                </div>
                                                            </div>
                                                            <div class="vanilla-particles-grid highlighted-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Amount</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onbreak-amount" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Size</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onbreak-size" class="number-input" value="1.0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Speed</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onbreak-speed" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta X</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onbreak-delta-x" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta Y</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onbreak-delta-y" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta Z</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onbreak-delta-z" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Red</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onbreak-red" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Green</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onbreak-green" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Blue</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-particles-onbreak-blue" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Panel - Material -->
                            <div class="vanilla-panel">
                                <!-- Main Material Settings Group -->
                                <div class="vanilla-group" data-group="material-main">
                                    <div class="vanilla-group-title"><strong>Vanilla Material Settings</strong></div>
                                    <div class="vanilla-group-list" id="material-settings-list">
                                        <div class="entity-material-row">
                                            <label class="vanilla-label">Material Name</label>
                                            <input type="text" id="vanilla-material-name" class="vanilla-input" autocomplete="off">
                                        </div>
                                        <div class="vanilla-settings-grid highlighted-row" style="grid-template-columns: repeat(2, 1fr);">
                                            <!-- Left Column -->
                                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Damage
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="Base damage used to compute the effective damage taken by a block.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">Base damage used to compute the effective damage taken by a block. The effective damage is calculated according to the formula:<br><br>effectiveDamage = baseDamage * underwaterDamageFactor * (1 - distanceFactor * distanceAttenuationFactor)<br><br>where distanceFactor = distance / explosionRadius<br><br>[Minimum]: 0.0<br>[Default] is the same value as BlockDurability (which means enough damage to break the block in one explosion)<br>Values greater than BlockDurability are allowed.</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div class="number-box">
                                                        <input type="text" id="vanilla-material-damage" class="number-input" value="0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Drop Chance
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="Chance of blocks naturally breaking and dropping items.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">Indicates the chance of naturally breaking the block (and thus having a drop). The value is a percentage, so:<br><br>- 0.0 means blocks will never break naturally<br>- 100.0 means blocks will always break naturally<br><br>[Minimum] [Default] is 0.0 (blocks never break naturally)<br>[Maximum] is 100.0 (blocks always break naturally)</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div class="number-box">
                                                        <input type="text" id="vanilla-material-drop-chance" class="number-input" value="0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Drop Material
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="Overrides the material dropped when block is broken.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">Overrides the material that will be dropped when the block is broken. It can be a Material, but note that not all materials are available for drops (liquids like WATER, for instance, can't be dropped).<br><br>[Default] is the same material as in the name of the section.</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <input type="text" id="vanilla-material-drop-material" class="vanilla-input" placeholder="e.g., minecraft:cobblestone">
                                                </div>
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Distance Attenuation
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="Controls how damage decreases with distance.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">Indicates how effective damage decreases with distance. The value is a percentage:<br><br>- 0.0 means all blocks in range take the same damage<br>- 1.0 means damage decreases linearly with distance<br><br>[Minimum] [Default] is 0.0 (uniform damage)<br>[Maximum] is 1.0 (linear falloff)<br><br>This affects the distanceFactor in the damage calculation.</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div class="number-box">
                                                        <input type="text" id="vanilla-material-distance-attenuation" class="number-input" value="0" min="0" max="1" step="0.1">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vanilla-form-row">
                                                    <div class="vanilla-label">
                                                        <span class="setting-label-text">
                                                            Underwater Damage
                                                            <span class="setting-hint tooltip-trigger" data-tooltip="Damage multiplier for underwater explosions.">
                                                                <span class="tooltip-icon">i</span>
                                                                <span class="tooltip-text">Damage multiplicative factor applied when explosion takes place underwater. The value is a percentage:<br><br>- 0.0 means no damage will be taken underwater<br>- 1.0 means water doesn't affect damage<br><br>[Minimum] is 0.0 (no underwater damage)<br>[Default] is 0.5 (halves damage underwater)<br>Values > 1.0 magnify damage underwater</span>
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div class="number-box">
                                                        <input type="text" id="vanilla-material-underwater-damage" class="number-input" value="0.5" min="0" step="0.1">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style="height: 16px;"></div>
                                            </div>
                                            
                                            <!-- Right Column - Checkboxes -->
                                            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                                                <div class="vanilla-checkbox-item" style="margin: 0;">
                                                    <input type="checkbox" id="vanilla-material-fancy-underwater" class="vanilla-input">
                                                    <label for="vanilla-material-fancy-underwater" class="setting-hint tooltip-trigger" data-tooltip="Controls how underwater detection works.">
                                                        <span class="tooltip-text">Specifies when UnderwaterDamageFactor is applied:<br><br><strong>False [default]</strong>: Look for water in the explosion center (faster)<br><strong>True</strong>: Trace a ray from explosion center to each block and look for water (more accurate but slower)<br><br>When false, all blocks are considered underwater if the explosion center is underwater. When true, checks each block individually.</span>
                                                        Fancy Underwater Detection
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Spacer -->
                                        <div style="height: 84px;"></div>

                                        <!-- Material Sound & Particle Effects (Nested under Material Settings) -->
                                        <div class="vanilla-subgroup" style="margin-top: 0; padding-top: 20px; border-top: none;">
                                            <div class="vanilla-group-title" style="margin: -20px 0 16px -16px; font-size: 1.1em; padding-left: 16px;"><strong>Sound & Particle Effects</strong></div>
                                            <div class="vanilla-form-row highlighted-row">
                                                <label class="vanilla-label">Sound Name</label>
                                                <input type="text" id="vanilla-material-sound-name" class="vanilla-input" placeholder="minecraft:block.stone.break">
                                            </div>
                                            <div class="vanilla-settings-grid highlighted-row" style="grid-template-columns: 1fr 0.8fr;">
                                                <div class="vanilla-form-row">
                                                    <label class="vanilla-label">Volume</label>
                                                    <div class="number-box" style="width: 100px;">
                                                        <input type="text" id="vanilla-material-sound-volume" class="number-input" value="1.0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="vanilla-form-row" style="gap: 8px;">
                                                    <label class="vanilla-label" style="min-width: auto;">Pitch</label>
                                                    <div class="number-box" style="width: 100px;">
                                                        <input type="text" id="vanilla-material-sound-pitch" class="number-input" value="1.0">
                                                        <div class="buttons">
                                                            <div class="button increment">▲</div>
                                                            <div class="button decrement">▼</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Material Particles (Nested under Sound Settings) -->
                                            <div class="vanilla-subgroup" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light);">
                                                <div class="vanilla-tabs-container">
                                                    <div class="vanilla-tabs-header">
                                                        <button class="vanilla-tab-button active" data-tab="material-onhit">On Hit</button>
                                                        <button class="vanilla-tab-button" data-tab="material-onbreak">On Break</button>
                                                    </div>
                                                    <div class="vanilla-tab-content">
                                                        <!-- On Hit Tab -->
                                                        <div class="vanilla-tab-panel active" id="material-onhit">
                                                            <div class="vanilla-form-grid highlighted-row">
                                                                <div class="vanilla-form-row" style="display: flex; align-items: center;">
                                                                    <label class="toggle-label">
                                                                        <span class="toggle-switch">
                                                                            <input type="checkbox" id="vanilla-material-particles-onhit-enabled" class="vanilla-input">
                                                                            <span class="toggle-slider"></span>
                                                                        </span>
                                                                        Enabled
                                                                    </label>
                                                                </div>
                                                                <div class="vanilla-checkbox-item" style="margin: 0;">
                                                                    <input type="checkbox" id="vanilla-material-particles-onhit-force" class="vanilla-input">
                                                                    <label for="vanilla-material-particles-onhit-force">Force</label>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label"><span class="label-icon">🎯</span> Name</label>
                                                                    <input type="text" id="vanilla-material-particles-onhit-name" class="vanilla-input" placeholder="Click to select particle..." readonly>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label"><span class="label-icon">🧱</span> Material</label>
                                                                    <input type="text" id="vanilla-material-particles-onhit-material" class="vanilla-input" placeholder="Enter material name...">
                                                                </div>
                                                            </div>
                                                            <div class="vanilla-particles-grid highlighted-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Amount</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onhit-amount" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Size</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onhit-size" class="number-input" value="1.0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Speed</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onhit-speed" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta X</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onhit-delta-x" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta Y</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onhit-delta-y" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta Z</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onhit-delta-z" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Red</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onhit-red" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Green</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onhit-green" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Blue</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onhit-blue" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <!-- On Break Tab -->
                                                        <div class="vanilla-tab-panel" id="material-onbreak">
                                                            <div class="vanilla-form-grid highlighted-row">
                                                                <div class="vanilla-form-row" style="display: flex; align-items: center;">
                                                                    <label class="toggle-label">
                                                                        <span class="toggle-switch">
                                                                            <input type="checkbox" id="vanilla-material-particles-onbreak-enabled" class="vanilla-input">
                                                                            <span class="toggle-slider"></span>
                                                                        </span>
                                                                        Enabled
                                                                    </label>
                                                                </div>
                                                                <div class="vanilla-checkbox-item" style="margin: 0;">
                                                                    <input type="checkbox" id="vanilla-material-particles-onbreak-force" class="vanilla-input">
                                                                    <label for="vanilla-material-particles-onbreak-force">Force</label>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label"><span class="label-icon">🎯</span> Name</label>
                                                                    <input type="text" id="vanilla-material-particles-onbreak-name" class="vanilla-input" placeholder="Click to select particle..." readonly>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label"><span class="label-icon">🧱</span> Material</label>
                                                                    <input type="text" id="vanilla-material-particles-onbreak-material" class="vanilla-input" placeholder="Enter material name...">
                                                                </div>
                                                            </div>
                                                            <div class="vanilla-particles-grid highlighted-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Amount</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onbreak-amount" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Size</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onbreak-size" class="number-input" value="1.0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Speed</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onbreak-speed" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta X</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onbreak-delta-x" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta Y</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onbreak-delta-y" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Delta Z</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onbreak-delta-z" class="number-input" value="0">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Red</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onbreak-red" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Green</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onbreak-green" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="vanilla-form-row">
                                                                    <label class="vanilla-label">Blue</label>
                                                                    <div class="number-box">
                                                                        <input type="text" id="vanilla-material-particles-onbreak-blue" class="number-input" value="255">
                                                                        <div class="buttons">
                                                                            <div class="button increment">▲</div>
                                                                            <div class="button decrement">▼</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                
                <!-- Vertical floating action buttons on the left side -->
                <div class="config-actions">
                    <button id="save-vanilla-pair" class="btn primary" title="Save the current configuration">
                        <i class="fas fa-save"></i>
                        <span class="btn-text">Save</span>
                    </button>
                    <button id="reset-vanilla-pair" class="btn warning" title="Reset the form to default values">
                        <i class="fas fa-undo"></i>
                        <span class="btn-text">Reset</span>
                    </button>
                </div>
                
            `;

            // Apply particle defaults
            this.applyParticleDefaults();
            
            // Set up vanilla tabs
            setupVanillaTabs();
        },

        applyParticleDefaults: function() {
            // Vanilla entity particles
            configManager.resetSection('particles', 'vanilla-particles-onhit-');
            configManager.resetSection('particles', 'vanilla-particles-onbreak-');
            
            // Vanilla material particles
            configManager.resetSection('particles', 'vanilla-material-particles-onhit-');
            configManager.resetSection('particles', 'vanilla-material-particles-onbreak-');
        },

        setupVanillaEventListeners: function() {
            // Vanilla pair actions
            document.getElementById('save-vanilla-pair').addEventListener('click', () => this.saveVanillaPair());
            document.getElementById('reset-vanilla-pair').addEventListener('click', () => this.resetVanillaPairForm());
        },

    // Save/Load functions for Vanilla Pair

        saveVanillaPair: function() {
            const entityName = configManager.getValue('vanilla-entity-name');
            const materialName = configManager.getValue('vanilla-material-name');
            
            if (!entityName || !materialName) {
                showNotification('Both entity and material names are required', 'error');
                return;
            }
            
            const pairKey = `${entityName}:${materialName}`;
            
            // If we're in editing mode and the key has changed, remove the old pair
            if (isEditing && currentPairKey && currentPairKey !== pairKey) {
                delete dataStore.vanilla.pairs[currentPairKey];
                showNotification(`Updated pair from ${currentPairKey} to ${pairKey}`, 'info');
            }
            
            // Entity data
            const entityData = {
                name: entityName,
                explosionRadius: configManager.getValue('vanilla-explosion-radius'),
                explosionFactor: configManager.getValue('vanilla-explosion-factor'),
                underwaterExplosionFactor: configManager.getValue('vanilla-underwater-explosion-factor'),
                replaceOriginalExplosion: configManager.getValue('vanilla-replace-original-explosion'),
                snapToBlockGrid: configManager.getValue('vanilla-snap-to-block-grid'),
                disableExplosionChaining: configManager.getValue('vanilla-disable-explosion-chaining'),
                packDroppedItems: configManager.getValue('vanilla-pack-dropped-items'),
                checkToolItem: configManager.getValue('vanilla-check-tool-item'),
                explosionDamageBlocksUnderwater: configManager.getValue('vanilla-explosion-damage-blocks-underwater'),
                replaceOriginalExplosionWhenUnderwater: configManager.getValue('vanilla-replace-original-explosion-underwater'),
                explosionRemoveWaterloggedStateFromNearbyBlocks: configManager.getValue('vanilla-explosion-remove-waterlogged-state'),
                explosionRemoveWaterloggedStateFromNearbyBlocksOnSurface: configManager.getValue('vanilla-explosion-remove-waterlogged-state-surface'),
                explosionRemoveWaterloggedStateFromNearbyBlocksUnderwater: configManager.getValue('vanilla-explosion-remove-waterlogged-state-underwater'),
                explosionRemoveNearbyWaterloggedBlocks: configManager.getValue('vanilla-remove-nearby-waterlogged'),
                explosionRemoveNearbyWaterloggedBlocksOnSurface: configManager.getValue('vanilla-remove-nearby-waterlogged-surface'),
                explosionRemoveNearbyWaterloggedBlocksUnderwater: configManager.getValue('vanilla-remove-nearby-waterlogged-underwater'),
                explosionRemoveNearbyLiquids: configManager.getValue('vanilla-remove-nearby-liquids'),
                explosionRemoveNearbyLiquidsOnSurface: configManager.getValue('vanilla-remove-nearby-liquids-surface'),
                explosionRemoveNearbyLiquidsUnderwater: configManager.getValue('vanilla-remove-nearby-liquids-underwater'),
                minTravelDistance: configManager.getValue('vanilla-min-travel-distance'),
                sound: {
                    name: configManager.getValue('vanilla-entity-sound-name'),
                    volume: configManager.getValue('vanilla-entity-sound-volume'),
                    pitch: configManager.getValue('vanilla-entity-sound-pitch')
                },
                particlesOnHit: this.getParticlesData('vanilla', 'entity', 'onhit'),
                particlesOnBreak: this.getParticlesData('vanilla', 'entity', 'onbreak')
            };
            
            // Material data
            const materialData = {
                name: materialName,
                damage: configManager.getValue('vanilla-material-damage'),
                dropChance: configManager.getValue('vanilla-material-drop-chance'),
                dropMaterial: configManager.getValue('vanilla-material-drop-material'),
                distanceAttenuation: configManager.getValue('vanilla-material-distance-attenuation'),
                underwaterDamage: configManager.getValue('vanilla-material-underwater-damage'),
                fancyUnderwater: configManager.getValue('vanilla-material-fancy-underwater'),
                sound: {
                    name: configManager.getValue('vanilla-material-sound-name'),
                    volume: configManager.getValue('vanilla-material-sound-volume'),
                    pitch: configManager.getValue('vanilla-material-sound-pitch')
                },
                particlesOnHit: this.getParticlesData('vanilla', 'material', 'onhit'),
                particlesOnBreak: this.getParticlesData('vanilla', 'material', 'onbreak')
            };
            
            dataStore.vanilla.pairs[pairKey] = {
                entity: entityData,
                material: materialData
            };
            
            // Update editing state
            isEditing = true;
            currentPairKey = pairKey;
            this.updateUIForEditing(true);
            
            saveToLocalStorage();
            this.updatePairList();
            
            // Update the conversion dropdown if it exists
            if (typeof updateConversionDropdown === 'function') {
                updateConversionDropdown();
            }
            
            showNotification(`Vanilla pair "${entityName}:${materialName}" saved successfully`, 'success');
        },

        loadVanillaPair: function() {
            const entityName = configManager.getValue('vanilla-entity-name');
            const materialName = configManager.getValue('vanilla-material-name');
            
            if (!entityName || !materialName) {
                showNotification('Both entity and material names are required', 'error');
                return;
            }
            
            const pairKey = `${entityName}:${materialName}`;
            
            // Set editing state
            isEditing = true;
            currentPairKey = pairKey;
            this.updateUIForEditing(true);
            
            if (!dataStore.vanilla.pairs[pairKey]) {
                console.error(`Pair not found: ${pairKey}. Available pairs:`, Object.keys(dataStore.vanilla.pairs));
                showNotification(`Pair not found: ${pairKey}`, 'error');
                return;
            }
            
            const pairData = dataStore.vanilla.pairs[pairKey];
            const entityData = pairData.entity;
            const materialData = pairData.material;
            
            // Load entity data
            configManager.setValue('vanilla-explosion-radius', entityData.explosionRadius);
            configManager.setValue('vanilla-explosion-factor', entityData.explosionFactor);
            configManager.setValue('vanilla-underwater-explosion-factor', entityData.underwaterExplosionFactor);
            configManager.setValue('vanilla-replace-original-explosion', entityData.replaceOriginalExplosion);
            configManager.setValue('vanilla-snap-to-block-grid', entityData.snapToBlockGrid);
            configManager.setValue('vanilla-disable-explosion-chaining', entityData.disableExplosionChaining);
            configManager.setValue('vanilla-pack-dropped-items', entityData.packDroppedItems);
            configManager.setValue('vanilla-check-tool-item', entityData.checkToolItem);
            configManager.setValue('vanilla-explosion-damage-blocks-underwater', entityData.explosionDamageBlocksUnderwater);
            configManager.setValue('vanilla-replace-original-explosion-underwater', entityData.replaceOriginalExplosionWhenUnderwater);
            configManager.setValue('vanilla-explosion-remove-waterlogged-state', entityData.explosionRemoveWaterloggedStateFromNearbyBlocks);
            configManager.setValue('vanilla-explosion-remove-waterlogged-state-surface', entityData.explosionRemoveWaterloggedStateFromNearbyBlocksOnSurface);
            configManager.setValue('vanilla-explosion-remove-waterlogged-state-underwater', entityData.explosionRemoveWaterloggedStateFromNearbyBlocksUnderwater);
            configManager.setValue('vanilla-remove-nearby-waterlogged', entityData.explosionRemoveNearbyWaterloggedBlocks);
            configManager.setValue('vanilla-remove-nearby-waterlogged-surface', entityData.explosionRemoveNearbyWaterloggedBlocksOnSurface);
            configManager.setValue('vanilla-remove-nearby-waterlogged-underwater', entityData.explosionRemoveNearbyWaterloggedBlocksUnderwater);
            configManager.setValue('vanilla-remove-nearby-liquids', entityData.explosionRemoveNearbyLiquids);
            configManager.setValue('vanilla-remove-nearby-liquids-surface', entityData.explosionRemoveNearbyLiquidsOnSurface);
            configManager.setValue('vanilla-remove-nearby-liquids-underwater', entityData.explosionRemoveNearbyLiquidsUnderwater);
            configManager.setValue('vanilla-min-travel-distance', entityData.minTravelDistance);
            
            // Load entity sound
            configManager.setValue('vanilla-entity-sound-name', entityData.sound?.name);
            configManager.setValue('vanilla-entity-sound-volume', entityData.sound?.volume);
            configManager.setValue('vanilla-entity-sound-pitch', entityData.sound?.pitch);
            
            // Load entity particles
            this.setParticlesData('vanilla', 'entity', 'onhit', entityData.particlesOnHit);
            this.setParticlesData('vanilla', 'entity', 'onbreak', entityData.particlesOnBreak);
            
            // Load material data
            configManager.setValue('vanilla-material-damage', materialData.damage);
            configManager.setValue('vanilla-material-drop-chance', materialData.dropChance);
            configManager.setValue('vanilla-material-drop-material', materialData.dropMaterial);
            configManager.setValue('vanilla-material-distance-attenuation', materialData.distanceAttenuation);
            configManager.setValue('vanilla-material-underwater-damage', materialData.underwaterDamage);
            configManager.setValue('vanilla-material-fancy-underwater', materialData.fancyUnderwater);
            
            // Load material sound
            configManager.setValue('vanilla-material-sound-name', materialData.sound?.name);
            configManager.setValue('vanilla-material-sound-volume', materialData.sound?.volume);
            configManager.setValue('vanilla-material-sound-pitch', materialData.sound?.pitch);
            
            // Load material particles
            this.setParticlesData('vanilla', 'material', 'onhit', materialData.particlesOnHit);
            this.setParticlesData('vanilla', 'material', 'onbreak', materialData.particlesOnBreak);
            
            showNotification(`Vanilla pair "${entityName}:${materialName}" loaded successfully`, 'success');
        },

        updateUIForEditing: function(isEditing) {
            const saveButton = document.getElementById('save-vanilla-pair');
            const resetButton = document.getElementById('reset-vanilla-pair');
            
            if (isEditing) {
                const icon = saveButton.querySelector('i');
                icon.className = 'fas fa-save';
                saveButton.querySelector('.btn-text').textContent = 'Update';
                saveButton.classList.add('update-state');
                saveButton.style.backgroundColor = '#6B3410';  // Orange
                resetButton.disabled = false;
            } else {
                const icon = saveButton.querySelector('i');
                icon.className = 'fas fa-edit';
                saveButton.querySelector('.btn-text').textContent = 'Save';
                saveButton.classList.remove('update-state');
                saveButton.style.backgroundColor = '';
                saveButton.style.removeProperty('--hover-color');
                resetButton.disabled = false;
            }
        },

        resetVanillaPairForm: function() {
            // Reset editing state
            isEditing = false;
            currentPairKey = null;
            this.updateUIForEditing(false);
            
            // Reset all sections using configManager
            configManager.resetSection('entity', 'vanilla-');
            configManager.resetSection('entity', 'vanilla-entity-sound-');
            configManager.resetSection('particles', 'vanilla-particles-onhit-');
            configManager.resetSection('particles', 'vanilla-particles-onbreak-');
            configManager.resetSection('material', 'vanilla-material-');
            configManager.resetSection('entity', 'vanilla-material-sound-');
            configManager.resetSection('particles', 'vanilla-material-particles-onhit-');
            configManager.resetSection('particles', 'vanilla-material-particles-onbreak-');
            
            // Update config modal components with latest options
            if (this.entityConfigModal) {
                this.entityConfigModal.setOptions(configManager.getDropdownOptions('entityNames'));
                this.entityConfigModal.setValue(configManager.defaultValues.entity.name.value);
            }
            
            if (this.materialConfigModal) {
                this.materialConfigModal.setOptions(configManager.getDropdownOptions('materialNames'));
                this.materialConfigModal.setValue(configManager.defaultValues.material.name.value);
            }
            
            // Set all checkbox values from defaultValues
            const checkboxes = [
                { id: 'vanilla-replace-original-explosion', prop: 'replaceOriginalExplosion', section: 'entity' },
                { id: 'vanilla-pack-dropped-items', prop: 'packDroppedItems', section: 'entity' },
                { id: 'vanilla-snap-to-block-grid', prop: 'snapToBlockGrid', section: 'entity' },
                { id: 'vanilla-explosion-damage-blocks-underwater', prop: 'explosionDamageBlocksUnderwater', section: 'entity' },
                { id: 'vanilla-disable-explosion-chaining', prop: 'disableExplosionChaining', section: 'entity' },
                { id: 'vanilla-replace-original-explosion-underwater', prop: 'replaceOriginalExplosionWhenUnderwater', section: 'entity' },
                { id: 'vanilla-explosion-remove-waterlogged-state', prop: 'explosionRemoveWaterloggedStateFromNearbyBlocks', section: 'entity' },
                { id: 'vanilla-explosion-remove-waterlogged-state-surface', prop: 'explosionRemoveWaterloggedStateFromNearbyBlocksOnSurface', section: 'entity' },
                { id: 'vanilla-explosion-remove-waterlogged-state-underwater', prop: 'explosionRemoveWaterloggedStateFromNearbyBlocksUnderwater', section: 'entity' },
                { id: 'vanilla-remove-nearby-waterlogged', prop: 'explosionRemoveNearbyWaterloggedBlocks', section: 'entity' },
                { id: 'vanilla-remove-nearby-waterlogged-surface', prop: 'explosionRemoveNearbyWaterloggedBlocksOnSurface', section: 'entity' },
                { id: 'vanilla-remove-nearby-waterlogged-underwater', prop: 'explosionRemoveNearbyWaterloggedBlocksUnderwater', section: 'entity' },
                { id: 'vanilla-remove-nearby-liquids', prop: 'explosionRemoveNearbyLiquids', section: 'entity' },
                { id: 'vanilla-remove-nearby-liquids-surface', prop: 'explosionRemoveNearbyLiquidsOnSurface', section: 'entity' },
                { id: 'vanilla-remove-nearby-liquids-underwater', prop: 'explosionRemoveNearbyLiquidsUnderwater', section: 'entity' },
                { id: 'vanilla-material-fancy-underwater', prop: 'fancyUnderwater', section: 'material' }
            ];
            
            // Apply checkbox values from defaultValues
            checkboxes.forEach(({id, prop, section}) => {
                const el = document.getElementById(id);
                if (el && configManager.defaultValues[section]?.[prop]?.checked !== undefined) {
                    el.checked = configManager.defaultValues[section][prop].checked;
                }
            });
            
            // Set default values for other inputs
            const defaultInputs = [
                { id: 'vanilla-entity-name', prop: 'name', section: 'entity' },
                { id: 'vanilla-explosion-radius', prop: 'explosionRadius', section: 'entity' },
                { id: 'vanilla-explosion-factor', prop: 'explosionFactor', section: 'entity' },
                { id: 'vanilla-underwater-explosion-factor', prop: 'underwaterExplosionFactor', section: 'entity' },
                { id: 'vanilla-check-tool-item', prop: 'checkToolItem', section: 'entity' },
                { id: 'vanilla-min-travel-distance', prop: 'minTravelDistance', section: 'entity' },
                { id: 'vanilla-entity-sound-name', prop: 'name', section: 'entity.sound' },
                { id: 'vanilla-entity-sound-volume', prop: 'volume', section: 'entity.sound' },
                { id: 'vanilla-entity-sound-pitch', prop: 'pitch', section: 'entity.sound' },
                { id: 'vanilla-material-sound-name', prop: 'name', section: 'material.sound' },
                { id: 'vanilla-material-sound-volume', prop: 'volume', section: 'material.sound' },
                { id: 'vanilla-material-sound-pitch', prop: 'pitch', section: 'material.sound' },
                { id: 'vanilla-material-damage', prop: 'damage', section: 'material' },
                { id: 'vanilla-material-drop-chance', prop: 'dropChance', section: 'material' },
                { id: 'vanilla-material-drop-material', prop: 'dropMaterial', section: 'material' },
                { id: 'vanilla-material-distance-attenuation', prop: 'distanceAttenuation', section: 'material' },
                { id: 'vanilla-material-underwater-damage', prop: 'underwaterDamage', section: 'material' }
            ];
            
            defaultInputs.forEach(({id, prop, section}) => {
                const el = document.getElementById(id);
                if (el) {
                    // Navigate the defaultValues object based on the section path
                    const sectionParts = section.split('.');
                    let value = configManager.defaultValues[sectionParts[0]];
                    
                    for (let i = 1; i < sectionParts.length; i++) {
                        value = value?.[sectionParts[i]];
                    }
                    
                    if (value && value[prop] !== undefined) {
                        el.value = value[prop].value.toString();
                    }
                }
            });
            
            showNotification('Vanilla pair form reset', 'info');
        },

        // Particles helper functions
        getParticlesData: function(type, category, event) {
            const prefix = `${type}-${category === 'entity' ? '' : 'material-'}particles-${event}`;
            const particleName = configManager.getValue(`${prefix}-name`);
            const blockParticles = ['BLOCK', 'BLOCK_CRACK', 'BLOCK_DUST', 'BLOCK_MARKER', 'DUST_PILLAR', 'FALLING_DUST', 'ITEM_COBWEB', 'ITEM_SLIME', 'ITEM_SNOWBALL'];
            const isBlockParticle = blockParticles.includes(particleName);
            const isDustParticle = particleName === 'DUST';
            
            const data = {
                enabled: configManager.getValue(`${prefix}-enabled`),
                name: particleName,
                material: configManager.getValue(`${prefix}-material`),
                force: configManager.getValue(`${prefix}-force`),
                amount: configManager.getValue(`${prefix}-amount`),
                size: configManager.getValue(`${prefix}-size`),
                speed: configManager.getValue(`${prefix}-speed`),
                deltaX: configManager.getValue(`${prefix}-delta-x`),
                deltaY: configManager.getValue(`${prefix}-delta-y`),
                deltaZ: configManager.getValue(`${prefix}-delta-z`),
                red: configManager.getValue(`${prefix}-red`),
                green: configManager.getValue(`${prefix}-green`),
                blue: configManager.getValue(`${prefix}-blue`),
                _disabled: {
                    rgb: isBlockParticle,  // RGB controls are disabled for block particles
                    material: isDustParticle  // Material input is disabled for DUST particles
                }
            };
            
            return data;
        },

        setParticlesData: function(type, category, event, data) {
            const prefix = `${type}-${category === 'entity' ? '' : 'material-'}particles-${event}`;
            
            if (!data) return;
            
            // Save all data, including disabled fields
            configManager.setValue(`${prefix}-enabled`, data.enabled);
            configManager.setValue(`${prefix}-name`, data.name);
            configManager.setValue(`${prefix}-material`, data.material);
            configManager.setValue(`${prefix}-force`, data.force);
            configManager.setValue(`${prefix}-amount`, data.amount);
            configManager.setValue(`${prefix}-size`, data.size);
            configManager.setValue(`${prefix}-speed`, data.speed);
            configManager.setValue(`${prefix}-delta-x`, data.deltaX);
            configManager.setValue(`${prefix}-delta-y`, data.deltaY);
            configManager.setValue(`${prefix}-delta-z`, data.deltaZ);
            configManager.setValue(`${prefix}-red`, data.red);
            configManager.setValue(`${prefix}-green`, data.green);
            configManager.setValue(`${prefix}-blue`, data.blue);
            
            // Apply disabled states based on particle type if not already set
            if (data.name) {
                toggleParticleControls(data.name, prefix);
            }
        },

        // Generate configuration outputs


        updatePairList: function() {
            const savedVanillaPairs = document.getElementById('saved-vanilla-pairs');
            if (!savedVanillaPairs) return;
            
            savedVanillaPairs.innerHTML = '';
            
            Object.entries(dataStore.vanilla.pairs).forEach(([pairKey, pairData]) => {
                const pairItem = document.createElement('div');
                pairItem.className = 'pair-item';
                pairItem.innerHTML = `
                    <div class="pair-info">${pairKey.replace(':', ' : ')}</div>
                    <div class="pair-actions">
                        <button class="pair-button load-vanilla" data-key="${pairKey}">Load</button>
                        <button class="pair-button delete delete-vanilla" data-key="${pairKey}">Delete</button>
                    </div>
                `;
                savedVanillaPairs.appendChild(pairItem);
            });
            
            // Add event listeners for the new buttons
            document.querySelectorAll('.load-vanilla').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const pairKey = e.target.getAttribute('data-key');
                    this.loadVanillaPairByName(pairKey);
                    // Switch to Vanilla tab
                    document.querySelector('[data-tab="vanilla"]').click();
                });
            });
            
            document.querySelectorAll('.delete-vanilla').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const pairKey = e.target.getAttribute('data-key');
                    if (confirm(`Are you sure you want to delete "${pairKey}"?`)) {
                        delete dataStore.vanilla.pairs[pairKey];
                        saveToLocalStorage();
                        this.updatePairList();
                        showNotification('Pair deleted successfully', 'success');
                    }
                });
            });
            
            // Show message if no pairs exist
            if (savedVanillaPairs.children.length === 0) {
                savedVanillaPairs.innerHTML = '<div class="no-pairs">No saved Vanilla pairs yet</div>';
            }
        },

        loadVanillaPairByName: function(pairKey) {
            // Split only on the first colon to handle material names with 'minecraft:' prefix
            const firstColon = pairKey.indexOf(':');
            const entityName = pairKey.substring(0, firstColon);
            const materialName = pairKey.substring(firstColon + 1);
            
            configManager.setValue('vanilla-entity-name', entityName);
            configManager.setValue('vanilla-material-name', materialName);
            
            // Update the input field directly to ensure it shows the correct value
            const materialInput = document.getElementById('vanilla-material-name');
            if (materialInput) {
                materialInput.value = materialName;
            }
            this.loadVanillaPair();
        },

        deleteVanillaPair: function(pairKey) {
            if (confirm(`Are you sure you want to delete "${pairKey}"?`)) {
                delete dataStore.vanilla.pairs[pairKey];
                saveToLocalStorage();
                this.updatePairList();
                showNotification('Pair deleted successfully', 'success');
                return true;
            }
            return false;
        }
    };
})();


// Make VanillaModule globally accessible
window.VanillaModule = VanillaModule;
window.initVanillaModule = () => VanillaModule.init();
window.updateVanillaPairList = () => VanillaModule.updatePairList();
window.loadVanillaPair = () => VanillaModule.loadVanillaPair();