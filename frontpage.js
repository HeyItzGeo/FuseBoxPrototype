// welcome-tab.js - Handles the welcome tab content and functionality

class WelcomeTab {
    constructor() {
        this.container = null;
        this.exportModal = null;
        this.initialize();
    }

    initialize() {
        this.createWelcomeTab();
        this.createExportModal();
        this.initializeImportModal();
        this.setupEventListeners();
    }
    
    initializeImportModal() {
        // Initialize import modal if it doesn't exist
        if (!window.importModal) {
            window.importModal = new ImportModal();
        }
    }

    createWelcomeTab() {
        // Create welcome tab button
        const tabButton = document.createElement('button');
        tabButton.className = 'tab active';
        tabButton.dataset.tab = 'welcome';
        tabButton.textContent = 'Welcome';
        
        // Insert the welcome tab as the first tab
        const tabsContainer = document.querySelector('.tabs');
        if (tabsContainer) {
            tabsContainer.insertBefore(tabButton, tabsContainer.firstChild);
        }

        // Create welcome content container
        this.container = document.createElement('div');
        this.container.className = 'tab-content active';
        this.container.id = 'welcome';

        // Add welcome content
        this.container.innerHTML = `
            <div class="welcome-container">
                <div class="welcome-grid">
                    <div class="feature-card">
                        <div class="card-icon">💥</div>
                        <h3>Vanilla Explosions</h3>
                        <p>Control how every explosion interacts with every block.</p>
                        <ul class="feature-list">
                            <li>🔗 Pair one explosion type with one block type (e.g., TNT with obsidian, creeper with glass)</li>
                            <li>⚙️ Customize {damage, drop rate, underwater behavior, regen, etc.} for TNT and other explosions</li>
                            <li>🎯 Precision: perfect for making special cases in minigames and protected zones</li>
                        </ul>
                        <p class="note">Requires defining both entity & material. Ideal for Minecraft servers with TNT-based gameplay.</p>
                    </div>

                    <div class="feature-card">
                        <div class="card-icon">👥</div>
                        <h3>Group Manager</h3>
                        <p>Apply shared settings to categories of entities/blocks.</p>
                        <ul class="feature-list">
                            <li>📂 Create and manage groups of entities & materials (e.g., all TNT types, all building blocks)</li>
                            <li>🛠️ Apply consistent rules across multiple items at once (great for minigame setups)</li>
                            <li>✅ Optimized for handling multiple blocks/entities with similar behaviors in your Minecraft world</li>
                        </ul>
                        <p class="note">Good for leveraging wildcards or bulk behavior for easy management.  </p>
                    </div>

                    <div class="feature-card">
                        <div class="card-icon">⚙️</div>
                        <h3>Quick Actions</h3>
                        <div class="quick-actions">
                            <button class="btn success" id="import-config">
                                <i>📥</i>
                                <span>Import</span>
                            </button>
                            <button class="btn warning" id="export-config">
                                <i>📤</i>
                                <span>Export</span>
                            </button>
                            <button class="btn info" id="documentation">
                                <i>📚</i>
                                <span>Docs</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div id="general-settings-container" class="settings-container"></div>
            </div>
            </div>`;

        // Add welcome content to the DOM
        const mainContainer = document.querySelector('.container');
        if (mainContainer) {
            const firstTabContent = mainContainer.querySelector('.tab-content');
            if (firstTabContent) {
                mainContainer.insertBefore(this.container, firstTabContent);
            } else {
                mainContainer.appendChild(this.container);
            }
        }
    }

    createExportModal() {
        // Create modal element
        this.exportModal = document.createElement('div');
        this.exportModal.id = 'exportConfigModal';
        this.exportModal.className = 'export-modal';
        this.exportModal.style.display = 'none';
        
        // Modal content
        this.exportModal.innerHTML = `
            <div class="export-modal-content">
                <div class="export-modal-header">
                    <h3>Export Configuration</h3>
                    <button class="export-modal-close">&times;</button>
                </div>
                <div class="export-modal-body">
                    <input type="hidden" id="exportAll" name="exportType" value="all">
                    <div class="export-preview">
                        <h4>Output Yaml</h4>
                        <div class="export-preview-content">
                            <p>Select an export option to see a preview</p>
                        </div>
                    </div>
                </div>
                <div class="export-modal-footer">
                    <button class="btn secondary export-modal-cancel">Cancel</button>
                    <button class="btn primary export-modal-copy">Copy to Clipboard</button>
                    <button class="btn success export-modal-download">Download File</button>
                </div>
            </div>
        `;
        
        // Add modal to the DOM
        document.body.appendChild(this.exportModal);

    }
    
    showExportModal() {
        if (!this.exportModal) return;
        
        // Reset modal state
        this.exportModal.querySelector('.export-preview-content').innerHTML = '<p>Preparing export preview...</p>';
        // Update preview immediately since we only have one option
        this.updateExportPreview();
        
        // Show modal with animation
        this.exportModal.style.display = 'flex';
        setTimeout(() => {
            this.exportModal.classList.add('active');
        }, 10);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    hideExportModal() {
        if (!this.exportModal) return;
        
        // Hide modal with animation
        this.exportModal.classList.remove('active');
        setTimeout(() => {
            this.exportModal.style.display = 'none';
        }, 300);
        
        // Re-enable body scroll
        document.body.style.overflow = '';
    }
    
    setupEventListeners() {
        // Handle quick export button
        const quickExportBtn = document.getElementById('quickExportBtn');
        if (quickExportBtn) {
            quickExportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showExportModal();
            });
        }

        // Handle tab switching
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (tab) {
                const tabId = tab.dataset.tab;
                if (tabId) {
                    // Update active tab
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // Update active content
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    const content = document.getElementById(tabId);
                    if (content) {
                        content.classList.add('active');
                    }
                }
                return;
            }
            
            // Handle export config button
            const exportBtn = e.target.closest('#export-config');
            if (exportBtn) {
                e.preventDefault();
                this.showExportModal();
                return;
            }
            
            // Handle import config button
            const importBtn = e.target.closest('#import-config');
            if (importBtn) {
                e.preventDefault();
                if (window.importModal) {
                    window.importModal.open();
                }
                return;
            }
            
