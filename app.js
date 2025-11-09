// Centralized Configuration System

// Notification Manager
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 3;
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add to container at the top
        if (this.notifications.length >= this.maxNotifications) {
            this.removeNotification(this.notifications[0]);
        }

        this.container.insertBefore(notification, this.container.firstChild);
        
        // Trigger reflow to enable animation
        void notification.offsetWidth;
        
        // Show notification
        notification.classList.add('show');

        // Store notification data
        const notificationData = {
            element: notification,
            timer: null,
            remove: () => this.removeNotification(notificationData)
        };

        // Set auto-remove timer
        if (duration > 0) {
            notificationData.timer = setTimeout(notificationData.remove, duration);
        }

        // Add click to dismiss
        notification.addEventListener('click', notificationData.remove);
        
        this.notifications.push(notificationData);
        return notificationData;
    }

    removeNotification(notificationData) {
        if (!notificationData) return;
        
        // Clear the auto-remove timer
        if (notificationData.timer) {
            clearTimeout(notificationData.timer);
        }
        
        // Find and remove from array
        const index = this.notifications.indexOf(notificationData);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
        
        // Animate out and remove from DOM
        if (notificationData.element) {
            notificationData.element.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (notificationData.element && notificationData.element.parentNode) {
                    notificationData.element.remove();
                }
            }, 300);
        }
    }
}

// Create global notification manager instance
const notificationManager = new NotificationManager();

// ConfigManager is now available globally from Config&Properties.js

// Data storage - make it globally available
window.dataStore = {
    vanilla: {
        pairs: {} // Store as pairs: { "entityName:materialName": { entity: {}, material: {} } }
    },
    group: {
        pairs: {} // Store as pairs: { "entityGroupName:materialGroupName": { entity: {}, material: {}, entityMembers: [], materialMembers: [] } }
    }
};

// Global notification function
window.showNotification = function(message, type = 'info') {
    notificationManager.show(message, type, 3000);
};

// Fire and smoke effect with synchronized timing
function createParticles() {
    const fireColors = ['#ff6b35', '#ffbe0b', '#ff3a20', '#ff8c5a', '#ff9e0b'];
    const smokeColors = ['rgba(100, 100, 100, 0.2)', 'rgba(120, 120, 120, 0.25)', 'rgba(150, 150, 150, 0.2)'];
    const container = document.querySelector('.explosion-bg');
    
    if (!container) return;
    
    // Create a cycle of fire and smoke
    function createCycle() {
        // First create fire
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                createFireParticle(container, 8, 20, fireColors, 'left');
                createFireParticle(container, 8, 20, fireColors, 'right');
            }, i * 100); // Stagger creation
        }
        
        // Then create smoke after a delay
        setTimeout(() => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    createSmokeParticle(container, 15, 40, smokeColors, 'left');
                    createSmokeParticle(container, 15, 40, smokeColors, 'right');
                }, i * 150);
            }
        }, 1000); // Start smoke 1 second after fire
        
        // Repeat the cycle
        setTimeout(createCycle, 3000); // Total cycle time: 3 seconds
    }
    
    // Start the first cycle
    createCycle();
}

function createFireParticle(container, minSize, maxSize, colors, side) {
    const particle = document.createElement('div');
    particle.className = 'fire-particle';

    const size = Math.random() * (maxSize - minSize) + minSize;
    const baseX = side === 'left' ? 5 : 95;
    const posX = baseX + (side === 'left' ? Math.random() * 5 : Math.random() * 5 - 5);
    const posY = 5; // near bottom

    const duration = 1 + Math.random() * 1.5;
    const delay = Math.random() * 1;
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Random horizontal sway and upward movement
    const driftX = (Math.random() - 0.5) * 40;
    const riseY = 150 + Math.random() * 80;

    Object.assign(particle.style, {
        position: 'absolute',
        left: `${posX}%`,
        bottom: `${posY}%`,
        width: `${size * 0.7}px`,
        height: `${size * 3}px`,
        background: `radial-gradient(ellipse at bottom, ${color} 0%, transparent 70%)`,
        opacity: '0.8',
        filter: 'blur(2px)',
        transformOrigin: 'bottom center',
        animation: `
            rise ${duration}s ${delay}s ease-out forwards,
            flicker-bright ${0.2 + Math.random() * 0.3}s infinite alternate
        `,
        '--tx': `${driftX}px`,
        '--ty': `${riseY}px`,
        zIndex: '2',
        mixBlendMode: 'screen'
    });

    container.appendChild(particle);

    // Remove after animation ends
    setTimeout(() => particle.remove(), (duration + delay) * 1000);
}

