// Group Module
const GroupModule = (function() {
    // Private variables
    let isInitialized = false;
    let particleSelector;
    let materialSelector;
    let isEditing = false;
    let currentPairKey = null;

    // Setup number inputs with increment/decrement buttons
    function setupNumberInputs() {
        // Get config manager instance
        const configManager = window.configManager || new ConfigManager();
        
        // Define all number inputs and their configuration paths
        const numberInputs = [
            // Group entity settings
            { id: 'group-explosion-radius', path: 'entity.explosionRadius' },
            { id: 'group-explosion-factor', path: 'entity.explosionFactor' },
            { id: 'group-underwater-explosion-factor', path: 'entity.underwaterExplosionFactor' },
            { id: 'group-min-travel-distance', path: 'entity.minTravelDistance' },
            { id: 'group-entity-sound-volume', path: 'entity.sound.volume' },
            { id: 'group-entity-sound-pitch', path: 'entity.sound.pitch' },
            
            // Group entity particles on hit
            { id: 'group-particles-onhit-amount', path: 'particles.amount' },
            { id: 'group-particles-onhit-size', path: 'particles.size' },
            { id: 'group-particles-onhit-speed', path: 'particles.speed' },
            { id: 'group-particles-onhit-delta-x', path: 'particles.deltaX' },
            { id: 'group-particles-onhit-delta-y', path: 'particles.deltaY' },
            { id: 'group-particles-onhit-delta-z', path: 'particles.deltaZ' },
            { id: 'group-particles-onhit-red', path: 'particles.red' },
            { id: 'group-particles-onhit-green', path: 'particles.green' },
            { id: 'group-particles-onhit-blue', path: 'particles.blue' },
            
            // Group entity particles on break
            { id: 'group-particles-onbreak-amount', path: 'particles.amount' },
            { id: 'group-particles-onbreak-size', path: 'particles.size' },
            { id: 'group-particles-onbreak-speed', path: 'particles.speed' },
            { id: 'group-particles-onbreak-delta-x', path: 'particles.deltaX' },
            { id: 'group-particles-onbreak-delta-y', path: 'particles.deltaY' },
            { id: 'group-particles-onbreak-delta-z', path: 'particles.deltaZ' },
            { id: 'group-particles-onbreak-red', path: 'particles.red' },
            { id: 'group-particles-onbreak-green', path: 'particles.green' },
            { id: 'group-particles-onbreak-blue', path: 'particles.blue' },
            
            // Group material settings
            { id: 'group-material-damage', path: 'material.damage' },
            { id: 'group-material-drop-chance', path: 'material.dropChance' },
            { id: 'group-material-distance-attenuation', path: 'material.distanceAttenuation' },
            { id: 'group-material-underwater-damage', path: 'material.underwaterDamage' },
            { id: 'group-material-sound-volume', path: 'material.sound.volume' },
            { id: 'group-material-sound-pitch', path: 'material.sound.pitch' },
            
            // Group material particles on hit
            { id: 'group-material-particles-onhit-amount', path: 'particles.amount' },
            { id: 'group-material-particles-onhit-size', path: 'particles.size' },
            { id: 'group-material-particles-onhit-speed', path: 'particles.speed' },
            { id: 'group-material-particles-onhit-delta-x', path: 'particles.deltaX' },
            { id: 'group-material-particles-onhit-delta-y', path: 'particles.deltaY' },
            { id: 'group-material-particles-onhit-delta-z', path: 'particles.deltaZ' },
            { id: 'group-material-particles-onhit-red', path: 'particles.red' },
            { id: 'group-material-particles-onhit-green', path: 'particles.green' },
            { id: 'group-material-particles-onhit-blue', path: 'particles.blue' },
            
            // Group material particles on break
            { id: 'group-material-particles-onbreak-amount', path: 'particles.amount' },
            { id: 'group-material-particles-onbreak-size', path: 'particles.size' },
            { id: 'group-material-particles-onbreak-speed', path: 'particles.speed' },
            { id: 'group-material-particles-onbreak-delta-x', path: 'particles.deltaX' },
            { id: 'group-material-particles-onbreak-delta-y', path: 'particles.deltaY' },
            { id: 'group-material-particles-onbreak-delta-z', path: 'particles.deltaZ' },
            { id: 'group-material-particles-onbreak-red', path: 'particles.red' },
            { id: 'group-material-particles-onbreak-green', path: 'particles.green' },
            { id: 'group-material-particles-onbreak-blue', path: 'particles.blue' }
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
            const box = input?.closest('.number-box');
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
            
            if (!input || !finalBox || !finalIncrementBtn || !finalDecrementBtn) return;
            
            // Set initial value if empty
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
            
            const row = input.closest('.group-form-row');
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
            materialInput.style.opacity = '1';
            materialInput.style.backgroundColor = isDustParticle ? '#1a1a1a' : '';
            materialInput.style.color = isDustParticle ? '#1a1a1a' : '';
            materialInput.style.cursor = isDustParticle ? 'not-allowed' : 'text';
            
            materialInput.title = isDustParticle ? 'Material: Only for BLOCK particle type' : '';
        }
        
        // Toggle size control
        toggleNumberInput(`${prefix}size`);
    }

    // Public methods
    return {
        setupParticleSelectors: function() {
            // Initialize selectors if they don't exist
            if (!particleSelector) {
                particleSelector = new ItemSelectorModal({
                    title: 'Select Particle',
                    options: configManager.dropdownOptions.particleNames || [],
                    allowCustom: true
                });
            }

            if (!materialSelector) {
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
                    categories: configManager.dropdownOptions.materialNames
                });
            }

            // Setup particle and material inputs
            const setupInputs = (ids, selector, title, options, transformValue = (v) => v, prefixMap = {}) => {
                ids.forEach(id => {
                    const input = document.getElementById(id);
                    if (input) {
                        // Get the prefix for this input (used for toggling controls)
                        const prefix = prefixMap[id] || id.replace('-name', '-');
                        
                        // Initial setup
                        toggleParticleControls(input.value, prefix);
                        
                        input.addEventListener('focus', (e) => {
                            e.preventDefault();
                            if (selector) {
                                selector.open({
                                    title: title,
                                    options: options,
                                    onSelect: (value, isCustom) => {
                                        input.value = transformValue(value, isCustom);
                                        // Toggle controls based on selection
                                        toggleParticleControls(value, prefix);
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
            };

            // Setup particle inputs with prefix mapping for controls
            setupInputs(
                [
                    'group-particles-onhit-name',
                    'group-particles-onbreak-name',
                    'group-material-particles-onhit-name',
                    'group-material-particles-onbreak-name'
                ],
                particleSelector,
                'Select Particle',
                configManager.dropdownOptions.particleNames,
                undefined, // No transform needed for particle names
                {
                    'group-particles-onhit-name': 'group-particles-onhit-',
                    'group-particles-onbreak-name': 'group-particles-onbreak-',
                    'group-material-particles-onhit-name': 'group-material-particles-onhit-',
                    'group-material-particles-onbreak-name': 'group-material-particles-onbreak-'
                }
            );

            // Setup material inputs
            setupInputs(
                [
                    'group-particles-onhit-material',
                    'group-particles-onbreak-material',
                    'group-material-particles-onhit-material',
                    'group-material-particles-onbreak-material'
                ],
                materialSelector,
                'Select Material',
                Object.values(configManager.dropdownOptions.materialNames || {}).flat(),
                (value, isCustom) => isCustom || value.startsWith('minecraft:') ? value : `minecraft:${value}`
            );

            // Setup sound inputs
            setupInputs(
                [
                    'group-entity-sound-name',
                    'group-material-sound-name'
                ],
                new ItemSelectorModal({
                    title: 'Select Sound',
                    options: configManager.dropdownOptions.soundNames || [],
                    allowCustom: true
                }),
                'Select Sound',
                configManager.dropdownOptions.soundNames || []
            );
        },

        init: function() {
            if (isInitialized) return;
            
            this.createGroupTabContent();
            this.setupGroupEventListeners();
            this.updatePairList();
            this.initGroupListEditors();
            this.setupParticleSelectors();
            
            // Setup number inputs
            setupNumberInputs();
            
            // Reset form to ensure all fields are properly initialized
            this.resetGroupPairForm();
            
            isInitialized = true;
        },

        createGroupTabContent: function() {
            const groupTab = document.getElementById('group');
            groupTab.innerHTML = `
                <div class="main-layout">
                    <div class="content-panel">
                        <div class="group-container">
                            <!-- Left Panel - Entity -->
                            <div class="group-panel">
                        
                        <!-- Main Entity Settings Group -->
                        <div class="group-group" data-group="entity-main">
                            <div class="group-group-title"><strong>Group Entity Settings</strong></div>
                            <div class="group-group-list" id="group-entity-settings-list">
                                <div class="entity-material-row">
                                    <label class="group-label">Entity Group Name</label>
                                    <input type="text" id="group-entity-name" class="group-input">
                                </div>
                                <div class="group-settings-grid highlighted-row" style="grid-template-columns: repeat(2, 1fr);">
                                    <!-- Left Column -->
                                    <div style="display: flex; flex-direction: column; gap: 8px;">
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Explosion Radius
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="The explosion radius of the entity. If set to 0, uses the original radius. This overrides the default radius for all calculations.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">The explosion radius of the entity. If set to 0, uses the original radius. This overrides the default radius for all calculations.</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="number-box">
                                                <input type="text" id="group-explosion-radius" class="number-input" value="0">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Explosion Factor
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Multiplies the explosion radius. For example, 2.0 doubles the radius, 0.5 halves it. Set to 1.0 to use the original radius.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Multiplies the explosion radius. For example, 2.0 doubles the radius, 0.5 halves it. Set to 1.0 to use the original radius.</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="number-box">
                                                <input type="text" id="group-explosion-factor" class="number-input" value="1.0">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Underwater Factor
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Adjusts explosion radius when underwater. Set to 1.0 for normal behavior, less than 1.0 to reduce underwater effect, or more than 1.0 to enhance it.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Adjusts explosion radius when underwater. Set to 1.0 for normal behavior, less than 1.0 to reduce underwater effect, or more than 1.0 to enhance it.</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="number-box">
                                                <input type="text" id="group-underwater-explosion-factor" class="number-input" value="1.0">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Tool Item
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="The item that must be in the player's hand to enable underwater damage. Set to an empty string to disable this check.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">The item that must be in the player's hand to enable underwater damage. Set to an empty string to disable this check.</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <input type="text" id="group-check-tool-item" class="group-input" placeholder="e.g., minecraft:diamond_pickaxe">
                                        </div>
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Min Travel Dist
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Minimum distance TNT must travel after being primed to enable underwater damage. Prevents TNT cannons from breaking when ExplosionDamageBlocksUnderwater is true. Set to 0 to disable this check.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Minimum distance TNT must travel after being primed to enable underwater damage. Prevents TNT cannons from breaking when ExplosionDamageBlocksUnderwater is true. Set to 0 to disable this check.</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="number-box">
                                                <input type="text" id="group-min-travel-distance" class="number-input" value="0">
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
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-replace-original-explosion" class="group-input">
                                                <label for="group-replace-original-explosion" class="setting-hint tooltip-trigger" data-tooltip="Replaces the original explosion with the configured one. When disabled, runs both explosions.">
                                                    <span class="setting-label-text">
                                                        Replace Original
                                                        <span class="tooltip-text">When enabled, completely replaces the original explosion with the configured one. When disabled, runs both explosions.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-pack-dropped-items" class="group-input">
                                                <label for="group-pack-dropped-items" class="setting-hint tooltip-trigger" data-tooltip="Packs similar dropped items into stacks to reduce entity count.">
                                                    <span class="setting-label-text">
                                                        Pack Drops
                                                        <span class="tooltip-text">When enabled, packs similar dropped items into stacks to reduce entity count and improve performance.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-snap-to-block-grid" class="group-input">
                                                <label for="group-snap-to-block-grid" class="setting-hint tooltip-trigger" data-tooltip="Snaps dropped items to the center of blocks for a cleaner look.">
                                                    <span class="setting-label-text">
                                                        Snap To Grid
                                                        <span class="tooltip-text">When enabled, dropped items will snap to the center of blocks for a more organized appearance.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-explosion-damage-blocks-underwater" class="group-input">
                                                <label for="group-explosion-damage-blocks-underwater" class="setting-hint tooltip-trigger" data-tooltip="Allows explosions to damage blocks underwater when holding the specified tool.">
                                                    <span class="setting-label-text">
                                                        Underwater Damage
                                                        <span class="tooltip-text">When enabled, allows explosions to damage blocks underwater when holding the specified tool and meeting minimum travel distance.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-disable-explosion-chaining" class="group-input">
                                                <label for="group-disable-explosion-chaining" class="setting-hint tooltip-trigger" data-tooltip="Prevents explosions from triggering other explosions in a chain reaction.">
                                                    <span class="setting-label-text">
                                                        No Chain Reaction
                                                        <span class="tooltip-text">When enabled, prevents explosions from triggering other explosions, stopping chain reactions that could cause excessive damage.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-replace-original-explosion-underwater" class="group-input">
                                                <label for="group-replace-original-explosion-underwater" class="setting-hint tooltip-trigger" data-tooltip="Replaces the original underwater explosion with the configured one.">
                                                    <span class="setting-label-text">
                                                        Replace Underwater
                                                        <span class="tooltip-text">When enabled, replaces the original underwater explosion with the configured one. When disabled, runs both explosions.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-explosion-remove-waterlogged-state" class="group-input">
                                                <label for="group-explosion-remove-waterlogged-state" class="setting-hint tooltip-trigger" data-tooltip="Removes waterlogged state from blocks broken by explosions.">
                                                    <span class="setting-label-text">
                                                        Remove Waterlogged State
                                                        <span class="tooltip-text">When enabled, removes waterlogged state from blocks broken by explosions, preventing water source blocks from being left behind.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-explosion-remove-waterlogged-state-surface" class="group-input">
                                                <label for="group-explosion-remove-waterlogged-state-surface" class="setting-hint tooltip-trigger" data-tooltip="Removes waterlogged state from surface water blocks broken by explosions.">
                                                    <span class="setting-label-text">
                                                        Remove Waterlogged (Surface)
                                                        <span class="tooltip-text">When enabled, removes waterlogged state from surface water blocks broken by explosions.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-explosion-remove-waterlogged-state-underwater" class="group-input">
                                                <label for="group-explosion-remove-waterlogged-state-underwater" class="setting-hint tooltip-trigger" data-tooltip="Removes waterlogged state from underwater blocks broken by explosions.">
                                                    <span class="setting-label-text">
                                                        Remove Waterlogged (Underwater)
                                                        <span class="tooltip-text">When enabled, removes waterlogged state from underwater blocks broken by explosions.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-remove-nearby-waterlogged" class="group-input">
                                                <label for="group-remove-nearby-waterlogged" class="setting-hint tooltip-trigger" data-tooltip="Removes waterlogged state from blocks near the explosion.">
                                                    <span class="setting-label-text">
                                                        Remove Nearby Waterlogged
                                                        <span class="tooltip-text">When enabled, removes waterlogged state from blocks near the explosion, not just the ones directly broken.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-remove-nearby-waterlogged-surface" class="group-input">
                                                <label for="group-remove-nearby-waterlogged-surface" class="setting-hint tooltip-trigger" data-tooltip="Removes waterlogged state from surface water blocks near the explosion.">
                                                    <span class="setting-label-text">
                                                        Remove Waterlogged (Surface)
                                                        <span class="tooltip-text">When enabled, removes waterlogged state from surface water blocks near the explosion.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-remove-nearby-waterlogged-underwater" class="group-input">
                                                <label for="group-remove-nearby-waterlogged-underwater" class="setting-hint tooltip-trigger" data-tooltip="Removes waterlogged state from underwater blocks near the explosion.">
                                                    <span class="setting-label-text">
                                                        Remove Waterlogged (Underwater)
                                                        <span class="tooltip-text">When enabled, removes waterlogged state from underwater blocks near the explosion.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-remove-nearby-liquids" class="group-input">
                                                <label for="group-remove-nearby-liquids" class="setting-hint tooltip-trigger" data-tooltip="Removes liquid blocks (water, lava) near the explosion.">
                                                    <span class="setting-label-text">
                                                        Remove Nearby Liquids
                                                        <span class="tooltip-text">When enabled, removes liquid blocks (water, lava) near the explosion, preventing liquid flow from affecting the explosion area.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox">
                                                <input type="checkbox" id="group-remove-nearby-liquids-surface" class="group-input">
                                                <label for="group-remove-nearby-liquids-surface" class="setting-hint tooltip-trigger" data-tooltip="Removes surface liquid blocks (water, lava) near the explosion.">
                                                    <span class="setting-label-text">
                                                        Remove Liquids (Surface)
                                                        <span class="tooltip-text">When enabled, removes surface liquid blocks (water, lava) near the explosion.</span>
                                                    </span>
                                                </label>
                                            </div>
                                            <div class="group-checkbox-item fancy-checkbox" style="margin-bottom: 4px;">
                                                <input type="checkbox" id="group-remove-nearby-liquids-underwater" class="group-input">
                                                <label for="group-remove-nearby-liquids-underwater" class="setting-hint tooltip-trigger" data-tooltip="Removes underwater liquid blocks (water, lava) near the explosion.">
                                                    <span class="setting-label-text">
                                                        Remove Liquids (Underwater)
                                                        <span class="tooltip-text">When enabled, removes underwater liquid blocks (water, lava) near the explosion.</span>
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Entity Sound & Particle Effects (Nested under Entity Settings) -->
                                <div class="group-subgroup" style="margin-top: 0; padding-top: 20px; border-top: none;">
                                    <div class="group-group-title" style="margin: -20px 0 16px -16px; font-size: 1.1em; padding-left: 16px;"><strong>Sound & Particle Effects</strong></div>
                                    <div class="group-form-row highlighted-row" style="grid-column: 1 / -1">
                                        <label class="group-label">Sound Name</label>
                                        <input type="text" id="group-entity-sound-name" class="group-input" placeholder="minecraft:entity.generic.explode">
                                    </div>
                                    <div class="group-settings-grid highlighted-row" style="grid-template-columns: 1fr 0.8fr;">
                                        <div class="group-form-row">
                                            <label class="group-label">Volume</label>
                                            <div class="number-box" style="width: 100px;">
                                                <input type="text" id="group-entity-sound-volume" class="number-input" value="1.0">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="group-form-row" style="gap: 8px;">
                                            <label class="group-label" style="min-width: auto;">Pitch</label>
                                            <div class="number-box" style="width: 100px;">
                                                <input type="text" id="group-entity-sound-pitch" class="number-input" value="1.0">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Entity Particles (Nested under Sound Settings) -->
                                    <div class="group-subgroup" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light);">
                                        <div class="group-tabs-container">
                                            <div class="group-tabs-header">
                                                <button class="group-tab-button active" data-tab="group-entity-onhit">On Hit</button>
                                                <button class="group-tab-button" data-tab="group-entity-onbreak">On Break</button>
                                            </div>
                                            <div class="group-tab-content">
                                                <!-- On Hit Tab -->
                                                <div class="group-tab-panel active" id="group-entity-onhit">
                                                    <div class="group-form-grid highlighted-row">
                                                        <div class="group-form-row" style="display: flex; align-items: center;">
                                                            <label class="toggle-label">
                                                                <span class="toggle-switch">
                                                                    <input type="checkbox" id="group-particles-onhit-enabled" class="group-input">
                                                                    <span class="toggle-slider"></span>
                                                                </span>
                                                                    Enabled
                                                            </label>
                                                        </div>
                                                        <div class="group-checkbox-item" style="margin: 0;">
                                                            <input type="checkbox" id="group-particles-onhit-force" class="group-input">
                                                            <label for="group-particles-onhit-force">Force</label>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label"><span class="label-icon">🎯</span> Name</label>
                                                            <input type="text" id="group-particles-onhit-name" class="group-input" placeholder="Click to select particle..." readonly>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label"><span class="label-icon">🧱</span> Material</label>
                                                            <input type="text" id="group-particles-onhit-material" class="group-input" placeholder="Enter material name...">
                                                        </div>
                                                    </div>
                                                    <div class="group-particles-grid highlighted-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                                        <div class="group-form-row">
                                                            <label class="group-label">Amount</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onhit-amount" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Size</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onhit-size" class="number-input" value="1.0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Speed</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onhit-speed" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta X</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onhit-delta-x" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta Y</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onhit-delta-y" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta Z</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onhit-delta-z" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Red</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onhit-red" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Green</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onhit-green" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Blue</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onhit-blue" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <!-- On Break Tab -->
                                                <div class="group-tab-panel" id="group-entity-onbreak">
                                                    <div class="group-form-grid highlighted-row">
                                                        <div class="group-form-row" style="display: flex; align-items: center;">
                                                            <label class="toggle-label">
                                                                <span class="toggle-switch">
                                                                    <input type="checkbox" id="group-particles-onbreak-enabled" class="group-input">
                                                                    <span class="toggle-slider"></span>
                                                                </span>
                                                                Enabled
                                                            </label>
                                                        </div>
                                                        <div class="group-checkbox-item" style="margin: 0;">
                                                            <input type="checkbox" id="group-particles-onbreak-force" class="group-input">
                                                            <label for="group-particles-onbreak-force">Force</label>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label"><span class="label-icon">🎯</span> Name</label>
                                                            <input type="text" id="group-particles-onbreak-name" class="group-input" placeholder="Click to select particle..." readonly>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label"><span class="label-icon">🧱</span> Material</label>
                                                            <input type="text" id="group-particles-onbreak-material" class="group-input" placeholder="Enter material name...">
                                                        </div>
                                                    </div>
                                                    <div class="group-particles-grid highlighted-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                                        <div class="group-form-row">
                                                            <label class="group-label">Amount</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onbreak-amount" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Size</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onbreak-size" class="number-input" value="1.0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Speed</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onbreak-speed" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta X</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onbreak-delta-x" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta Y</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onbreak-delta-y" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta Z</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onbreak-delta-z" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Red</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onbreak-red" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Green</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onbreak-green" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Blue</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-particles-onbreak-blue" class="number-input" value="255">
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
                    <div class="group-panel">
                        <!-- Main Material Settings Group -->
                        <div class="group-group" data-group="material-main">
                            <div class="group-group-title"><strong>Material Settings</strong></div>
                            <div class="group-group-list" id="group-material-settings-list">
                                <div class="entity-material-row">
                                    <label class="group-label">Material Name</label>
                                    <input type="text" id="group-material-name" class="group-input" autocomplete="off">
                                </div>
                                <div class="group-settings-grid highlighted-row" style="grid-template-columns: repeat(2, 1fr);">
                                    <!-- Left Column -->
                                    <div style="display: flex; flex-direction: column; gap: 8px;">
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Damage
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Base damage used to compute the effective damage taken by a block.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Base damage used to compute the effective damage taken by a block. The effective damage is calculated according to the formula:<br><br>effectiveDamage = baseDamage * underwaterDamageFactor * (1 - distanceFactor * distanceAttenuationFactor)<br><br>where distanceFactor = distance / explosionRadius<br><br>[Minimum]: 0.0<br>[Default] is the same value as BlockDurability (which means enough damage to break the block in one explosion)<br>Values greater than BlockDurability are allowed.</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="number-box">
                                                <input type="text" id="group-material-damage" class="number-input" value="0">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Drop Chance
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Chance of blocks naturally breaking and dropping items.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Indicates the chance of naturally breaking the block (and thus having a drop). The value is a percentage, so:<br><br>- 0.0 means blocks will never break naturally<br>- 100.0 means blocks will always break naturally<br><br>[Minimum] [Default] is 0.0 (blocks never break naturally)<br>[Maximum] is 100.0 (blocks always break naturally)</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="number-box">
                                                <input type="text" id="group-material-drop-chance" class="number-input" value="0">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Drop Material
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Overrides the material dropped when block is broken.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Overrides the material that will be dropped when the block is broken. It can be a Material, but note that not all materials are available for drops (liquids like WATER, for instance, can't be dropped).<br><br>[Default] is the same material as in the name of the section.</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <input type="text" id="group-material-drop-material" class="group-input" placeholder="e.g., minecraft:cobblestone">
                                        </div>
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Distance Attenuation
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Controls how damage decreases with distance.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Indicates how effective damage decreases with distance. The value is a percentage:<br><br>- 0.0 means all blocks in range take the same damage<br>- 1.0 means damage decreases linearly with distance<br><br>[Minimum] [Default] is 0.0 (uniform damage)<br>[Maximum] is 1.0 (linear falloff)<br><br>This affects the distanceFactor in the damage calculation.</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="number-box">
                                                <input type="text" id="group-material-distance-attenuation" class="number-input" value="0" min="0" max="1" step="0.1">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="group-form-row">
                                            <div class="group-label">
                                                <span class="setting-label-text">
                                                    Underwater Damage
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Damage multiplier for underwater explosions.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Damage multiplicative factor applied when explosion takes place underwater. The value is a percentage:<br><br>- 0.0 means no damage will be taken underwater<br>- 1.0 means water doesn't affect damage<br><br>[Minimum] is 0.0 (no underwater damage)<br>[Default] is 0.5 (halves damage underwater)<br>Values > 1.0 magnify damage underwater</span>
                                                    </span>
                                                </span>
                                            </div>
                                            <div class="number-box">
                                                <input type="text" id="group-material-underwater-damage" class="number-input" value="0.5" min="0" step="0.1">
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
                                        <div class="group-checkbox-item" style="margin: 0;">
                                            <input type="checkbox" id="group-material-fancy-underwater" class="group-input">
                                            <label for="group-material-fancy-underwater" class="setting-hint tooltip-trigger" data-tooltip="Controls how underwater detection works.">
                                                <span class="tooltip-text">Specifies when UnderwaterDamageFactor is applied:<br><br><strong>False [default]</strong>: Look for water in the explosion center (faster)<br><strong>True</strong>: Trace a ray from explosion center to each block and look for water (more accurate but slower)<br><br>When false, all blocks are considered underwater if the explosion center is underwater. When true, checks each block individually.</span>
                                                Fancy Underwater Detection
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Spacer -->
                                <div style="height: 84px;"></div>

                                <!-- Material Sound & Particle Effects (Nested under Material Settings) -->
                                <div class="group-subgroup" style="margin-top: 0; padding-top: 20px; border-top: none;">
                                    <div class="group-group-title" style="margin: -20px 0 16px -16px; font-size: 1.1em; padding-left: 16px;"><strong>Sound & Particle Effects</strong></div>
                                    <div class="group-form-row highlighted-row" style="grid-column: 1 / -1">
                                        <label class="group-label">Sound Name</label>
                                        <input type="text" id="group-material-sound-name" class="group-input" placeholder="minecraft:block.stone.break">
                                    </div>
                                    <div class="group-settings-grid highlighted-row" style="grid-template-columns: 1fr 0.8fr;">
                                        <div class="group-form-row">
                                            <label class="group-label">Volume</label>
                                            <div class="number-box" style="width: 100px;">
                                                <input type="text" id="group-material-sound-volume" class="number-input" value="1.0">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="group-form-row" style="gap: 8px;">
                                            <label class="group-label" style="min-width: auto;">Pitch</label>
                                            <div class="number-box" style="width: 100px;">
                                                <input type="text" id="group-material-sound-pitch" class="number-input" value="1.0">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Material Particles (Nested under Sound Settings) -->
                                    <div class="group-subgroup" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light);">
                                        <div class="group-tabs-container">
                                            <div class="group-tabs-header">
                                                <button class="group-tab-button active" data-tab="group-material-onhit">On Hit</button>
                                                <button class="group-tab-button" data-tab="group-material-onbreak">On Break</button>
                                            </div>
                                            <div class="group-tab-content">
                                                <!-- On Hit Tab -->
                                                <div class="group-tab-panel active" id="group-material-onhit">
                                                    <div class="group-form-grid highlighted-row">
                                                        <div class="group-form-row" style="display: flex; align-items: center;">
                                                            <label class="toggle-label">
                                                                <span class="toggle-switch">
                                                                    <input type="checkbox" id="group-material-particles-onhit-enabled" class="group-input">
                                                                    <span class="toggle-slider"></span>
                                                                </span>
                                                                Enabled
                                                            </label>
                                                        </div>
                                                        <div class="group-checkbox-item" style="margin: 0;">
                                                            <input type="checkbox" id="group-material-particles-onhit-force" class="group-input">
                                                            <label for="group-material-particles-onhit-force">Force</label>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label"><span class="label-icon">🎯</span> Name</label>
                                                            <input type="text" id="group-material-particles-onhit-name" class="group-input" placeholder="Click to select particle..." readonly>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label"><span class="label-icon">🧱</span> Material</label>
                                                            <input type="text" id="group-material-particles-onhit-material" class="group-input" placeholder="Enter material name...">
                                                        </div>
                                                    </div>
                                                    <div class="group-particles-grid highlighted-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                                        <div class="group-form-row">
                                                            <label class="group-label">Amount</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onhit-amount" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Size</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onhit-size" class="number-input" value="1.0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Speed</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onhit-speed" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta X</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onhit-delta-x" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta Y</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onhit-delta-y" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta Z</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onhit-delta-z" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Red</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onhit-red" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Green</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onhit-green" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Blue</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onhit-blue" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <!-- On Break Tab -->
                                                <div class="group-tab-panel" id="group-material-onbreak">
                                                    <div class="group-form-grid highlighted-row">
                                                        <div class="group-form-row" style="display: flex; align-items: center;">
                                                            <label class="toggle-label">
                                                                <span class="toggle-switch">
                                                                    <input type="checkbox" id="group-material-particles-onbreak-enabled" class="group-input">
                                                                    <span class="toggle-slider"></span>
                                                                </span>
                                                                Enabled
                                                            </label>
                                                        </div>
                                                        <div class="group-checkbox-item" style="margin: 0;">
                                                            <input type="checkbox" id="group-material-particles-onbreak-force" class="group-input">
                                                            <label for="group-material-particles-onbreak-force">Force</label>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label"><span class="label-icon">🎯</span> Name</label>
                                                            <input type="text" id="group-material-particles-onbreak-name" class="group-input" placeholder="Click to select particle..." readonly>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label"><span class="label-icon">🧱</span> Material</label>
                                                            <input type="text" id="group-material-particles-onbreak-material" class="group-input" placeholder="Enter material name...">
                                                        </div>
                                                    </div>
                                                    <div class="group-particles-grid highlighted-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                                                        <div class="group-form-row">
                                                            <label class="group-label">Amount</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onbreak-amount" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Size</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onbreak-size" class="number-input" value="1.0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Speed</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onbreak-speed" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta X</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onbreak-delta-x" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta Y</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onbreak-delta-y" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Delta Z</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onbreak-delta-z" class="number-input" value="0">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Red</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onbreak-red" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Green</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onbreak-green" class="number-input" value="255">
                                                                <div class="buttons">
                                                                    <div class="button increment">▲</div>
                                                                    <div class="button decrement">▼</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="group-form-row">
                                                            <label class="group-label">Blue</label>
                                                            <div class="number-box">
                                                                <input type="text" id="group-material-particles-onbreak-blue" class="number-input" value="255">
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
                
                <!-- Group Members Section -->
                <div class="group-members-section">
                    <div class="section-header">
                        <h3>Group Members</h3>
                        <div class="section-actions">
                            <button class="btn btn-sm btn-icon" id="bulk-import" title="Bulk Import">
                                <i class="icon">📥</i> Import
                            </button>
                        </div>
                    </div>
                    
                    <div class="group-members-container">
                        <!-- Entity Group -->
                        <div class="group-members-panel">
                            <div class="panel-header">
                                <h4>Entities <span class="badge" id="entity-count">0</span></h4>
                                <div class="search-box">
                                    <input type="text" id="entity-search" placeholder="Filter entities..." class="search-input">
                                    <span class="search-icon">🔍</span>
                                </div>
                            </div>
                            <div class="group-list-editor" id="entity-group-list">
                                <div class="empty-state">
                                    <p>No entities added yet</p>
                                    <small>Click below to add entities</small>
                                </div>
                            </div>
                            <div class="add-item-row">
                                <input type="text" id="new-entity" class="add-item-input" placeholder="Click to select entities" readonly>
                                <button class="btn btn-sm btn-icon" id="add-entity" title="Add Entity">
                                    <i class="icon">+</i> Add
                                </button>
                            </div>
                        </div>
                        
                        <!-- Material Group -->
                        <div class="group-members-panel">
                            <div class="panel-header">
                                <h4>Materials <span class="badge" id="material-count">0</span></h4>
                                <div class="search-box">
                                    <input type="text" id="material-search" placeholder="Filter materials..." class="search-input">
                                    <span class="search-icon">🔍</span>
                                </div>
                            </div>
                            <div class="group-list-editor" id="material-group-list">
                                <div class="empty-state">
                                    <p>No materials added yet</p>
                                    <small>Click below to add materials</small>
                                </div>
                                    </div>
                                    <div class="add-item-row">
                                <input type="text" id="new-material" class="add-item-input" placeholder="Click to select materials" readonly>
                                <button class="btn btn-sm btn-icon" id="add-material" title="Add Material">
                                    <i class="icon">+</i> Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Vertical floating action buttons on the left side -->
                <div class="config-actions">
                    <button id="save-group-pair" class="btn primary" title="Save the current group configuration">
                        <i class="fas fa-save"></i>
                        <span class="btn-text">Save Group</span>
                    </button>
                    <button id="reset-group-pair" class="btn warning" title="Reset the form to default values">
                        <i class="fas fa-undo"></i>
                        <span class="btn-text">Reset</span>
                    </button>
                </div>
                
            `;

            // Apply particle defaults
            this.applyParticleDefaults();
            
            // Set up group tabs
            setupGroupTabs();
        },

        applyParticleDefaults: function() {
            // Group entity particles
            configManager.resetSection('particles', 'group-particles-onhit-');
            configManager.resetSection('particles', 'group-particles-onbreak-');
            
            // Group material particles
            configManager.resetSection('particles', 'group-material-particles-onhit-');
            configManager.resetSection('particles', 'group-material-particles-onbreak-');
        },

        setupGroupEventListeners: function() {
            // Helper function to safely add event listener
            const addListener = (id, callback) => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('click', callback);
                } else {
                    console.warn(`Element with ID '${id}' not found`);
                }
            };

            // Group pair actions
            addListener('save-group-pair', () => this.saveGroupPair());
            addListener('reset-group-pair', () => this.resetGroupPairForm());
            
        },

        // Initialize group list editors
        initGroupListEditors: function() {
            // Add initial empty member inputs
            this.addGroupMember('entity');
            this.addGroupMember('material');
        },
        
        // Add group member input
        addGroupMember: function(type) {
            const listId = type === 'entity' ? 'entity-group-list' : 'material-group-list';
            const list = document.getElementById(listId);
            
            const item = document.createElement('div');
            item.className = 'group-list-item';
            item.innerHTML = `
                <input type="text" placeholder="e.g., ${type === 'entity' ? 'CREEPER' : 'STONE'}" class="group-member-input">
                <div class="group-list-actions">
                    <button class="btn danger btn-sm remove-group-member">Remove</button>
                </div>
            `;
            
            list.appendChild(item);
            
            // Add event listener to remove button
            item.querySelector('.remove-group-member').addEventListener('click', function() {
                list.removeChild(item);
            });
        },
        
        // Get group members from UI
        getGroupMembers: function(type) {
            const listId = type === 'entity' ? 'entity-group-list' : 'material-group-list';
            const list = document.getElementById(listId);
            const inputs = list.querySelectorAll('.group-member-input');
            const members = [];
            
            inputs.forEach(input => {
                if (input.value.trim()) {
                    members.push(input.value.trim());
                }
            });
            
            return members;
        },
        
        // Set group members in UI
        setGroupMembers: function(type, members) {
            const listId = type === 'entity' ? 'entity-group-list' : 'material-group-list';
            const list = document.getElementById(listId);
            
            // Clear existing members
            list.innerHTML = '';
            
            // Add members
            members.forEach(member => {
                const item = document.createElement('div');
                item.className = 'group-list-item';
                item.innerHTML = `
                    <input type="text" value="${member}" class="group-member-input">
                    <div class="group-list-actions">
                        <button class="btn danger btn-sm remove-group-member">Remove</button>
                    </div>
                `;
                
                list.appendChild(item);
                
                // Add event listener to remove button
                item.querySelector('.remove-group-member').addEventListener('click', function() {
                    list.removeChild(item);
                });
            });
            
            // Add at least one empty input if no members
            if (members.length === 0) {
                this.addGroupMember(type);
            }
        },

        // Save/Load functions for Group Pair
        // Helper function to ensure _Group suffix is added for backend use
        ensureGroupSuffix: function(name) {
            if (!name) return '';
            return name.endsWith('_Group') ? name : `${name}_Group`;
        },
        
        // Helper function to remove _Group suffix for display
        removeGroupSuffix: function(name) {
            if (!name) return '';
            return name.endsWith('_Group') ? name.slice(0, -6) : name;
        },
        
        saveGroupPair: function() {
            // Get raw names from UI (without _Group suffix)
            let entityName = document.getElementById('group-entity-name').value.trim();
            let materialName = document.getElementById('group-material-name').value.trim();
            
            if (!entityName || !materialName) {
                showNotification('Both entity and material group names are required', 'error');
                return;
            }
            
            // Store raw names in config (without _Group suffix)
            configManager.setValue('group-entity-name', entityName);
            configManager.setValue('group-material-name', materialName);
            
            // Add _Group suffix for backend storage
            const entityNameWithSuffix = this.ensureGroupSuffix(entityName);
            const materialNameWithSuffix = this.ensureGroupSuffix(materialName);
            
            const pairKey = `${entityNameWithSuffix}:${materialNameWithSuffix}`;
            
            // If we're in editing mode and the key has changed, remove the old pair
            if (isEditing && currentPairKey && currentPairKey !== pairKey) {
                delete dataStore.group.pairs[currentPairKey];
                showNotification(`Updated pair from ${this.removeGroupSuffix(currentPairKey.split(':')[0])}:${this.removeGroupSuffix(currentPairKey.split(':')[1])} to ${entityName}:${materialName}`, 'info');
            }
            
            // Entity data
            const entityData = {
                name: entityName,
                explosionRadius: configManager.getValue('group-explosion-radius'),
                explosionFactor: configManager.getValue('group-explosion-factor'),
                underwaterExplosionFactor: configManager.getValue('group-underwater-explosion-factor'),
                replaceOriginalExplosion: configManager.getValue('group-replace-original-explosion'),
                snapToBlockGrid: configManager.getValue('group-snap-to-block-grid'),
                disableExplosionChaining: configManager.getValue('group-disable-explosion-chaining'),
                packDroppedItems: configManager.getValue('group-pack-dropped-items'),
                checkToolItem: configManager.getValue('group-check-tool-item'),
                explosionDamageBlocksUnderwater: configManager.getValue('group-explosion-damage-blocks-underwater'),
                replaceOriginalExplosionWhenUnderwater: configManager.getValue('group-replace-original-explosion-underwater'),
                minTravelDistance: configManager.getValue('group-min-travel-distance'),
                explosionRemoveWaterloggedStateFromNearbyBlocks: configManager.getValue('group-explosion-remove-waterlogged-state'),
                explosionRemoveWaterloggedStateFromNearbyBlocksOnSurface: configManager.getValue('group-explosion-remove-waterlogged-state-surface'),
                explosionRemoveWaterloggedStateFromNearbyBlocksUnderwater: configManager.getValue('group-explosion-remove-waterlogged-state-underwater'),
                explosionRemoveNearbyWaterloggedBlocks: configManager.getValue('group-remove-nearby-waterlogged'),
                explosionRemoveNearbyWaterloggedBlocksOnSurface: configManager.getValue('group-remove-nearby-waterlogged-surface'),
                explosionRemoveNearbyWaterloggedBlocksUnderwater: configManager.getValue('group-remove-nearby-waterlogged-underwater'),
                explosionRemoveNearbyLiquids: configManager.getValue('group-remove-nearby-liquids'),
                explosionRemoveNearbyLiquidsOnSurface: configManager.getValue('group-remove-nearby-liquids-surface'),
                explosionRemoveNearbyLiquidsUnderwater: configManager.getValue('group-remove-nearby-liquids-underwater'),
                sound: {
                    name: configManager.getValue('group-entity-sound-name'),
                    volume: configManager.getValue('group-entity-sound-volume'),
                    pitch: configManager.getValue('group-entity-sound-pitch')
                },
                particlesOnHit: this.getParticlesData('group', 'entity', 'onhit'),
                particlesOnBreak: this.getParticlesData('group', 'entity', 'onbreak')
            };
            
            // Material data
            const materialData = {
                name: materialName,
                damage: configManager.getValue('group-material-damage'),
                dropChance: configManager.getValue('group-material-drop-chance'),
                dropMaterial: configManager.getValue('group-material-drop-material'),
                distanceAttenuation: configManager.getValue('group-material-distance-attenuation'),
                underwaterDamage: configManager.getValue('group-material-underwater-damage'),
                fancyUnderwater: configManager.getValue('group-material-fancy-underwater'),
                sound: {
                    name: configManager.getValue('group-material-sound-name'),
                    volume: configManager.getValue('group-material-sound-volume'),
                    pitch: configManager.getValue('group-material-sound-pitch')
                },
                particlesOnHit: this.getParticlesData('group', 'material', 'onhit'),
                particlesOnBreak: this.getParticlesData('group', 'material', 'onbreak')
            };
            
            // Get group members from GroupMembersManager if available, otherwise fall back to old method
            let entityMembers, materialMembers;
            
            if (window.groupMembersManager) {
                entityMembers = [...window.groupMembersManager.entityItems];
                materialMembers = [...window.groupMembersManager.materialItems];
            } else {
                entityMembers = this.getGroupMembers('entity');
                materialMembers = this.getGroupMembers('material');
            }
            
            dataStore.group.pairs[pairKey] = {
                entity: entityData,
                material: materialData,
                entityMembers: entityMembers,
                materialMembers: materialMembers
            };
            
            // Update editing state
            isEditing = true;
            currentPairKey = pairKey;
            this.updateUIForEditing(true);
            
            saveToLocalStorage();
            this.updatePairList();
            showNotification(`Group pair "${entityName}:${materialName}" saved successfully`, 'success');
        },

        loadGroupPair: function() {
            // Get raw names from UI (without _Group suffix)
            let entityName = document.getElementById('group-entity-name').value.trim();
            let materialName = document.getElementById('group-material-name').value.trim();
            
            if (!entityName || !materialName) {
                showNotification('Both entity and material group names are required', 'error');
                return;
            }
            
            // Add _Group suffix for lookup
            const entityNameWithSuffix = this.ensureGroupSuffix(entityName);
            const materialNameWithSuffix = this.ensureGroupSuffix(materialName);
            const pairKey = `${entityNameWithSuffix}:${materialNameWithSuffix}`;
            
            // Set editing state
            isEditing = true;
            currentPairKey = pairKey;
            this.updateUIForEditing(true);
            
            if (!dataStore.group.pairs[pairKey]) {
                showNotification('Group pair not found', 'error');
                return;
            }
            
            const pairData = dataStore.group.pairs[pairKey];
            const entityData = pairData.entity;
            const materialData = pairData.material;
            
            // Load entity data
            configManager.setValue('group-entity-name', entityData.name);
            configManager.setValue('group-explosion-radius', entityData.explosionRadius);
            configManager.setValue('group-explosion-factor', entityData.explosionFactor);
            configManager.setValue('group-underwater-explosion-factor', entityData.underwaterExplosionFactor);
            configManager.setValue('group-replace-original-explosion', entityData.replaceOriginalExplosion);
            configManager.setValue('group-snap-to-block-grid', entityData.snapToBlockGrid);
            configManager.setValue('group-disable-explosion-chaining', entityData.disableExplosionChaining);
            configManager.setValue('group-pack-dropped-items', entityData.packDroppedItems);
            configManager.setValue('group-check-tool-item', entityData.checkToolItem);
            configManager.setValue('group-explosion-damage-blocks-underwater', entityData.explosionDamageBlocksUnderwater);
            configManager.setValue('group-replace-original-explosion-underwater', entityData.replaceOriginalExplosionWhenUnderwater);
            configManager.setValue('group-min-travel-distance', entityData.minTravelDistance);
            configManager.setValue('group-explosion-remove-waterlogged-state', entityData.explosionRemoveWaterloggedStateFromNearbyBlocks);
            configManager.setValue('group-explosion-remove-waterlogged-state-surface', entityData.explosionRemoveWaterloggedStateFromNearbyBlocksOnSurface);
            configManager.setValue('group-explosion-remove-waterlogged-state-underwater', entityData.explosionRemoveWaterloggedStateFromNearbyBlocksUnderwater);
            configManager.setValue('group-remove-nearby-waterlogged', entityData.explosionRemoveNearbyWaterloggedBlocks);
            configManager.setValue('group-remove-nearby-waterlogged-surface', entityData.explosionRemoveNearbyWaterloggedBlocksOnSurface);
            configManager.setValue('group-remove-nearby-waterlogged-underwater', entityData.explosionRemoveNearbyWaterloggedBlocksUnderwater);
            configManager.setValue('group-remove-nearby-liquids', entityData.explosionRemoveNearbyLiquids);
            configManager.setValue('group-remove-nearby-liquids-surface', entityData.explosionRemoveNearbyLiquidsOnSurface);
            configManager.setValue('group-remove-nearby-liquids-underwater', entityData.explosionRemoveNearbyLiquidsUnderwater);
            
            // Load entity sound
            configManager.setValue('group-entity-sound-name', entityData.sound?.name);
            configManager.setValue('group-entity-sound-volume', entityData.sound?.volume);
            configManager.setValue('group-entity-sound-pitch', entityData.sound?.pitch);
            
            // Load entity particles
            this.setParticlesData('group', 'entity', 'onhit', entityData.particlesOnHit);
            this.setParticlesData('group', 'entity', 'onbreak', entityData.particlesOnBreak);
            
            // Load material data
            configManager.setValue('group-material-name', materialData.name);
            configManager.setValue('group-material-damage', materialData.damage);
            configManager.setValue('group-material-drop-chance', materialData.dropChance);
            configManager.setValue('group-material-drop-material', materialData.dropMaterial);
            configManager.setValue('group-material-distance-attenuation', materialData.distanceAttenuation);
            configManager.setValue('group-material-underwater-damage', materialData.underwaterDamage);
            configManager.setValue('group-material-fancy-underwater', materialData.fancyUnderwater);
            
            // Load material sound
            configManager.setValue('group-material-sound-name', materialData.sound?.name);
            configManager.setValue('group-material-sound-volume', materialData.sound?.volume);
            configManager.setValue('group-material-sound-pitch', materialData.sound?.pitch);
            
            // Load material particles
            this.setParticlesData('group', 'material', 'onhit', materialData.particlesOnHit);
            this.setParticlesData('group', 'material', 'onbreak', materialData.particlesOnBreak);
            
            // Load group members using GroupMembersManager
            if (window.groupMembersManager) {
                // Save the members to localStorage and then load them
                localStorage.setItem('groupEntityItems', JSON.stringify(pairData.entityMembers || []));
                localStorage.setItem('groupMaterialItems', JSON.stringify(pairData.materialMembers || []));
                window.groupMembersManager.loadFromStorage();
            } else {
                // Fallback to old method if GroupMembersManager is not available
                this.setGroupMembers('entity', pairData.entityMembers || []);
                this.setGroupMembers('material', pairData.materialMembers || []);
            }
            
            showNotification(`Group pair "${entityName}:${materialName}" loaded successfully`, 'success');
        },

        updateUIForEditing: function(isEditing) {
            const saveButton = document.getElementById('save-group-pair');
            const resetButton = document.getElementById('reset-group-pair');
            
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

        resetGroupPairForm: function() {
            // Reset editing state
            isEditing = false;
            currentPairKey = null;
            this.updateUIForEditing(false);
            
            // Reset all sections using configManager
            configManager.resetSection('entity', 'group-');
            configManager.resetSection('entity', 'group-entity-sound-');
            configManager.resetSection('particles', 'group-particles-onhit-');
            configManager.resetSection('particles', 'group-particles-onbreak-');
            configManager.resetSection('material', 'group-material-');
            configManager.resetSection('entity', 'group-material-sound-');
            configManager.resetSection('particles', 'group-material-particles-onhit-');
            configManager.resetSection('particles', 'group-material-particles-onbreak-');
            
            // Reset group members in both UI and storage
            if (window.groupMembersManager) {
                window.groupMembersManager.entityItems = [];
                window.groupMembersManager.materialItems = [];
                window.groupMembersManager.saveToStorage();
                window.groupMembersManager.updateEntityList();
                window.groupMembersManager.updateMaterialList();
                window.groupMembersManager.updateCounts();
            }
            
            // Set all checkbox values from defaultValues
            const checkboxes = [
                { id: 'group-replace-original-explosion', prop: 'replaceOriginalExplosion', section: 'entity' },
                { id: 'group-pack-dropped-items', prop: 'packDroppedItems', section: 'entity' },
                { id: 'group-snap-to-block-grid', prop: 'snapToBlockGrid', section: 'entity' },
                { id: 'group-explosion-damage-blocks-underwater', prop: 'explosionDamageBlocksUnderwater', section: 'entity' },
                { id: 'group-disable-explosion-chaining', prop: 'disableExplosionChaining', section: 'entity' },
                { id: 'group-replace-original-explosion-underwater', prop: 'replaceOriginalExplosionWhenUnderwater', section: 'entity' },
                { id: 'group-explosion-remove-waterlogged-state', prop: 'explosionRemoveWaterloggedStateFromNearbyBlocks', section: 'entity' },
                { id: 'group-explosion-remove-waterlogged-state-surface', prop: 'explosionRemoveWaterloggedStateFromNearbyBlocksOnSurface', section: 'entity' },
                { id: 'group-explosion-remove-waterlogged-state-underwater', prop: 'explosionRemoveWaterloggedStateFromNearbyBlocksUnderwater', section: 'entity' },
                { id: 'group-remove-nearby-waterlogged', prop: 'explosionRemoveNearbyWaterloggedBlocks', section: 'entity' },
                { id: 'group-remove-nearby-waterlogged-surface', prop: 'explosionRemoveNearbyWaterloggedBlocksOnSurface', section: 'entity' },
                { id: 'group-remove-nearby-waterlogged-underwater', prop: 'explosionRemoveNearbyWaterloggedBlocksUnderwater', section: 'entity' },
                { id: 'group-remove-nearby-liquids', prop: 'explosionRemoveNearbyLiquids', section: 'entity' },
                { id: 'group-remove-nearby-liquids-surface', prop: 'explosionRemoveNearbyLiquidsOnSurface', section: 'entity' },
                { id: 'group-remove-nearby-liquids-underwater', prop: 'explosionRemoveNearbyLiquidsUnderwater', section: 'entity' },
                { id: 'group-material-fancy-underwater', prop: 'fancyUnderwater', section: 'material' }
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
                { id: 'group-entity-name', prop: 'name', section: 'entity' },
                { id: 'group-explosion-radius', prop: 'explosionRadius', section: 'entity' },
                { id: 'group-explosion-factor', prop: 'explosionFactor', section: 'entity' },
                { id: 'group-underwater-explosion-factor', prop: 'underwaterExplosionFactor', section: 'entity' },
                { id: 'group-check-tool-item', prop: 'checkToolItem', section: 'entity' },
                { id: 'group-min-travel-distance', prop: 'minTravelDistance', section: 'entity' },
                { id: 'group-entity-sound-name', prop: 'name', section: 'entity.sound' },
                { id: 'group-entity-sound-volume', prop: 'volume', section: 'entity.sound' },
                { id: 'group-entity-sound-pitch', prop: 'pitch', section: 'entity.sound' },
                { id: 'group-material-damage', prop: 'damage', section: 'material' },
                { id: 'group-material-drop-chance', prop: 'dropChance', section: 'material' },
                { id: 'group-material-drop-material', prop: 'dropMaterial', section: 'material' },
                { id: 'group-material-distance-attenuation', prop: 'distanceAttenuation', section: 'material' },
                { id: 'group-material-underwater-damage', prop: 'underwaterDamage', section: 'material' },
                { id: 'group-material-sound-name', prop: 'name', section: 'material.sound' },
                { id: 'group-material-sound-volume', prop: 'volume', section: 'material.sound' },
                { id: 'group-material-sound-pitch', prop: 'pitch', section: 'material.sound' }
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
            
            showNotification('Group pair form reset', 'info');
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

        updatePairList: function() {
            const savedGroupPairs = document.getElementById('saved-group-pairs');
            if (!savedGroupPairs) return;
            
            savedGroupPairs.innerHTML = '';
            
            Object.entries(dataStore.group.pairs).forEach(([pairKey, pairData]) => {
                const entityName = pairData.entity?.name || pairKey.split(':')[0];
                const materialName = pairData.material?.name || pairKey.split(':').slice(1).join(':');
                const displayEntityName = entityName.endsWith('_Group') ? entityName.slice(0, -6) : entityName;
                const displayMaterialName = materialName.endsWith('_Group') ? materialName.slice(0, -6) : materialName;
                
                const pairItem = document.createElement('div');
                pairItem.className = 'pair-item';
                pairItem.innerHTML = `
                    <div class="pair-info">${displayEntityName} : ${displayMaterialName}</div>
                    <div class="pair-actions">
                        <button class="pair-button load-group" data-key="${pairKey}">Load</button>
                        <button class="pair-button delete delete-group" data-key="${pairKey}">Delete</button>
                    </div>
                `;
                savedGroupPairs.appendChild(pairItem);
            });
            
            // Add event listeners for the new buttons
            document.querySelectorAll('.load-group').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const pairKey = e.target.getAttribute('data-key');
                    this.loadGroupPairByName(pairKey);
                    // Switch to Group tab
                    document.querySelector('[data-tab="group"]').click();
                });
            });
            
            document.querySelectorAll('.delete-group').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const pairKey = e.target.getAttribute('data-key');
                    if (confirm(`Are you sure you want to delete "${pairKey}"?`)) {
                        delete dataStore.group.pairs[pairKey];
                        saveToLocalStorage();
                        this.updatePairList();
                        showNotification('Group pair deleted successfully', 'success');
                    }
                });
            });
            
            // Show message if no pairs exist
            if (savedGroupPairs.children.length === 0) {
                savedGroupPairs.innerHTML = '<div class="no-pairs">No saved Group pairs yet</div>';
            }
        },

        loadGroupPairByName: function(pairKey) {
            const pairData = dataStore.group.pairs[pairKey];
            if (!pairData) return;
            
            // Get names from the pair data or fallback to splitting the key
            const entityName = pairData.entity?.name || pairKey.split(':')[0];
            const materialName = pairData.material?.name || pairKey.split(':').slice(1).join(':');
            
            // Remove _Group suffix for display
            const displayEntityName = entityName.endsWith('_Group') ? entityName.slice(0, -6) : entityName;
            const displayMaterialName = materialName.endsWith('_Group') ? materialName.slice(0, -6) : materialName;
            
            configManager.setValue('group-entity-name', displayEntityName);
            configManager.setValue('group-material-name', displayMaterialName);
            this.loadGroupPair();
        },

        deleteGroupPair: function(pairKey) {
            if (confirm(`Are you sure you want to delete "${pairKey}"?`)) {
                delete dataStore.group.pairs[pairKey];
                saveToLocalStorage();
                this.updatePairList();
                showNotification('Group pair deleted successfully', 'success');
                return true;
            }
            return false;
        }
    };
})();