            // Handle modal close button
            const closeBtn = e.target.closest('.export-modal-close, .export-modal-cancel');
            if (closeBtn && this.exportModal && this.exportModal.contains(closeBtn)) {
                e.preventDefault();
                this.hideExportModal();
                return;
            }
            
            // Handle copy to clipboard button
            const copyBtn = e.target.closest('.export-modal-copy');
            if (copyBtn && this.exportModal && this.exportModal.contains(copyBtn)) {
                this.copyExportToClipboard();
                return;
            }
            
            // Handle download button
            const downloadBtn = e.target.closest('.export-modal-download');
            if (downloadBtn && this.exportModal && this.exportModal.contains(downloadBtn)) {
                this.downloadExport();
                return;
            }
            
            // Close modal when clicking outside
            if (this.exportModal && this.exportModal.style.display === 'flex' && 
                e.target === this.exportModal) {
                this.hideExportModal();
                return;
            }
        });
        
        // Handle keyboard events
        document.addEventListener('keydown', (e) => {
            // Close modal on Escape key
            if (e.key === 'Escape' && this.exportModal && this.exportModal.style.display === 'flex') {
                this.hideExportModal();
            }
        });
    }

    // Generate General Settings YAML (top of the file)
    generateGeneralSettings() {
        const settings = JSON.parse(localStorage.getItem('explodeAnyGeneralSettings') || '{}');
        if (!settings) return '';
        
        let yaml = '';
        
        // Add top-level settings
        if (settings.UseBlockDatabase !== undefined) yaml += `UseBlockDatabase: ${settings.UseBlockDatabase}\n`;
        if (settings.CheckBlockDatabaseAtStartup !== undefined) yaml += `CheckBlockDatabaseAtStartup: ${settings.CheckBlockDatabaseAtStartup}\n`;
        if (settings.BlockDurability !== undefined) yaml += `BlockDurability: ${settings.BlockDurability}\n`;
        if (settings.EnableMetrics !== undefined) yaml += `EnableMetrics: ${settings.EnableMetrics}\n`;
        
        // Add Checktool settings
        if (settings.Checktool) {
            yaml += '\nChecktool:\n';
            if (settings.Checktool.AlwaysEnabled !== undefined) yaml += `  AlwaysEnabled: ${settings.Checktool.AlwaysEnabled}\n`;
            if (settings.Checktool.EnabledByDefault !== undefined) yaml += `  EnabledByDefault: ${settings.Checktool.EnabledByDefault}\n`;
            if (settings.Checktool.PreventActionWhenCheckingHandledBlocks !== undefined) yaml += `  PreventActionWhenCheckingHandledBlocks: ${settings.Checktool.PreventActionWhenCheckingHandledBlocks}\n`;
            if (settings.Checktool.PreventActionWhenCheckingNonHandledBlocks !== undefined) yaml += `  PreventActionWhenCheckingNonHandledBlocks: ${settings.Checktool.PreventActionWhenCheckingNonHandledBlocks}\n`;
            if (settings.Checktool.SilentWhenCheckingOnDisabledWorlds !== undefined) yaml += `  SilentWhenCheckingOnDisabledWorlds: ${settings.Checktool.SilentWhenCheckingOnDisabledWorlds}\n`;
            if (settings.Checktool.SilentWhenCheckingWithoutPermissions !== undefined) yaml += `  SilentWhenCheckingWithoutPermissions: ${settings.Checktool.SilentWhenCheckingWithoutPermissions}\n`;
            if (settings.Checktool.SilentWhenCheckingNonHandledBlocks !== undefined) yaml += `  SilentWhenCheckingNonHandledBlocks: ${settings.Checktool.SilentWhenCheckingNonHandledBlocks}\n`;
            if (settings.Checktool.SilentWhenCheckingHandledBlocks !== undefined) yaml += `  SilentWhenCheckingHandledBlocks: ${settings.Checktool.SilentWhenCheckingHandledBlocks}\n`;
            if (settings.Checktool.ShowBossBar !== undefined) yaml += `  ShowBossBar: ${settings.Checktool.ShowBossBar}\n`;
            if (settings.Checktool.BossBarColor) yaml += `  BossBarColor: "${settings.Checktool.BossBarColor}"\n`;
            if (settings.Checktool.BossBarStyle) yaml += `  BossBarStyle: "${settings.Checktool.BossBarStyle}"\n`;
            if (settings.Checktool.BossBarDuration) yaml += `  BossBarDuration: "${settings.Checktool.BossBarDuration}"\n`;
        }
        
        return yaml;
    }

    // Generate Locale settings YAML (bottom of the file)
    generateLocaleSettings() {
        const settings = JSON.parse(localStorage.getItem('explodeAnyGeneralSettings') || '{}');
        if (!settings.Locale && !settings.LocalePrefix) return '';
        
        let yaml = '\n# Locale Settings\n';
        
        if (settings.Locale) {
            yaml += 'Locale:\n';
            for (const [key, value] of Object.entries(settings.Locale)) {
                // Escape quotes in the value
                const escapedValue = String(value).replace(/"/g, '\\"');
                yaml += `  ${key}: "${escapedValue}"\n`;
            }
        }
        
        if (settings.LocalePrefix) {
            yaml += `\nLocalePrefix: "${settings.LocalePrefix.replace(/"/g, '\\"')}"\n`;
        }
        
        return yaml;
    }

    // Unified configuration generators
    getConfigurationGenerators() {
        if (typeof window.dataStore === 'undefined') {
            console.error('dataStore is not defined. Make sure app.js is loaded before frontpage.js');
            return [];
        }
        
        const generators = [];
        
        // Add general settings at the top
        const generalSettings = this.generateGeneralSettings();
        if (generalSettings) {
            generators.push({
                name: 'GeneralSettings',
                dataSource: () => ({}),
                generator: () => generalSettings
            });
        }
        
        // Add Group Definitions (just the Groups: section with members)
        generators.push({
            name: 'GroupDefinitions',
            dataSource: () => window.dataStore.group?.pairs || {},
            generator: this.generateGroupDefinitions.bind(this)
        });
        
        // Add Vanilla and Group entities
        generators.push(
            {
                name: 'VanillaEntity',
                dataSource: () => window.dataStore.vanilla?.pairs || {},
                generator: this.generateVanillaConfig.bind(this)
            },
            {
                name: 'GroupEntity', 
                dataSource: () => window.dataStore.group?.pairs || {},
                generator: this.generateGroupConfig.bind(this)
            }
        );
        
        // Add Locale settings at the bottom
        const localeSettings = this.generateLocaleSettings();
        if (localeSettings) {
            generators.push({
                name: 'Locale',
                dataSource: () => ({}),
                generator: () => localeSettings
            });
        }
        
        return generators;
    }

    updateExportPreview() {
        if (!this.exportModal) {
            console.warn('Export modal not found');
            return;
        }
        
        const previewContent = this.exportModal.querySelector('.export-preview-content');
        if (!previewContent) {
            console.warn('Export preview content not found');
            return;
        }
        
        console.log('dataStore:', window.dataStore);
        
        const generators = this.getConfigurationGenerators();
        let previewText = '';
        let hasContent = false;

        // Process all configuration types
        generators.forEach(({ name, dataSource, generator }) => {
            try {
                const configData = dataSource();
                // For general settings and locale, we want to include them even if data is empty
                const shouldInclude = (name === 'GeneralSettings' || name === 'Locale') ? 
                    true : 
                    (configData && Object.keys(configData).length > 0);
                
                if (shouldInclude) {
                    const configOutput = generator(configData);
                    if (configOutput && configOutput.trim() !== '') {
                        previewText += `${configOutput}\n\n`;
                        hasContent = true;
                    }
                }
            } catch (error) {
                console.error(`Error generating ${name} config:`, error);
                previewText += `// Error generating ${name} configuration\n\n`;
            }
        });

        if (!hasContent) {
            previewText = '// No configurations available for export\n';
        }

        previewContent.textContent = previewText;
    } 

    // Common particle formatter used by both config types
    formatParticles(particles, indent = 4) {
        if (!particles || !particles.enabled) return '';
        
        const indentStr = ' '.repeat(indent);
        let result = '';
        
        // Always include name, material, force, and amount
        if (particles.name) result += `${indentStr}Name: ${particles.name}\n`;
        if (particles.material && !particles._disabled?.material) {
            result += `${indentStr}Material: ${particles.material}\n`;
        }
        if (particles.force) result += `${indentStr}Force: ${particles.force}\n`;
        if (particles.amount) result += `${indentStr}Amount: ${particles.amount}\n`;
        
        // Only include size if not disabled
        if (particles.size && !particles._disabled?.rgb) {
            result += `${indentStr}Size: ${particles.size}\n`;
        }
        
        // Always include speed and delta values
        if (particles.speed) result += `${indentStr}Speed: ${particles.speed}\n`;
        if (particles.deltaX) result += `${indentStr}DeltaX: ${particles.deltaX}\n`;
        if (particles.deltaY) result += `${indentStr}DeltaY: ${particles.deltaY}\n`;
        if (particles.deltaZ) result += `${indentStr}DeltaZ: ${particles.deltaZ}\n`;
        
        // Only include RGB if not disabled
        if (!particles._disabled?.rgb) {
            if (particles.red !== undefined) result += `${indentStr}Red: ${particles.red}\n`;
            if (particles.green !== undefined) result += `${indentStr}Green: ${particles.green}\n`;
            if (particles.blue !== undefined) result += `${indentStr}Blue: ${particles.blue}`;
        }
        
        return result;
    }

    // Common properties generator used by both config types
    generateCommonProperties(entityData, indent = 6) {
        const indentStr = ' '.repeat(indent);
        let result = '';
        
        result += `${indentStr}ExplosionRadius: ${entityData.explosionRadius}\n`;
        result += `${indentStr}ExplosionFactor: ${entityData.explosionFactor}\n`;
        result += `${indentStr}UnderwaterExplosionFactor: ${entityData.underwaterExplosionFactor}\n`;
        result += `${indentStr}SnapToBlockGridOnPriming: ${entityData.snapToBlockGrid}\n`;
        result += `${indentStr}DisableExplosionChaining: ${entityData.disableExplosionChaining}\n`;
        result += `${indentStr}MinimumTravelDistanceToDamageBlocksUnderwater: ${entityData.minTravelDistance}\n`;
        result += `${indentStr}ReplaceOriginalExplosion: ${entityData.replaceOriginalExplosion}\n`;
        result += `${indentStr}PackDroppedItems: ${entityData.packDroppedItems}\n`;
        result += `${indentStr}ExplosionDamageBlocksUnderwater: ${entityData.explosionDamageBlocksUnderwater}\n`;
        result += `${indentStr}ReplaceOriginalExplosionWhenUnderwater: ${entityData.replaceOriginalExplosionWhenUnderwater}\n`;
        
        // Add sound configuration if it exists
        if (entityData.sound) {
            result += `${indentStr}Sound:\n`;
            result += `${indentStr}  OnExplode:\n`;
            result += `${indentStr}    Sound:\n`;
            result += `${indentStr}      Name: ${entityData.sound.name || ''}\n`;
            if (entityData.sound.volume !== undefined) {
                result += `${indentStr}      Volume: ${entityData.sound.volume}\n`;
            }
            if (entityData.sound.pitch !== undefined) {
                result += `${indentStr}      Pitch: ${entityData.sound.pitch}\n`;
            }
        }
        
        // Add water-related properties for vanilla
        if (indent === 6) { // Vanilla specific properties
            result += `${indentStr}ExplosionRemoveWaterloggedStateFromNearbyBlocks: ${entityData.explosionRemoveWaterloggedStateFromNearbyBlocks}\n`;
            result += `${indentStr}ExplosionRemoveWaterloggedStateFromNearbyBlocksOnSurface: ${entityData.explosionRemoveWaterloggedStateFromNearbyBlocksOnSurface}\n`;
            result += `${indentStr}ExplosionRemoveWaterloggedStateFromNearbyBlocksUnderwater: ${entityData.explosionRemoveWaterloggedStateFromNearbyBlocksUnderwater}\n`;
            result += `${indentStr}ExplosionRemoveNearbyWaterloggedBlocks: ${entityData.explosionRemoveNearbyWaterloggedBlocks}\n`;
            result += `${indentStr}ExplosionRemoveNearbyWaterloggedBlocksOnSurface: ${entityData.explosionRemoveNearbyWaterloggedBlocksOnSurface}\n`;
            result += `${indentStr}ExplosionRemoveNearbyWaterloggedBlocksUnderwater: ${entityData.explosionRemoveNearbyWaterloggedBlocksUnderwater}\n`;
            result += `${indentStr}ExplosionRemoveNearbyLiquids: ${entityData.explosionRemoveNearbyLiquids}\n`;
            result += `${indentStr}ExplosionRemoveNearbyLiquidsOnSurface: ${entityData.explosionRemoveNearbyLiquidsOnSurface}\n`;
            result += `${indentStr}ExplosionRemoveNearbyLiquidsUnderwater: ${entityData.explosionRemoveNearbyLiquidsUnderwater}\n`;
        }
        
        return result;
    }

    // Common material properties generator
    generateMaterialProperties(materialData, indent = 8) {
        const indentStr = ' '.repeat(indent);
        let result = '';
        
        result += `${indentStr}Damage: ${materialData.damage}\n`;
        result += `${indentStr}DropChance: ${materialData.dropChance}\n`;
        result += `${indentStr}DropMaterial: ${materialData.dropMaterial || ''}\n`;
        result += `${indentStr}DistanceAttenuationFactor: ${materialData.distanceAttenuation}\n`;
        result += `${indentStr}UnderwaterDamageFactor: ${materialData.underwaterDamage}\n`;
        result += `${indentStr}FancyUnderwaterDetection: ${materialData.fancyUnderwater}\n`;
        
        // Add sound configuration for material if it exists
        if (materialData.sound) {
            result += `${indentStr}Sound:\n`;
            result += `${indentStr}  OnExplode:\n`;
            result += `${indentStr}    Sound:\n`;
            result += `${indentStr}      Name: ${materialData.sound.name || ''}\n`;
            if (materialData.sound.volume !== undefined) {
                result += `${indentStr}      Volume: ${materialData.sound.volume}\n`;
            }
            if (materialData.sound.pitch !== undefined) {
                result += `${indentStr}      Pitch: ${materialData.sound.pitch}\n`;
            }
        }
        
        return result;
    }

    generateGroupConfig(pairs) {
        if (!pairs || Object.keys(pairs).length === 0) {
            return '';
        }
    
        let yamlOutput = '';
        let entityConfigs = '';
        
        // Check if there's any vanilla data
        const hasVanillaData = window.dataStore?.vanilla?.pairs && 
                             Object.keys(window.dataStore.vanilla.pairs).length > 0;

        // Add VanillaEntity header only if there's no vanilla data
        if (!hasVanillaData) {
            yamlOutput = 'VanillaEntity:\n';
        }
        
        // Generate only the entity and material configs (without group settings)
        Object.entries(pairs).forEach(([pairKey, pairData]) => {
            const [entityName, materialName] = pairKey.split(':');
            
            // Generate the entity and material configs
            entityConfigs += `  ${entityName}:\n`;
            entityConfigs += `    Materials:\n`;
            entityConfigs += `      ${materialName}:\n`;
            entityConfigs += this.generateMaterialProperties(pairData.material, 8);
            
            // Material Particles
            entityConfigs += `      Particles:\n`;
            entityConfigs += `        OnHit:\n${this.formatParticles(pairData.material.particlesOnHit, 10)}\n`;
            entityConfigs += `        OnBreak:\n${this.formatParticles(pairData.material.particlesOnBreak, 10)}\n`;
            
            // Properties
            entityConfigs += `    Properties:\n`;
            entityConfigs += this.generateCommonProperties(pairData.entity, 6);
            
            // Entity Particles
            entityConfigs += `      Particles:\n`;
            entityConfigs += `        OnHit:\n${this.formatParticles(pairData.entity.particlesOnHit, 10)}\n`;
            entityConfigs += `        OnBreak:\n${this.formatParticles(pairData.entity.particlesOnBreak, 10)}\n\n`;
        });
        
        // Add the entity and material configurations
        yamlOutput += entityConfigs;
        
        return yamlOutput;
    }

    generateVanillaConfig(pairs) {
        if (!pairs || Object.keys(pairs).length === 0) {
            return '';
        }

        let yamlOutput = 'VanillaEntity:\n';
        
        // Process each saved pair
        Object.entries(pairs).forEach(([pairKey, pairData]) => {
            const [entityName, materialName] = pairKey.split(':');
            const entityData = pairData.entity;
            const materialData = pairData.material;
            
            // Build the YAML output
            yamlOutput += `  ${entityName}:\n`;
            yamlOutput += `    Materials:\n`;
            yamlOutput += `      ${materialName}:\n`;
            yamlOutput += this.generateMaterialProperties(materialData, 8);
            
            // Material Particles
            yamlOutput += `      Particles:\n`;
            yamlOutput += `        OnHit:\n${this.formatParticles(materialData.particlesOnHit, 10)}\n`;
            yamlOutput += `        OnBreak:\n${this.formatParticles(materialData.particlesOnBreak, 10)}\n`;
            
            // Properties
            yamlOutput += `    Properties:\n`;
            yamlOutput += this.generateCommonProperties(entityData, 6);
            
            // Entity Particles
            yamlOutput += `      Particles:\n`;
            yamlOutput += `        OnHit:\n${this.formatParticles(entityData.particlesOnHit, 10)}\n`;
            yamlOutput += `        OnBreak:\n${this.formatParticles(entityData.particlesOnBreak, 10)}\n`;
        });
        
        return yamlOutput;
    }


    // Add this new method to extract just the group definitions
    generateGroupDefinitions(pairs) {
        if (!pairs || Object.keys(pairs).length === 0) {
            return '';
        }

        const entityGroups = new Map();
        const materialGroups = new Map();
        
        // Collect all entity and material groups
        Object.entries(pairs).forEach(([pairKey, pairData]) => {
            const [entityName, materialName] = pairKey.split(':');
            const entityMembers = pairData.entityMembers || [];
            const materialMembers = pairData.materialMembers || [];
            
            // Add to entity groups
            if (entityMembers.length > 0) {
                if (!entityGroups.has(entityName)) {
                    entityGroups.set(entityName, new Set());
                }
                entityMembers.forEach(member => entityGroups.get(entityName).add(member));
            }
            
            // Add to material groups
            if (materialMembers.length > 0) {
                if (!materialGroups.has(materialName)) {
                    materialGroups.set(materialName, new Set());
                }
                materialMembers.forEach(member => materialGroups.get(materialName).add(member));
            }
        });
        
        // Generate groups section only if there are groups
        if (entityGroups.size === 0 && materialGroups.size === 0) {
            return '';
        }
        
        let yamlOutput = 'Groups:\n';
        
        // Add entity groups
        for (const [groupName, members] of entityGroups.entries()) {
            yamlOutput += `  ${groupName}:\n`;
            Array.from(members).forEach(member => {
                yamlOutput += `  - ${member}\n`;
            });
            yamlOutput += '\n';
        }
        
        // Add material groups
        for (const [groupName, members] of materialGroups.entries()) {
            yamlOutput += `  ${groupName}:\n`;
            Array.from(members).forEach(member => {
                yamlOutput += `  - ${member}\n`;
            });
            yamlOutput += '\n';
        }
        
        return yamlOutput + '\n';
    }
    copyExportToClipboard() {
        if (!this.exportModal) return;
        
        const previewContent = this.exportModal.querySelector('.export-preview-content');
        if (!previewContent) return;
        
        const textToCopy = previewContent.textContent;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showNotification('Failed to copy to clipboard', 'error');
        });
    }
    
    downloadExport() {
        if (!this.exportModal) return;
        
        const previewContent = this.exportModal.querySelector('.export-preview-content');
        if (!previewContent) return;
        
        const textToDownload = previewContent.textContent;
        const exportType = 'all';

        // Create a blob with the text
        const blob = new Blob([textToDownload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `explosion_config_${exportType}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.showNotification('Download started!', 'success');
        }, 100);
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }
}

// Import Modal functionality
class ImportModal {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        // Create modal element
        this.modal = document.createElement('div');
        this.modal.className = 'import-modal';
        this.modal.id = 'importConfigModal';
        this.modal.style.display = 'none';
        
        // Modal content
        this.modal.innerHTML = `
            <div class="import-modal-content">
                <div class="import-modal-header">
                    <h3>Import Configuration</h3>
                    <button class="import-modal-close">&times;</button>
                </div>
                <div class="import-modal-body">
                    <div class="import-options">
                        <p>Paste your configuration YAML/JSON below or upload a file.</p>
                        <div class="file-upload">
                            <label class="btn secondary" for="import-file-upload">
                                <i class="icon-upload">📁</i> Choose File
                            </label>
                            <input type="file" id="import-file-upload" accept=".yaml,.yml,.json" style="display: none;">
                            <span id="import-file-name" style="margin-left: 10px;">No file selected</span>
                        </div>
                        <div class="import-textarea-container">
                            <textarea id="import-textarea" class="import-textarea" placeholder="Paste your configuration here..."></textarea>
                        </div>
                    </div>
                    <div class="import-preview">
                        <h4>Preview</h4>
                        <div class="import-preview-content">
                            <p>Preview will appear here when valid configuration is provided</p>
                        </div>
                    </div>
                </div>
                <div class="import-modal-footer">
                    <button class="btn secondary import-modal-cancel">Cancel</button>
                    <button class="btn primary import-modal-preview" disabled>Preview</button>
                    <button class="btn success import-modal-import" disabled>Import</button>
                </div>
            </div>`;
        
        // Add modal to the DOM
        document.body.appendChild(this.modal);

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal when clicking the close button or outside the modal
        this.modal.querySelector('.import-modal-close').addEventListener('click', () => this.close());
        this.modal.querySelector('.import-modal-cancel').addEventListener('click', () => this.close());
        
        // Close when clicking outside the modal content
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // File upload handling
        const fileInput = this.modal.querySelector('#import-file-upload');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('import-file-name').textContent = file.name;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.modal.querySelector('#import-textarea').value = event.target.result;
                    this.validateInput();
                };
                reader.readAsText(file);
            }
        });

        // Textarea input validation
        this.modal.querySelector('#import-textarea').addEventListener('input', () => {
            this.validateInput();
        });
        
        // Preview button
        this.modal.querySelector('.import-modal-preview').addEventListener('click', () => {
            this.validateInput();
        });
        
        // Import button
        this.modal.querySelector('.import-modal-import').addEventListener('click', () => {
            this.importConfig();
        });
    }

    validateInput() {
        const textarea = this.modal.querySelector('#import-textarea');
        const previewBtn = this.modal.querySelector('.import-modal-preview');
        const importBtn = this.modal.querySelector('.import-modal-import');
        const previewContent = this.modal.querySelector('.import-preview-content');
        
        const hasContent = textarea.value.trim().length > 0;
        previewBtn.disabled = !hasContent;
        
        if (hasContent) {
            try {
                const config = this.parseYAML(textarea.value);
                const transformedConfig = this.transformConfigForPreview(config);
                previewContent.innerHTML = `<pre>${JSON.stringify(transformedConfig, null, 2)}</pre>`;
                previewBtn.disabled = false;
                importBtn.disabled = false;
                return true;
            } catch (e) {
                previewContent.innerHTML = `<div class="error">Invalid YAML: ${e.message}</div>`;
                previewBtn.disabled = true;
                importBtn.disabled = true;
                return false;
            }
        } else {
            previewContent.innerHTML = '<p>Preview will appear here when valid YAML is provided</p>';
            importBtn.disabled = true;
            return false;
        }
    }
    
    parseYAML(yamlString) {
        const lines = yamlString.split('\n');
        const result = {};
        const stack = [{ obj: result, indent: -1 }];
        let inArray = false;
        let currentArray = null;
        let arrayIndent = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            const indent = line.match(/^\s*/)[0].length;
            
            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Check for array items (lines starting with -)
            const isArrayItem = line.trim().startsWith('-');
            
            if (isArrayItem) {
                if (!inArray || indent < arrayIndent) {
                    // Start of a new array
                    inArray = true;
                    arrayIndent = indent;
                    currentArray = [];
                    // Get the parent object and key
                    const parent = stack[stack.length - 1].obj;
                    const lastKey = Object.keys(parent).pop();
                    parent[lastKey] = currentArray;
                }
                
                // Add the array item (remove the - and trim)
                const item = line.trim().substring(1).trim();
                if (item) {
                    currentArray.push(item);
                }
                continue;
            } else if (inArray && indent > arrayIndent) {
                // Skip lines that are part of array items (multi-line values)
                continue;
            } else {
                inArray = false;
            }
            
            // Handle key-value pairs
            const kvMatch = line.match(/^\s*([^:#]+):\s*(.*)$/);
            
            if (kvMatch) {
                const key = kvMatch[1].trim();
                let value = kvMatch[2].trim();
                
                // Remove objects from stack that are less indented than current line
                while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                    stack.pop();
                }
                
                let currentObj = stack[stack.length - 1].obj;
                
                // Handle empty value (indicating nested object)
                if (value === '') {
                    currentObj[key] = {};
                    stack.push({ obj: currentObj[key], indent: indent });
                } else {
                    // Convert value to appropriate type
                    if (value === 'true') value = true;
                    else if (value === 'false') value = false;
                    else if (value === 'null') value = null;
                    else if (!isNaN(value) && value !== '') {
                        // Check if it's a float or int
                        value = value.includes('.') ? parseFloat(value) : parseInt(value, 10);
                    }
                    else if ((value.startsWith('"') && value.endsWith('"')) || 
                            (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    
                    currentObj[key] = value;
                }
            }
        }
        
        return result;
    }
    
    transformConfigForPreview(yamlConfig) {
        // Transform the YAML structure to match the expected storage format
        const result = {
            vanilla: { pairs: {} },
            group: { pairs: {} }
        };

        // Process VanillaEntity section
        if (yamlConfig.VanillaEntity) {
            for (const [entityName, entityData] of Object.entries(yamlConfig.VanillaEntity)) {
                if (entityData.Materials) {
                    for (const [materialName, materialData] of Object.entries(entityData.Materials)) {
                        if (materialName === 'Particles') continue;
                        
                        const pairKey = `${entityName}:${materialName}`;
                        
                        // Transform entity properties - only what exists in YAML
                        const entityConfig = this.transformEntityConfig(entityData.Properties || {});
                        
                        // Transform material properties - only what exists in YAML
                        const materialConfig = this.transformMaterialConfig(materialData);
                        
                        result.vanilla.pairs[pairKey] = {
                            entity: entityConfig,
                            material: materialConfig
                        };
                    }
                }
            }
        }

        return result;
    }

    transformEntityConfig(properties) {
        const entityConfig = {};

        // Only include properties that exist in the YAML
        if (properties.ExplosionRadius !== undefined) entityConfig.explosionRadius = properties.ExplosionRadius.toString();
        if (properties.ExplosionFactor !== undefined) entityConfig.explosionFactor = properties.ExplosionFactor.toString();
        if (properties.UnderwaterExplosionFactor !== undefined) entityConfig.underwaterExplosionFactor = properties.UnderwaterExplosionFactor.toString();
        if (properties.ReplaceOriginalExplosion !== undefined) entityConfig.replaceOriginalExplosion = properties.ReplaceOriginalExplosion;
        if (properties.SnapToBlockGridOnPriming !== undefined) entityConfig.snapToBlockGrid = properties.SnapToBlockGridOnPriming;
        if (properties.DisableExplosionChaining !== undefined) entityConfig.disableExplosionChaining = properties.DisableExplosionChaining;
        if (properties.PackDroppedItems !== undefined) entityConfig.packDroppedItems = properties.PackDroppedItems;
        if (properties.ExplosionDamageBlocksUnderwater !== undefined) entityConfig.explosionDamageBlocksUnderwater = properties.ExplosionDamageBlocksUnderwater;
        if (properties.ReplaceOriginalExplosionWhenUnderwater !== undefined) entityConfig.replaceOriginalExplosionWhenUnderwater = properties.ReplaceOriginalExplosionWhenUnderwater;
        if (properties.ExplosionRemoveWaterloggedStateFromNearbyBlocks !== undefined) entityConfig.explosionRemoveWaterloggedStateFromNearbyBlocks = properties.ExplosionRemoveWaterloggedStateFromNearbyBlocks;
        if (properties.ExplosionRemoveWaterloggedStateFromNearbyBlocksOnSurface !== undefined) entityConfig.explosionRemoveWaterloggedStateFromNearbyBlocksOnSurface = properties.ExplosionRemoveWaterloggedStateFromNearbyBlocksOnSurface;
        if (properties.ExplosionRemoveWaterloggedStateFromNearbyBlocksUnderwater !== undefined) entityConfig.explosionRemoveWaterloggedStateFromNearbyBlocksUnderwater = properties.ExplosionRemoveWaterloggedStateFromNearbyBlocksUnderwater;
        if (properties.ExplosionRemoveNearbyWaterloggedBlocks !== undefined) entityConfig.explosionRemoveNearbyWaterloggedBlocks = properties.ExplosionRemoveNearbyWaterloggedBlocks;
        if (properties.ExplosionRemoveNearbyWaterloggedBlocksOnSurface !== undefined) entityConfig.explosionRemoveNearbyWaterloggedBlocksOnSurface = properties.ExplosionRemoveNearbyWaterloggedBlocksOnSurface;
        if (properties.ExplosionRemoveNearbyWaterloggedBlocksUnderwater !== undefined) entityConfig.explosionRemoveNearbyWaterloggedBlocksUnderwater = properties.ExplosionRemoveNearbyWaterloggedBlocksUnderwater;
        if (properties.ExplosionRemoveNearbyLiquids !== undefined) entityConfig.explosionRemoveNearbyLiquids = properties.ExplosionRemoveNearbyLiquids;
        if (properties.ExplosionRemoveNearbyLiquidsOnSurface !== undefined) entityConfig.explosionRemoveNearbyLiquidsOnSurface = properties.ExplosionRemoveNearbyLiquidsOnSurface;
        if (properties.ExplosionRemoveNearbyLiquidsUnderwater !== undefined) entityConfig.explosionRemoveNearbyLiquidsUnderwater = properties.ExplosionRemoveNearbyLiquidsUnderwater;
        if (properties.MinimumTravelDistanceToDamageBlocksUnderwater !== undefined) entityConfig.minTravelDistance = properties.MinimumTravelDistanceToDamageBlocksUnderwater.toString();

        // Sound configuration - handle nested OnExplode.Sound structure
        if (properties.Sound?.OnExplode?.Sound) {
            const soundData = properties.Sound.OnExplode.Sound;
            entityConfig.sound = {};
            if (soundData.Name !== undefined) entityConfig.sound.name = soundData.Name;
            if (soundData.Volume !== undefined) entityConfig.sound.volume = soundData.Volume.toString();
            if (soundData.Pitch !== undefined) entityConfig.sound.pitch = soundData.Pitch.toString();
        }

        // Particles configuration - only if they exist
        if (properties.Particles) {
            if (properties.Particles.OnHit) entityConfig.particlesOnHit = this.transformParticlesConfig(properties.Particles.OnHit);
            if (properties.Particles.OnBreak) entityConfig.particlesOnBreak = this.transformParticlesConfig(properties.Particles.OnBreak);
        }

        return entityConfig;
    }

    transformMaterialConfig(materialData) {
        const materialConfig = {};

        // Only include properties that exist in the YAML
        if (materialData.Damage !== undefined) materialConfig.damage = materialData.Damage.toString();
        if (materialData.DropChance !== undefined) materialConfig.dropChance = materialData.DropChance.toString();
        if (materialData.DropMaterial !== undefined) materialConfig.dropMaterial = materialData.DropMaterial;
        if (materialData.DistanceAttenuationFactor !== undefined) materialConfig.distanceAttenuation = materialData.DistanceAttenuationFactor.toString();
        if (materialData.UnderwaterDamageFactor !== undefined) materialConfig.underwaterDamage = materialData.UnderwaterDamageFactor.toString();
        if (materialData.FancyUnderwaterDetection !== undefined) materialConfig.fancyUnderwater = materialData.FancyUnderwaterDetection;

        // Sound configuration - handle nested OnExplode.Sound structure for materials
        if (materialData.Sound?.OnExplode?.Sound) {
            const soundData = materialData.Sound.OnExplode.Sound;
            materialConfig.sound = {};
            if (soundData.Name !== undefined) materialConfig.sound.name = soundData.Name;
            if (soundData.Volume !== undefined) materialConfig.sound.volume = soundData.Volume.toString();
            if (soundData.Pitch !== undefined) materialConfig.sound.pitch = soundData.Pitch.toString();
        }
        
        // Handle material particles if they exist
        if (materialData.Particles) {
            if (materialData.Particles.OnHit) {
                materialConfig.particlesOnHit = this.transformParticlesConfig(materialData.Particles.OnHit);
            }
            if (materialData.Particles.OnBreak) {
                materialConfig.particlesOnBreak = this.transformParticlesConfig(materialData.Particles.OnBreak);
            }
        }
        
        return materialConfig;
    }

    transformParticlesConfig(particlesData) {
        const particlesConfig = {
            enabled: true, // Assume enabled if particles are defined
            _disabled: {
                rgb: false,
                material: false
            }
        };

        // Only include particle properties that exist in the YAML
        if (particlesData.Name !== undefined) particlesConfig.name = particlesData.Name;
        if (particlesData.Material !== undefined) particlesConfig.material = particlesData.Material;
        if (particlesData.Force !== undefined) particlesConfig.force = particlesData.Force;
        if (particlesData.Amount !== undefined) particlesConfig.amount = particlesData.Amount.toString();
        if (particlesData.Size !== undefined) particlesConfig.size = particlesData.Size.toString();
        if (particlesData.Speed !== undefined) particlesConfig.speed = particlesData.Speed.toString();
        if (particlesData.DeltaX !== undefined) particlesConfig.deltaX = particlesData.DeltaX.toString();
        if (particlesData.DeltaY !== undefined) particlesConfig.deltaY = particlesData.DeltaY.toString();
        if (particlesData.DeltaZ !== undefined) particlesConfig.deltaZ = particlesData.DeltaZ.toString();
        if (particlesData.Red !== undefined) particlesConfig.red = particlesData.Red.toString();
        if (particlesData.Green !== undefined) particlesConfig.green = particlesData.Green.toString();
        if (particlesData.Blue !== undefined) particlesConfig.blue = particlesData.Blue.toString();

        return particlesConfig;
    }
    
    importConfig() {
        const textarea = this.modal.querySelector('#import-textarea');
        try {
            console.log('Starting import with config:', textarea.value);
            const config = this.parseYAML(textarea.value);
            
            // Transform the YAML structure to match the expected storage format
            const transformedConfig = this.transformFullConfig(config);
            
            // Update localStorage with the imported configuration
            localStorage.setItem('explosionConfigData', JSON.stringify(transformedConfig));
            
            // Show success message
            this.showSuccess('Configuration imported successfully! Reloading...');
            
            // Close the modal and then reload after a short delay
            setTimeout(() => {
                this.close();
                window.location.reload();
            }, 1500);
            
        } catch (e) {
            this.showError(`Failed to import configuration: ${e.message}`);
        }
    }

    // NEW: Detect if an entity:material pair is a group based on the Groups section
    isGroupPair(entityName, materialName, groupsConfig) {
        if (!groupsConfig) return false;
        
        // Check if entityName exists as a group in the Groups section
        const entityIsGroup = Object.keys(groupsConfig).some(groupName => 
            groupName === entityName
        );
        
        // Check if materialName exists as a group in the Groups section  
        const materialIsGroup = Object.keys(groupsConfig).some(groupName =>
            groupName === materialName
        );
        
        return entityIsGroup && materialIsGroup;
    }

    // Get group members from Groups section
    getGroupMembers(groupName, groupsConfig) {
        if (!groupsConfig || !groupsConfig[groupName]) return [];
        
        const members = groupsConfig[groupName];
        let result = [];
        
        // If it's an array, process each item
        if (Array.isArray(members)) {
            members.forEach(item => {
                if (Array.isArray(item)) {
                    // If item is an array, flatten it
                    result.push(...item);
                } else if (typeof item === 'string' && item.includes(',')) {
                    // If item contains commas, split and add each part
                    result.push(...item.split(',').map(i => i.trim()));
                } else {
                    // Otherwise add the item as is
                    result.push(item);
                }
            });
            return result;
        }
        
        // If it's a string, split by comma and trim each item
        if (typeof members === 'string') {
            return members.split(',').map(item => item.trim());
        }
        
        // If it's an object, convert to array of values
        if (typeof members === 'object' && members !== null) {
            return Object.values(members).flat();
        }
        
        // For any other case, wrap in array
        return [members];
    }

    transformFullConfig(yamlConfig) {
        const result = {
            vanilla: { pairs: {} },
            group: { pairs: {} }
        };

        if (!yamlConfig || typeof yamlConfig !== 'object') return result;

        console.log('Starting transformFullConfig with YAML:', yamlConfig);

        // Extract groups section for reference
        const groupsConfig = yamlConfig.Groups || {};
        console.log('Groups config found:', groupsConfig);

        // Process VanillaEntity section
        if (yamlConfig.VanillaEntity) {
            console.log('Processing VanillaEntity section');
            
            for (const [entityName, entityData] of Object.entries(yamlConfig.VanillaEntity)) {
                console.log(`Processing entity: ${entityName}`);
                
                if (entityData.Materials) {
                    for (const [materialName, materialData] of Object.entries(entityData.Materials)) {
                        if (materialName === 'Particles') continue;
                        
                        console.log(`Processing material: ${materialName}`);
                        
                        // Check if this is a group pair using the new detection method
                        const isGroup = this.isGroupPair(entityName, materialName, groupsConfig);
                        console.log(`Is group pair ${entityName}:${materialName}?`, isGroup);
                        
                        if (isGroup) {
                            // This is a GROUP configuration
                            console.log(`Creating GROUP configuration for ${entityName}:${materialName}`);
                            
                            const pairKey = `${entityName}:${materialName}`;
                            
                            // Transform entity properties
                            const entityConfig = this.transformEntityConfig(entityData.Properties || {});
                            entityConfig.name = entityName;
                            
                            // Transform material properties
                            const materialConfig = this.transformMaterialConfig(materialData);
                            materialConfig.name = materialName;
                            
                            // Get group members from Groups section and ensure they're properly formatted
                            let entityMembers = this.getGroupMembers(entityName, groupsConfig);
                            let materialMembers = this.getGroupMembers(materialName, groupsConfig);
                            
                            // Ensure we're working with flat arrays of strings
                            entityMembers = entityMembers.flat().map(String);
                            materialMembers = materialMembers.flat().map(String);
                            
                            console.log('Group members - Entity:', entityMembers, 'Material:', materialMembers);
                            
                            // Save the group configuration to localStorage
                            localStorage.setItem(`group_${entityName}_items`, JSON.stringify(entityMembers));
                            localStorage.setItem(`group_${materialName}_items`, JSON.stringify(materialMembers));
                            
                            // Handle material-level particles if they exist
                            const materialParticles = entityData.Materials?.Particles;
                            if (materialParticles && !materialConfig.particlesOnHit && !materialConfig.particlesOnBreak) {
                                if (materialParticles.OnHit) {
                                    materialConfig.particlesOnHit = this.transformParticlesConfig(materialParticles.OnHit);
                                }
                                if (materialParticles.OnBreak) {
                                    materialConfig.particlesOnBreak = this.transformParticlesConfig(materialParticles.OnBreak);
                                }
                            }
                            
                            // Create the group configuration
                            result.group.pairs[pairKey] = {
                                entity: entityConfig,
                                material: materialConfig,
                                entityMembers: entityMembers,
                                materialMembers: materialMembers
                            };
                            
                            console.log(`Created group: ${pairKey}`, result.group.pairs[pairKey]);
                            
                        } else {
                            // This is a VANILLA configuration
                            console.log(`Creating VANILLA configuration for ${entityName}:${materialName}`);
                            
                            const pairKey = `${entityName}:${materialName}`;
                            
                            // Transform entity properties
                            const entityConfig = this.transformEntityConfig(entityData.Properties || {});
                            entityConfig.name = entityName;
                            
                            // Transform material properties
                            const materialConfig = this.transformMaterialConfig(materialData);
                            materialConfig.name = materialName;
                            
                            // Handle material-level particles if they exist
                            const materialParticles = entityData.Materials?.Particles;
                            if (materialParticles && !materialConfig.particlesOnHit && !materialConfig.particlesOnBreak) {
                                if (materialParticles.OnHit) {
                                    materialConfig.particlesOnHit = this.transformParticlesConfig(materialParticles.OnHit);
                                }
                                if (materialParticles.OnBreak) {
                                    materialConfig.particlesOnBreak = this.transformParticlesConfig(materialParticles.OnBreak);
                                }
                            }
                            
                            result.vanilla.pairs[pairKey] = {
                                entity: entityConfig,
                                material: materialConfig
                            };
                            
                            console.log(`Created vanilla: ${pairKey}`, result.vanilla.pairs[pairKey]);
                        }
                    }
                }
            }
        }

        console.log('Final transformed config:', result);
        return result;
    }
    
    showError(message) {
        const previewContent = this.modal.querySelector('.import-preview-content');
        previewContent.innerHTML = `<div class="error">${message}</div>`;
    }
    
    showSuccess(message) {
        const previewContent = this.modal.querySelector('.import-preview-content');
        previewContent.innerHTML = `<div class="success">${message}</div>`;
    }

    open() {
        // Reset form
        this.modal.querySelector('#import-textarea').value = '';
        document.getElementById('import-file-name').textContent = 'No file selected';
        this.modal.querySelector('.import-preview-content').innerHTML = 
            '<p>Preview will appear here when valid configuration is provided</p>';
        
        // Show modal
        this.modal.style.display = 'flex';
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);
        
        // Focus the textarea
        setTimeout(() => {
            this.modal.querySelector('#import-textarea').focus();
        }, 100);
    }

    close() {
        this.modal.classList.remove('active');
        setTimeout(() => {
            this.modal.style.display = 'none';
            // Reset form when closing
            this.modal.querySelector('#import-textarea').value = '';
            document.getElementById('import-file-upload').value = '';
            document.getElementById('import-file-name').textContent = 'No file selected';
            this.modal.querySelector('.import-preview-content').innerHTML = 
                '<p>Preview will appear here when valid YAML is provided</p>';
        }, 300);
    }
}

// Create global instance of the modal
let importModal;
// Initialize welcome tab when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WelcomeTab();
});