function createSmokeParticle(container, minSize, maxSize, colors, side) {
    const particle = document.createElement('div');
    particle.className = 'smoke-particle';
    
    const size = Math.random() * (maxSize - minSize) + minSize;
    const startX = side === 'left' 
        ? 5 + Math.random() * 5  // Left side - 5% to 10%
        : 90 + Math.random() * 5; // Right side - 90% to 95%
    
    const duration = 4;
    const drift = (Math.random() - 0.5) * 60;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Set initial styles
    Object.assign(particle.style, {
        position: 'absolute',
        left: `${startX}%`,
        bottom: '5%',
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        borderRadius: '50%',
        filter: 'blur(15px)',
        opacity: '0.7',
        transform: 'translateY(0) scale(1)',
        zIndex: '10',
        mixBlendMode: 'screen',
        willChange: 'transform, opacity',
        pointerEvents: 'none'
    });
    
    container.appendChild(particle);
    
    // Force reflow to ensure animation starts
    void particle.offsetWidth;
    
    // Apply animation
    particle.style.animation = `
        smoke-rise ${duration}s ease-out forwards,
        smoke-fade ${duration}s ease-out forwards
    `;
    particle.style.setProperty('--drift', `${drift}px`);
    particle.style.setProperty('--end-scale', 2 + Math.random() * 2);
    
    // Remove after animation ends
    setTimeout(() => {
        if (particle && particle.parentNode === container) {
            container.removeChild(particle);
        }
    }, duration * 1000);
}

// Tab functionality for vanilla tabs
function setupVanillaTabs() {
    // Add click event listeners to all vanilla tab buttons
    const tabButtons = document.querySelectorAll('.vanilla-tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabContainer = this.closest('.vanilla-tabs-container');
            const tabId = this.getAttribute('data-tab');
            
            // Deactivate all tabs in this container
            const allButtons = tabContainer.querySelectorAll('.vanilla-tab-button');
            const allPanels = tabContainer.querySelectorAll('.vanilla-tab-panel');
            
            allButtons.forEach(btn => btn.classList.remove('active'));
            allPanels.forEach(panel => panel.classList.remove('active'));
            
            // Activate the clicked tab
            this.classList.add('active');
            const targetPanel = tabContainer.querySelector(`.vanilla-tab-panel#${tabId}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// Tab functionality for group tabs
function setupGroupTabs() {
    // Add click event listeners to all group tab buttons
    const tabButtons = document.querySelectorAll('.group-tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabContainer = this.closest('.group-tabs-container');
            const tabId = this.getAttribute('data-tab');
            
            // Deactivate all tabs in this container
            const allButtons = tabContainer.querySelectorAll('.group-tab-button');
            const allPanels = tabContainer.querySelectorAll('.group-tab-panel');
            
            allButtons.forEach(btn => btn.classList.remove('active'));
            allPanels.forEach(panel => panel.classList.remove('active'));
            
            // Activate the clicked tab
            this.classList.add('active');
            const targetPanel = tabContainer.querySelector(`.group-tab-panel#${tabId}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// Utility functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.select();
        document.execCommand('copy');
        showNotification('Configuration copied to clipboard', 'success');
    }
}

function getTimestamp() {
    const now = new Date();
    return `${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}`;
}

function updateSavedPairsNotification() {
    const notification = document.getElementById('savedPairsNotification');
    const vanillaCount = document.querySelector('.vanilla-count');
    const groupCount = document.querySelector('.group-count');
    
    if (!notification || !vanillaCount || !groupCount) return;
    
    const vanillaPairs = dataStore.vanilla?.pairs ? Object.keys(dataStore.vanilla.pairs).length : 0;
    const groupPairs = dataStore.group?.pairs ? Object.keys(dataStore.group.pairs).length : 0;
    
    vanillaCount.textContent = `${vanillaPairs} Vanilla`;
    groupCount.textContent = `${groupPairs} Group`;
    
    if (vanillaPairs > 0 || groupPairs > 0) {
        notification.style.display = 'block';
    } else {
        notification.style.display = 'none';
    }
}

function saveToLocalStorage() {
    localStorage.setItem('explosionConfigData', JSON.stringify(dataStore));
    updateSavedPairsNotification();
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('explosionConfigData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.assign(dataStore, parsedData);
    }
    updateSavedPairsNotification();
}

// Initialize the config manager
const configManager = new ConfigManager();

// Set up all event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            const tabId = e.target.getAttribute('data-tab');
            e.target.classList.add('active');
            const content = document.getElementById(tabId);
            if (content) content.classList.add('active');
            
            // Update pair lists when switching tabs
            if (window.updateVanillaPairList) window.updateVanillaPairList();
            if (window.updateGroupPairList) window.updateGroupPairList();
            
            // Update conversion dropdown when switching to conversion tab
            if (tabId === 'conversion') {
                updateConversionDropdown();
            }
        });
    });
    
    // Conversion
    document.getElementById('convert-to-group').addEventListener('click', convertToGroup);
    document.getElementById('copy-conversion-config').addEventListener('click', () => copyToClipboard('conversion-output'));
    
    // Update conversion dropdown
    const pairSelect = document.getElementById('select-vanilla-pair');
    pairSelect.addEventListener('change', updateConversionForm);
    
    // Add input event listeners for live updates
    document.getElementById('group-entity-name-conversion').addEventListener('input', updatePreviewFromInputs);
    document.getElementById('group-material-name-conversion').addEventListener('input', updatePreviewFromInputs);
    
    function updatePreviewFromInputs() {
        const pairKey = pairSelect.value;
        if (!pairKey) return;
        
        const [entityName, materialName] = pairKey.split(':');
        const entityData = dataStore.vanilla.pairs[pairKey]?.entity;
        const materialData = dataStore.vanilla.pairs[pairKey]?.material;
        
        if (!entityData || !materialData) return;
        
        // Use the current input values for the preview
        const previewConfig = generateGroupConfig(
            document.getElementById('group-entity-name-conversion').value || entityName,
            document.getElementById('group-material-name-conversion').value || materialName,
            entityData,
            materialData,
            true // isPreview
        );
        
        document.getElementById('conversion-output').textContent = JSON.stringify(previewConfig, null, 2);
    }
}