// Group Members Management
class GroupMembersManager {
    constructor() {
        this.entityItems = [];
        this.materialItems = [];
        this.setupEventListeners();
        this.initializeLists();
        this.initConfigModal();
    }
    
    loadFromStorage() {
        this.entityItems = JSON.parse(localStorage.getItem('groupEntityItems') || '[]');
        this.materialItems = JSON.parse(localStorage.getItem('groupMaterialItems') || '[]');
        this.updateEntityList();
        this.updateMaterialList();
        this.updateCounts();
    }
    
    initConfigModal() {
        // Initialize entity input with ItemSelectorModal
        const entityInput = document.getElementById('new-entity');
        if (entityInput) {
            entityInput.addEventListener('focus', (e) => {
                e.preventDefault();
                const currentItems = [...this.entityItems];
                
                // Get entity options and ensure we have a proper object structure
                const entityOptions = configManager.getDropdownOptions('entityNames') || {};
                
                // Flatten all entity options values to check for custom items
                const allEntityValues = Object.values(entityOptions).flat();
                const customItems = currentItems.filter(item => !allEntityValues.includes(item));
                
                // Create a new options object with Custom first if it exists
                const allOptions = {};
                if (customItems.length > 0) {
                    allOptions['Custom'] = customItems;
                }
                
                // Add all other categories
                Object.entries(entityOptions).forEach(([key, value]) => {
                    allOptions[key] = value;
                });
                
                const selector = new ItemSelectorModal({
                    title: 'Select Entities',
                    options: allOptions,
                    allowCustom: true,
                    multiSelect: true,
                    selectedItems: currentItems, // Pre-select existing entities
                    onSelect: (selectedItems) => {
                        // Clear existing items and only add back the selected ones
                        this.entityItems = [];
                        
                        // Add all selected items
                        selectedItems.forEach(item => {
                            // Only add if not already in the list (to prevent duplicates)
                            if (!this.entityItems.includes(item)) {
                                this.entityItems.push(item);
                            }
                        });
                        
                        // Handle custom value from search box if it exists
                        const searchInput = document.querySelector(`#${selector.modalId} .item-search-input`);
                        const customValue = searchInput ? searchInput.value.trim() : '';
                        
                        // Add custom value if it exists, not empty, and not already in the list (case-insensitive check)
                        if (customValue) {
                            const normalizedCustom = customValue.toLowerCase();
                            const exists = this.entityItems.some(item => item.toLowerCase() === normalizedCustom);
                            
                            if (!exists) {
                                this.entityItems.push(customValue);
                                console.log(`Custom item added: ${customValue}`);
                            } else {
                                console.log(`Custom item "${customValue}" already exists`);
                            }
                        }
                        
                        // Update the UI and save to storage
                        this.updateEntityList();
                        this.saveToStorage();
                        
                        // Show feedback
                        console.log(`${this.entityItems.length} item(s) in list`);
                    }
                });
                selector.open();
            });
        }

        // Initialize material input with multi-select
        const materialInput = document.getElementById('new-material');
        if (materialInput) {
            materialInput.addEventListener('focus', (e) => {
                e.preventDefault();
                
                const materials = configManager.dropdownOptions.materialNames || {};
                const currentItems = this.materialItems.map(item => 
                    item.startsWith('minecraft:') ? item.substring(10) : item
                );
                
                // Create a new materials object with Custom first if it exists
                const allMaterialValues = Object.values(materials).flat();
                
                // For materials, we'll accept custom values as-is without adding 'minecraft:' prefix
                const customMaterials = currentItems.filter(item => 
                    !allMaterialValues.some(v => v === item)
                );
                
                const allMaterials = {};
                if (customMaterials.length > 0) {
                    allMaterials['Custom'] = customMaterials;
                }
                
                // Add all other material categories
                Object.entries(materials).forEach(([key, value]) => {
                    allMaterials[key] = value;
                });
                
                const selector = new ItemSelectorModal({
                    title: 'Select Materials',
                    options: allMaterials,
                    allowCustom: true,
                    multiSelect: true,
                    selectedItems: [...currentItems],
                    onSelect: (selectedItems) => {
                        // Clear existing items and only add back the selected ones
                        this.materialItems = [];
                        
                        // Add all selected items with proper prefix
                        selectedItems.forEach(item => {
                            // Add 'minecraft:' prefix if it's a vanilla material and doesn't have a namespace
                            const prefixedItem = !item.includes(':') && !item.startsWith('minecraft:') 
                                ? `minecraft:${item}` 
                                : item;
                                
                            // Only add if not already in the list (to prevent duplicates)
                            if (!this.materialItems.includes(prefixedItem)) {
                                this.materialItems.push(prefixedItem);
                            }
                        });
                        
                        // Handle custom value from search box if it exists
                        const searchInput = document.querySelector(`#${selector.modalId} .item-search-input`);
                        const customValue = searchInput ? searchInput.value.trim() : '';
                        
                        // Add custom value if it exists, not empty, and not already in the list (case-insensitive check)
                        if (customValue) {
                            const normalizedCustom = customValue.toLowerCase();
                            const exists = this.materialItems.some(item => 
                                item.toLowerCase() === normalizedCustom || 
                                (item.startsWith('minecraft:') && item.substring(10).toLowerCase() === normalizedCustom)
                            );
                            
                            if (!exists) {
                                this.materialItems.push(customValue);
                                console.log(`Custom material added: ${customValue}`);
                            } else {
                                console.log(`Custom material "${customValue}" already exists`);
                            }
                        }
                        
                        // Update the UI and save to storage
                        this.updateMaterialList();
                        this.saveToStorage();
                        
                        // Show feedback
                        const addedCount = selectedItems.length - currentItems.length + (customValue ? 1 : 0);
                        if (addedCount > 0) {
                            console.log(`${addedCount} material(s) added`);
                        } else if (addedCount < 0) {
                            console.log(`${Math.abs(addedCount)} material(s) removed`);
                        }
                    }
                });
                selector.open();
            });
        }
    }
    