// Update dropdown with entity:material pairs
function updateConversionDropdown() {
    const select = document.getElementById('select-vanilla-pair');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select Pair --</option>' + 
        Object.entries(dataStore.vanilla.pairs).map(([key, _]) => 
            `<option value="${key}">${key.replace(':', ' : ')}</option>`
        ).join('');
}


function updateConversionForm() {
    const pairKey = document.getElementById('select-vanilla-pair').value;
    
    if (!pairKey) {
        document.getElementById('conversion-output').textContent = '';
        return;
    }
    
    // Split only on the first colon to handle material names with colons
    const firstColonIndex = pairKey.indexOf(':');
    const entityName = pairKey.substring(0, firstColonIndex);
    const materialName = pairKey.substring(firstColonIndex + 1);
    
    // Remove _Group suffix if present (case-insensitive) and 'minecraft:' prefix from material name
    const removeGroupSuffix = (str) => {
        const lowerStr = str.toLowerCase();
        return lowerStr.endsWith('_group') ? str.slice(0, -6) : str;
    };
    
    const displayEntityName = removeGroupSuffix(entityName);
    let displayMaterialName = removeGroupSuffix(materialName);
    // Remove 'minecraft:' prefix if present
    if (displayMaterialName.startsWith('minecraft:')) {
        displayMaterialName = displayMaterialName.substring(10);
    }
    
    // Update the input fields without _Group suffix for display
    const entityInput = document.getElementById('group-entity-name-conversion');
    const materialInput = document.getElementById('group-material-name-conversion');
    
    entityInput.value = displayEntityName;
    materialInput.value = displayMaterialName;
    
    // Trigger the preview update
    updateConversionPreview(entityName, materialName);
    
    // Set up real-time preview updates
    const updatePreview = () => updateConversionPreview(entityName, materialName);
    entityInput.addEventListener('input', updatePreview);
    materialInput.addEventListener('input', updatePreview);
}

function updateConversionPreview(originalEntity, originalMaterial) {
    const entityInput = document.getElementById('group-entity-name-conversion').value.trim() || originalEntity;
    const materialInput = document.getElementById('group-material-name-conversion').value.trim() || originalMaterial;
    
    // Case-insensitive check for _Group suffix
    const hasGroupSuffix = (str) => str.toLowerCase().endsWith('_group');
    const ensureGroupSuffix = (str) => hasGroupSuffix(str) ? str : `${str}_Group`;
    
    const groupEntity = ensureGroupSuffix(entityInput);
    const groupMaterial = ensureGroupSuffix(materialInput);
    
    const output = `
🔄 Conversion Preview
─────────────────
Group: ${groupEntity}
Maps to: ${originalEntity}

Group: ${groupMaterial}
Maps to: ${originalMaterial}`;
    
    document.getElementById('conversion-output').textContent = output;
}

async function convertToGroup() {
    const pairKey = document.getElementById('select-vanilla-pair').value;
    let groupEntityName = document.getElementById('group-entity-name-conversion').value.trim();
    let groupMaterialName = document.getElementById('group-material-name-conversion').value.trim();
    const deleteOriginal = document.getElementById('delete-after-conversion').checked;
    
    if (!pairKey || !groupEntityName || !groupMaterialName) {
        showNotification('All fields are required for conversion', 'error');
        return;
    }
    
    // Ensure _Group suffix is added for backend use
    groupEntityName = groupEntityName.endsWith('_Group') ? groupEntityName : `${groupEntityName}_Group`;
    groupMaterialName = groupMaterialName.endsWith('_Group') ? groupMaterialName : `${groupMaterialName}_Group`;
    
    const groupKey = `${groupEntityName}:${groupMaterialName}`;
    const groupExists = Object.keys(dataStore.group?.pairs || {}).some(k => 
        k.toLowerCase() === groupKey.toLowerCase()
    );
    if (groupExists && !confirm(`Group "${groupKey}" exists. Update it?`)) return;
    
    // Split only on the first colon to handle material names with 'minecraft:' prefix
    const firstColon = pairKey.indexOf(':');
    const entityName = pairKey.substring(0, firstColon);
    const materialName = pairKey.substring(firstColon + 1);
    const pairData = dataStore.vanilla.pairs[pairKey];
    
    if (!pairData) {
        showNotification('Selected pair not found', 'error');
        return;
    }
    
    const entityData = pairData.entity;
    const materialData = pairData.material;
    
    // Convert to group format
    const convertedEntity = {
        name: groupEntityName,
        explosionRadius: entityData.explosionRadius,
        explosionFactor: entityData.explosionFactor,
        underwaterExplosionFactor: entityData.underwaterExplosionFactor,
        replaceOriginalExplosion: entityData.replaceOriginalExplosion,
        snapToBlockGrid: entityData.snapToBlockGrid,
        disableExplosionChaining: entityData.disableExplosionChaining,
        packDroppedItems: entityData.packDroppedItems,
        checkToolAlwaysEnabled: entityData.checkToolAlwaysEnabled,
        checkToolShowBossBar: entityData.checkToolShowBossBar,
        checkToolItem: entityData.checkToolItem,
        explosionDamageBlocksUnderwater: entityData.explosionDamageBlocksUnderwater,
        replaceOriginalExplosionWhenUnderwater: entityData.replaceOriginalExplosionWhenUnderwater,
        minTravelDistance: entityData.minTravelDistance,
        sound: entityData.sound,
        particlesOnHit: entityData.particlesOnHit,
        particlesOnBreak: entityData.particlesOnBreak
    };
    
    const convertedMaterial = {
        name: groupMaterialName,
        damage: materialData.damage,
        dropChance: materialData.dropChance,
        dropMaterial: materialData.dropMaterial,
        distanceAttenuation: materialData.distanceAttenuation,
        underwaterDamage: materialData.underwaterDamage,
        fancyUnderwater: materialData.fancyUnderwater,
        sound: materialData.sound,
        particlesOnHit: materialData.particlesOnHit,
        particlesOnBreak: materialData.particlesOnBreak
    };
    
    // Group members - add the original entity and material
    // Ensure we use the original material name with the 'minecraft:' prefix if it was there
    const entityMembers = [entityName];
    const materialMembers = [materialName];
    
    // Save converted data
    const groupPairKey = `${groupEntityName}:${groupMaterialName}`;
    dataStore.group.pairs[groupPairKey] = {
        entity: convertedEntity,
        material: convertedMaterial,
        entityMembers: entityMembers,
        materialMembers: materialMembers
    };
    
    // Delete original vanilla pair if requested
    if (deleteOriginal) {
        delete dataStore.vanilla.pairs[pairKey];
    }
    
    saveToLocalStorage();
    
    // Show final conversion mapping
    const output = `
    ✅ Conversion Successful!
    ───────────────────────
    Created Group: ${groupEntityName}
    Original: ${entityName}
    
    Created Group: ${groupMaterialName}
    Original: ${materialName}`;
    
    document.getElementById('conversion-output').textContent = output;
    const action = groupExists ? 'updated' : 'created';
    showNotification(`Group ${action} successfully${deleteOriginal ? ' (original deleted)' : ''}`, 'success');
    if (window.updateVanillaPairList) window.updateVanillaPairList();
    if (window.updateGroupPairList) window.updateGroupPairList();
    updateConversionDropdown();
    
    // Reset the input fields
    document.getElementById('group-entity-name-conversion').value = '';
    document.getElementById('group-material-name-conversion').value = '';
}