    saveToStorage() {
        localStorage.setItem('groupEntityItems', JSON.stringify(this.entityItems));
        localStorage.setItem('groupMaterialItems', JSON.stringify(this.materialItems));
    }

    setupEventListeners() {
        // Use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Add entity button
            if (e.target.closest('#add-entity')) {
                this.addEntity();
                return;
            }
            // Add material button
            if (e.target.closest('#add-material')) {
                this.addMaterial();
                return;
            }
            // Bulk import
            if (e.target.closest('#bulk-import')) {
                this.showBulkImportModal();
                return;
            }
            
            // Handle list item actions
            const item = e.target.closest('.group-list-item');
            if (!item) return;
            
            const container = item.closest('.group-list-editor');
            if (!container) return;
            
            const items = Array.from(container.children);
            const index = items.indexOf(item);
            if (index === -1) return;
            
            const type = container.id.includes('entity') ? 'entity' : 'material';
            
            // Remove item
            if (e.target.closest('.remove-item')) {
                this.removeItem(type, index);
                return;
            }
            
            // Edit item
            if (e.target.closest('.edit-item')) {
                this.editItem(e, type, index);
                return;
            }
            
            // Save edit
            if (e.target.closest('.save-edit')) {
                const input = item.querySelector('.edit-input');
                if (!input) return;
                
                const newValue = input.value.trim();
                
                if (newValue) {
                    if (type === 'entity') {
                        this.entityItems[index] = newValue;
                        this.updateEntityList();
                    } else {
                        this.materialItems[index] = newValue;
                        this.updateMaterialList();
                    }
                } else {
                    this.updateList(type, type === 'entity' ? this.entityItems : this.materialItems);
                }
            }
            // Cancel edit
            else if (e.target.closest('.cancel-edit')) {
                const item = e.target.closest('.group-list-item');
                const container = item?.closest('.group-list-editor');
                if (!container) return;
                
                const type = container.id.includes('entity') ? 'entity' : 'material';
                this.updateList(type, type === 'entity' ? this.entityItems : this.materialItems);
            }
        });

        // Input event for entity search
        const entitySearch = document.getElementById('entity-search');
        if (entitySearch) {
            entitySearch.addEventListener('input', (e) => this.filterItems('entity', e.target.value));
        }

        // Input event for material search
        const materialSearch = document.getElementById('material-search');
        if (materialSearch) {
            materialSearch.addEventListener('input', (e) => this.filterItems('material', e.target.value));
        }

        // Keypress events for input fields
        const newEntityInput = document.getElementById('new-entity');
        if (newEntityInput) {
            newEntityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addEntity();
            });
        }

        const newMaterialInput = document.getElementById('new-material');
        if (newMaterialInput) {
            newMaterialInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addMaterial();
            });
        }
    }

    addEntity() {
        const input = document.getElementById('new-entity');
        const name = input.value.trim().toUpperCase(); // Convert to uppercase for consistency
        
        if (name && !this.entityItems.includes(name)) {
            this.entityItems.push(name);
            this.updateEntityList();
            
            const entityOptions = configManager.dropdownOptions.entityNames || {};
            let optionsUpdated = false;
            
            if (entityOptions && typeof entityOptions === 'object' && !Array.isArray(entityOptions)) {
                const exists = Object.values(entityOptions).some(category => 
                    Array.isArray(category) && category.includes(name)
                );
                
                if (!exists) {
                    if (!entityOptions['Custom']) {
                        entityOptions['Custom'] = [];
                    }
                    entityOptions['Custom'].push(name);
                    optionsUpdated = true;
                }
            } else if (Array.isArray(entityOptions)) {
                if (!entityOptions.includes(name)) {
                    entityOptions.push(name);
                    optionsUpdated = true;
                }
            }
            
            if (this.entityConfigModal && optionsUpdated) {
                this.entityConfigModal.setOptions(entityOptions);
            }
            
            input.value = '';
            this.updateCounts();
            this.saveToStorage();
        }
    }

    addMaterial() {
        const input = document.getElementById('new-material');
        const name = input.value.trim(); // Preserve the original case
        
        if (name && !this.materialItems.includes(name)) {
            // Add to material items
            this.materialItems.push(name);
            this.updateMaterialList();
            
            // Get current material options (categorized)
            const materialOptions = configManager.dropdownOptions.materialNames || {};
            let optionsUpdated = false;
            
            // Check if options are categorized
            if (materialOptions && typeof materialOptions === 'object' && !Array.isArray(materialOptions)) {
                // Check if name exists in any category
                const exists = Object.values(materialOptions).some(category => 
                    Array.isArray(category) && category.includes(name)
                );
                
                if (!exists) {
                    // Add to 'Custom' category
                    if (!materialOptions['Custom']) {
                        materialOptions['Custom'] = [];
                    }
                    materialOptions['Custom'].push(name);
                    optionsUpdated = true;
                }
            } else if (Array.isArray(materialOptions)) {
                // Handle legacy flat array format
                if (!materialOptions.includes(name)) {
                    materialOptions.push(name);
                    optionsUpdated = true;
                }
            }
            
            // Also update particle materials if needed
            const particleOptions = configManager.dropdownOptions.materialNames || {};
            let particleUpdated = false;
            
            // Check if the material exists in any particle category
            let existsInParticles = false;
            for (const category in particleOptions) {
                if (Array.isArray(particleOptions[category]) && 
                    particleOptions[category].includes(name.replace('minecraft:', ''))) {
                    existsInParticles = true;
                    break;
                }
            }
            
            if (!existsInParticles) {
                // Add to 'Custom' category in particle materials
                if (!particleOptions['Custom']) {
                    particleOptions['Custom'] = [];
                }
                particleOptions['Custom'].push(name.replace('minecraft:', ''));
                particleUpdated = true;
            }
            
            // Update the modal if it exists
            if (this.materialConfigModal && (optionsUpdated || particleUpdated)) {
                this.materialConfigModal.setOptions(materialOptions);
                // If we have a way to update material names in the modal, we should do it here
                if (this.materialConfigModal.updateMaterialNames) {
                    this.materialConfigModal.updateMaterialNames(particleOptions);
                }
            }
            
            input.value = '';
            this.updateCounts();
            this.saveToStorage();
        }
    }

    removeItem(type, index) {
        if (type === 'entity') {
            this.entityItems.splice(index, 1);
            this.updateEntityList();
        } else {
            this.materialItems.splice(index, 1);
            this.updateMaterialList();
        }
        this.updateCounts();
        this.saveToStorage();
    }

    filterItems(type, query) {
        const items = type === 'entity' ? this.entityItems : this.materialItems;
        const filteredItems = items.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        );
        
        this.updateList(type, query ? filteredItems : items);
    }

    updateEntityList() {
        this.updateList('entity', this.entityItems);
    }

    updateMaterialList() {
        this.updateList('material', this.materialItems);
    }

    updateList(type, items) {
        const container = type === 'entity' 
            ? document.getElementById('entity-group-list')
            : document.getElementById('material-group-list');
            
        if (!container) return;

        // Save scroll position
        const scrollTop = container.scrollTop;
        
        // Store the current items for reference
        const currentType = type === 'entity' ? 'entityItems' : 'materialItems';
        this[currentType] = items;
        
        // Update the list
        container.innerHTML = items.map((item, index) => `
            <div class="group-list-item">
                <span class="item-name" title="${item}">${item}</span>
                <div class="group-list-actions">
                    <button class="edit-item" title="Edit">✏️</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.edit-item').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editItem(e, type, index);
            });
        });
        
        // Restore scroll position
        container.scrollTop = scrollTop;
        
        // Save to storage
        this.saveToStorage();
    }

    editItem(e, type, index) {
        const item = type === 'entity' ? this.entityItems[index] : this.materialItems[index];
        const itemElement = e.target.closest('.group-list-item');
        
        // Store original content
        const originalContent = itemElement.innerHTML;
        
        // Add editing class
        itemElement.classList.add('editing');
        
        // Create edit interface
        itemElement.innerHTML = `
            <div class="edit-container">
                <input type="text" class="edit-input" value="${item}" placeholder="Enter ${type} name">
                <div class="edit-actions">
                    <button class="save-edit" title="Save">💾</button>
                    <button class="cancel-edit" title="Cancel">❌</button>
                </div>
            </div>
        `;

        const input = itemElement.querySelector('.edit-input');
        input.select();
        input.focus();
        
        // Save function
        const saveEdit = () => {
            const newValue = input.value.trim();
            if (newValue && newValue !== item) {
                if (type === 'entity') {
                    this.entityItems[index] = newValue;
                    this.updateEntityList();
                } else {
                    this.materialItems[index] = newValue;
                    this.updateMaterialList();
                }
            } else {
                // Revert to original state if no changes or empty
                itemElement.classList.remove('editing');
                this.updateList(type, type === 'entity' ? this.entityItems : this.materialItems);
            }
        };
        
        // Cancel function
        const cancelEdit = () => {
            itemElement.classList.remove('editing');
            this.updateList(type, type === 'entity' ? this.entityItems : this.materialItems);
        };

        // Keyboard events
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
        });

        // Button events
        itemElement.querySelector('.save-edit').addEventListener('click', saveEdit);
        itemElement.querySelector('.cancel-edit').addEventListener('click', cancelEdit);
        
        // Click outside to cancel
        const handleClickOutside = (event) => {
            if (!itemElement.contains(event.target)) {
                cancelEdit();
                document.removeEventListener('click', handleClickOutside);
            }
        };
        
        // Add click outside listener
        setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    }

    updateItemsOrder(type) {
        const container = document.getElementById(`${type}-group-list`);
        const newOrder = Array.from(container.querySelectorAll('.group-list-item'))
            .map(item => item.querySelector('.item-name').textContent);
        
        if (type === 'entity') {
            this.entityItems = newOrder;
        } else {
            this.materialItems = newOrder;
        }
        this.saveToStorage();
    }
    
    initializeLists() {
        // Update both lists with stored data
        this.updateEntityList();
        this.updateMaterialList();
        this.updateCounts();
    }

    updateCounts() {
        const entityCount = document.getElementById('entity-count');
        const materialCount = document.getElementById('material-count');
        
        if (entityCount) entityCount.textContent = this.entityItems.length;
        if (materialCount) materialCount.textContent = this.materialItems.length;
    }

    showBulkImportModal() {
        // Implementation for bulk import modal
        alert('Bulk import functionality will be implemented here');
    }

}

// Initialize group module and group members manager
function initGroupModule() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initializeAfterDOM());
    } else {
        initializeAfterDOM();
    }
    
    function initializeAfterDOM() {
        if (window.GroupModule) {
            GroupModule.init();
            if (window.loadGroupPair) window.loadGroupPair();
            
            // Initialize group members manager after a short delay to ensure DOM is ready
            setTimeout(() => {
                if (!window.groupMembersManager) {
                    window.groupMembersManager = new GroupMembersManager();
                    window.groupMembersManager.updateCounts();
                }
            }, 100);
        }
    }
}

// Initialize on window load as a fallback
window.addEventListener('load', () => {
    if (!window.groupMembersManager && window.GroupModule) {
        window.groupMembersManager = new GroupMembersManager();
        window.groupMembersManager.updateCounts();
    }
});

// Make GroupModule globally accessible
window.GroupModule = GroupModule;
window.initGroupModule = () => GroupModule.init();
window.updateGroupPairList = () => GroupModule.updatePairList();
window.loadGroupPair = () => GroupModule.loadGroupPair();