// Confirmation dialog functionality
function setupConfirmationDialog() {
    const clearAllBtn = document.getElementById('clear-all-pairs');
    const confirmDialog = document.getElementById('confirmDialog');
    const cancelBtn = document.getElementById('cancelDelete');
    const confirmBtn = document.getElementById('confirmDelete');
    
    if (!clearAllBtn || !confirmDialog || !cancelBtn || !confirmBtn) return;
    
    function showDialog() {
        confirmDialog.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
    
    function hideDialog() {
        confirmDialog.classList.remove('visible');
        document.body.style.overflow = '';
    }
    
    clearAllBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showDialog();
    });
    
    cancelBtn.addEventListener('click', hideDialog);
    
    confirmBtn.addEventListener('click', function() {
        // Clear all application data
        try {
            // Clear data store
            if (dataStore) {
                if (dataStore.vanilla) dataStore.vanilla.pairs = {};
                if (dataStore.group) dataStore.group.pairs = {};
                saveToLocalStorage();
            }
            
            // Clear all application-specific localStorage items
            const appPrefixes = ['explosion', 'group', 'explodeAny', 'tutorial'];
            Object.keys(localStorage).forEach(key => {
                if (appPrefixes.some(prefix => key.startsWith(prefix))) {
                    localStorage.removeItem(key);
                }
            });
            
            // Update UI
            const vanillaPairs = document.getElementById('saved-vanilla-pairs');
            const groupPairs = document.getElementById('saved-group-pairs');
            if (vanillaPairs) vanillaPairs.innerHTML = '';
            if (groupPairs) groupPairs.innerHTML = '';
            
            // Update notification
            if (typeof updateSavedPairsNotification === 'function') {
                updateSavedPairsNotification();
            }
            
            // Force reload to reset all components
            if (typeof showNotification === 'function') {
                showNotification('All application data has been cleared', 'success');
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            console.error('Error clearing application data:', error);
            if (typeof showNotification === 'function') {
                showNotification('Error clearing data: ' + error.message, 'error');
            }
        } finally {
            hideDialog();
        }
    });
    
    // Close dialog when clicking outside
    confirmDialog.addEventListener('click', function(e) {
        if (e.target === confirmDialog) {
            hideDialog();
        }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && confirmDialog.classList.contains('visible')) {
            hideDialog();
        }
    });
}

// Initialize application when all scripts are loaded
window.addEventListener('load', function() {
    // Initialize particles
    createParticles();
    
    // Load saved data from localStorage
    loadFromLocalStorage();

    // Set up event listeners
    setupEventListeners();
    
    // Initialize modules
    if (window.initVanillaModule) window.initVanillaModule();
    if (window.initGroupModule) window.initGroupModule();
    
    // Update conversion dropdown
    updateConversionDropdown();

    // Add keyboard shortcuts for tabs
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            const tabs = Array.from(document.querySelectorAll('.tab'));
            const activeIndex = tabs.findIndex(tab => tab.classList.contains('active'));
            
            if (e.key === 'ArrowRight' && activeIndex < tabs.length - 1) {
                tabs[activeIndex + 1].click();
            } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
                tabs[activeIndex - 1].click();
            }
        }
    });
    
    // Set up confirmation dialog
    setupConfirmationDialog();
    
    // Show tutorial if first time
    showTutorialIfNeeded();
});