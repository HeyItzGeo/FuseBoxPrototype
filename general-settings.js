// General Settings Module
const GeneralSettingsModule = (function() {
    // Private variables
    let isInitialized = false;
    const STORAGE_KEY = 'explodeAnyGeneralSettings';
    
    // Default settings
    const defaultSettings = {
        UseBlockDatabase: false,
        CheckBlockDatabaseAtStartup: false,
        BlockDurability: 100.0,
        EnableMetrics: true,
        LocalePrefix: "[ExplodeAny] ",
        Checktool: {
            AlwaysEnabled: false,
            EnabledByDefault: false,
            PreventActionWhenCheckingHandledBlocks: true,
            PreventActionWhenCheckingNonHandledBlocks: true,
            SilentWhenCheckingOnDisabledWorlds: false,
            SilentWhenCheckingWithoutPermissions: false,
            SilentWhenCheckingNonHandledBlocks: false,
            SilentWhenCheckingHandledBlocks: false,
            ShowBossBar: false,
            BossBarColor: 'PURPLE',
            BossBarStyle: 'SOLID',
            BossBarDuration: '1500ms'
        },
        Locale: {
            NotAllowed: "You are not allowed to perform this action!",
            Usage: "Usage: %DESCRIPTION%",
            OnlyPlayerAllowed: "Only players can perform this action!",
            PlayerDoesntExist: "Player %NAME% doesn't exist in the server!",
            PlayerIsOffline: "Player %NAME% must be online to perform that",
            EnterChecktoolMode: "You can now right-click a block with %PRETTY_ITEM% to display block durability",
            LeaveChecktoolMode: "You can no longer check for a block durability",
            ChecktoolToggledOn: "Checktool mode toggled on for player %NAME%",
            ChecktoolToggledOff: "Checktool mode toggled off for player %NAME%",
            ChecktoolUse: "Block health: %DURABILITY_PERCENTAGE%% (%PRETTY_MATERIAL%)",
            ChecktoolUseBossBar: "%PRETTY_MATERIAL%: %DURABILITY_PERCENTAGE%%",
            ChecktoolSet: "Checktool successfully set to %PRETTY_ITEM%!",
            ChecktoolNotPersisted: "Checktool item was set to %PRETTY_ITEM%, but it couldn't be persisted",
            ChecktoolGiven: "A checktool (%PRETTY_ITEM%) was given to player %NAME%",
            ChecktoolReset: "Checktool successfully reset to bare hand (Air)",
            ChecktoolNotHandled: "%PRETTY_MATERIAL% is not handled by the current configuration",
            ChecktoolInfo: "Current checktool item: %PRETTY_ITEM%",
            ChecktoolAlwaysEnabled: "Checktool can't be toggled off because it's always enabled",
            DisabledInThisWorld: "This functionality is disabled in this world",
            Reloaded: "Reloaded successfully!",
            DebugEnabled: "Debug mode has been enabled",
            DebugDisabled: "Debug mode has been disabled"
        }
    };

    // Load settings from localStorage
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem(STORAGE_KEY);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                return mergeDeep(defaultSettings, parsed);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        return JSON.parse(JSON.stringify(defaultSettings));
    }

    // Deep merge function
    function mergeDeep(target, source) {
        const output = Object.assign({}, target);
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    function isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // Save settings to localStorage
    function saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    function createSettingsForm() {
        const settings = loadSettings();
        
        return `
            <div class="settings-dashboard compact">
                <div class="settings-header">
                    <div class="header-content">
                        <div class="header-icon">⚙️</div>
                        <div class="header-text">
                            <h3>ExplodeAny Settings</h3>
                            <p>Configure your plugin settings</p>
                        </div>
                    </div>
                    <button id="resetSettings" class="btn btn-secondary btn-sm" title="Reset all settings to default">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">Reset</span>
                    </button>
                </div>
      

                <!-- Top Row: Basic Settings and Checktool Settings -->
                <div class="settings-top-row">
                    <!-- Column 1: Basic Settings -->
                    <div class="settings-column">
                        <section class="settings-section">
                            <div class="section-header">
                                <div class="section-icon">🔧</div>
                                <h2>Basic Settings</h2>
                            </div>
                            <div class="settings-group">
                                <div class="setting-item">
                                    <div class="setting-main">
                                        <label class="toggle">
                                            <input type="checkbox" id="UseBlockDatabase" ${settings.UseBlockDatabase ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <div class="setting-info">
                                            <div class="setting-label">
                                                <span class="setting-label-text">
                                                    Use Block Database
                                                    <span class="setting-hint tooltip-trigger">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Enables or disables the use of a block database for storing data. The database allows to persist damage data across server restarts, but the file where the data is stored might become large over time.</span>
                                                    </span>
                                                </span>
                                                <span class="setting-hint-text">Persist damage data across server restarts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-main">
                                        <label class="toggle">
                                            <input type="checkbox" id="CheckBlockDatabaseAtStartup" ${settings.CheckBlockDatabaseAtStartup ? 'checked' : ''} ${!settings.UseBlockDatabase ? 'disabled' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <div class="setting-info">
                                            <div class="setting-label">
                                                <span class="setting-label-text">
                                                    Check at Startup
                                                    <span class="setting-hint tooltip-trigger">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Checks the block database for consistency at plugin startup. Only relevant if UseBlockDatabase is enabled. It may reduce the size of the database by removing invalid entries.</span>
                                                    </span>
                                                </span>
                                                <span class="setting-hint-text">Verify database consistency</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-main">
                                        <div class="setting-info">
                                            <div class="setting-label">
                                                <span class="setting-label-text">
                                                    Block Durability
                                                    <span class="setting-hint tooltip-trigger">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Sets the default durability for all blocks, i.e., the health of the blocks managed by the plugin. Must be a positive number (minimum: 1).</span>
                                                    </span>
                                                </span>
                                                <span class="setting-hint-text">Default health for all blocks</span>
                                            </div>
                                        </div>
                                        <div class="number-input-container">
                                            <div class="number-box">
                                                <input type="text" 
                                                       id="BlockDurability" 
                                                       value="${settings.BlockDurability}" 
                                                       class="number-input">
                                                <div class="buttons">
                                                    <div class="button increment">▲</div>
                                                    <div class="button decrement">▼</div>
                                                </div>
                                            </div>
                                            <p class="error-msg" id="BlockDurabilityError">Value must be ≥ 1</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-main">
                                        <label class="toggle">
                                            <input type="checkbox" id="EnableMetrics" ${settings.EnableMetrics ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <div class="setting-info">
                                            <div class="setting-label">
                                                <span class="setting-label-text">
                                                    Enable Metrics
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Enables or disables plugin metrics (such as bStats). This helps the developers understand usage patterns and improve the plugin.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Enables or disables plugin metrics (such as bStats). This helps the developers understand usage patterns and improve the plugin.</span>
                                                    </span>
                                                </span>
                                                <span class="setting-hint-text">Share anonymous usage data</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Column 2: Checktool Settings -->
                    <div class="settings-column">
                        <section class="settings-section">
                            <div class="section-header">
                                <div class="section-icon">🔧</div>
                                <h2>Checktool Settings</h2>
                            </div>
                            
                            <!-- Main Toggles -->
                            <div class="settings-group">
                                <div class="setting-item">
                                    <div class="setting-main">
                                        <label class="toggle">
                                            <input type="checkbox" id="AlwaysEnabled" ${settings.Checktool.AlwaysEnabled ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <div class="setting-info">
                                            <div class="setting-label">
                                                <span class="setting-label-text">
                                                    Always Enabled
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="If set to true, the checktool will be always enabled (the player only needs the permission to use it). If set to false, then the checktool can be toggled on and off by the player, given the player has the permission to do so.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">If set to true, the checktool will be always enabled (the player only needs the permission to use it). If set to false, then the checktool can be toggled on and off by the player, given the player has the permission to do so.</span>
                                                    </span>
                                                </span>
                                                <span class="setting-hint-text">Checktool is always active with permission</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-main">
                                        <label class="toggle">
                                            <input type="checkbox" id="EnabledByDefault" ${settings.Checktool.EnabledByDefault ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <div class="setting-info">
                                            <div class="setting-label">
                                                <span class="setting-label-text">
                                                    Enabled By Default
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="If set to true, the checktool will be enabled by default. If set to false, the checktool will be disabled by default.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">If set to true, the checktool will be enabled by default. If set to false, the checktool will be disabled by default.</span>
                                                    </span>
                                                </span>
                                                <span class="setting-hint-text">Checktool starts active for permitted players</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-main">
                                        <label class="toggle">
                                            <input type="checkbox" id="ShowBossBar" ${settings.Checktool.ShowBossBar ? 'checked' : ''}>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <div class="setting-info">
                                            <div class="setting-label">
                                                <span class="setting-label-text">
                                                    Show Boss Bar
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="If set to true, a boss bar will be displayed to the player when they check a block's durability.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">If set to true, a boss bar will be displayed to the player when they check a block's durability.</span>
                                                    </span>
                                                </span>
                                                <span class="setting-hint-text">Display durability in boss bar</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Boss Bar Settings (Conditional) -->
                            <div class="nested-section ${settings.Checktool.ShowBossBar ? 'active' : ''}">
                                <div class="nested-header">
                                    <span class="setting-label-text">
                                        Boss Bar Display
                                        <span class="setting-hint tooltip-trigger" data-tooltip="Customize how the boss bar appears when checking block durability">
                                            <span class="tooltip-icon">i</span>
                                            <span class="tooltip-text">Customize how the boss bar appears when checking block durability</span>
                                        </span>
                                    </span>
                                </div>
                                <div class="nested-grid">
                                    <div class="nested-item">
                                        <div class="nested-label">
                                            <span class="setting-label-text">
                                                Color
                                                <span class="setting-hint tooltip-trigger" data-tooltip="Color of the boss bar that will be displayed to the player when checking block durability. Allowed values: PINK, BLUE, RED, GREEN, YELLOW, PURPLE, WHITE.">
                                                    <span class="tooltip-icon">i</span>
                                                    <span class="tooltip-text">Color of the boss bar that will be displayed to the player when checking block durability. Allowed values: PINK, BLUE, RED, GREEN, YELLOW, PURPLE, WHITE.</span>
                                                </span>
                                            </span>
                                        </div>
                                        <select id="BossBarColor" ${!settings.Checktool.ShowBossBar ? 'disabled' : ''}>
                                            ${['PINK', 'BLUE', 'RED', 'GREEN', 'YELLOW', 'PURPLE', 'WHITE'].map(color => 
                                                `<option value="${color}" ${settings.Checktool.BossBarColor === color ? 'selected' : ''}>${color}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="nested-item">
                                        <div class="nested-label">
                                            <span class="setting-label-text">
                                                Style
                                                <span class="setting-hint tooltip-trigger" data-tooltip="Style of the boss bar that will be displayed to the player when checking block durability. Allowed values: SOLID, SEGMENTED_6, SEGMENTED_10, SEGMENTED_12, SEGMENTED_20.">
                                                    <span class="tooltip-icon">i</span>
                                                    <span class="tooltip-text">Style of the boss bar that will be displayed to the player when checking block durability. Allowed values: SOLID, SEGMENTED_6, SEGMENTED_10, SEGMENTED_12, SEGMENTED_20.</span>
                                                </span>
                                            </span>
                                        </div>
                                        <select id="BossBarStyle" ${!settings.Checktool.ShowBossBar ? 'disabled' : ''}>
                                            ${['SOLID', 'SEGMENTED_6', 'SEGMENTED_10', 'SEGMENTED_12', 'SEGMENTED_20'].map(style => 
                                                `<option value="${style}" ${settings.Checktool.BossBarStyle === style ? 'selected' : ''}>${style}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="nested-item full-width">
                                        <div class="nested-label">
                                            <span class="setting-label-text">
                                                Duration
                                                <span class="setting-hint tooltip-trigger" data-tooltip="Duration in milliseconds that the boss bar will be displayed to the player when checking block durability. Example: 1500 for 1.5 seconds.">
                                                    <span class="tooltip-icon">i</span>
                                                    <span class="tooltip-text">Duration in milliseconds that the boss bar will be displayed to the player when checking block durability. Example: 1500 for 1.5 seconds.</span>
                                                </span>
                                            </span>
                                        </div>
                                        <input type="text" id="BossBarDuration" value="${settings.Checktool.BossBarDuration}" ${!settings.Checktool.ShowBossBar ? 'disabled' : ''} placeholder="1500ms">
                                    </div>
                                </div>
                            </div>

                            <!-- Checkbox Groups -->
                            <div class="checkbox-section">
                                <div class="checkbox-group">
                                    <div class="group-header">
                                        <span class="setting-label-text">
                                            Prevent Actions
                                            <span class="setting-hint tooltip-trigger" data-tooltip="Prevents the default vanilla behavior of the item when used as a checktool.">
                                                <span class="tooltip-icon">i</span>
                                                <span class="tooltip-text">Prevents the default vanilla behavior of the item when used as a checktool.</span>
                                            </span>
                                        </span>
                                    </div>
                                    <div class="group-description">Block default item behavior</div>
                                    <div class="checkbox-grid">
                                        <label class="checkbox">
                                            <input type="checkbox" id="PreventActionWhenCheckingHandledBlocks" ${settings.Checktool.PreventActionWhenCheckingHandledBlocks ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            <div class="checkbox-label">
                                                <span class="setting-label-text">
                                                    Handled Blocks
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Prevents the default vanilla behavior of the item when right-clicking blocks that are handled by the plugin.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Prevents the default vanilla behavior of the item when right-clicking blocks that are handled by the plugin.</span>
                                                    </span>
                                                </span>
                                            </div>
                                        </label>
                                        <label class="checkbox">
                                            <input type="checkbox" id="PreventActionWhenCheckingNonHandledBlocks" ${settings.Checktool.PreventActionWhenCheckingNonHandledBlocks ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            <div class="checkbox-label">
                                                <span class="setting-label-text">
                                                    Non-Handled Blocks
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="Prevents the default vanilla behavior of the item when right-clicking blocks that are not handled by the plugin.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">Prevents the default vanilla behavior of the item when right-clicking blocks that are not handled by the plugin.</span>
                                                    </span>
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div class="checkbox-group">
                                    <div class="group-header">
                                        <span class="setting-label-text">
                                            Silent Mode
                                            <span class="setting-hint tooltip-trigger" data-tooltip="Control which messages are suppressed when using the checktool">
                                                <span class="tooltip-icon">i</span>
                                                <span class="tooltip-text">Control which messages are suppressed when using the checktool</span>
                                            </span>
                                        </span>
                                    </div>
                                    <div class="group-description">Suppress messages in these cases:</div>
                                    <div class="checkbox-grid">
                                        <label class="checkbox">
                                            <input type="checkbox" id="SilentWhenCheckingOnDisabledWorlds" ${settings.Checktool.SilentWhenCheckingOnDisabledWorlds ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            <div class="checkbox-label">
                                                <span class="setting-label-text">
                                                    Disabled Worlds
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="If enabled, no message is shown when using the checktool in worlds where ExplodeAny is disabled. If disabled, players will be informed that the functionality is disabled in that world.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">If enabled, no message is shown when using the checktool in worlds where ExplodeAny is disabled. If disabled, players will be informed that the functionality is disabled in that world.</span>
                                                    </span>
                                                </span>
                                            </div>
                                        </label>
                                        <label class="checkbox">
                                            <input type="checkbox" id="SilentWhenCheckingWithoutPermissions" ${settings.Checktool.SilentWhenCheckingWithoutPermissions ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            <div class="checkbox-label">
                                                <span class="setting-label-text">
                                                    No Permissions
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="If enabled, no message is shown when a player without permission uses the checktool. If disabled, players will be informed they don't have permission.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">If enabled, no message is shown when a player without permission uses the checktool. If disabled, players will be informed they don't have permission.</span>
                                                    </span>
                                                </span>
                                            </div>
                                        </label>
                                        <label class="checkbox">
                                            <input type="checkbox" id="SilentWhenCheckingNonHandledBlocks" ${settings.Checktool.SilentWhenCheckingNonHandledBlocks ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            <div class="checkbox-label">
                                                <span class="setting-label-text">
                                                    Non-Handled Blocks
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="If enabled, no message is shown when checking blocks not handled by the plugin. If disabled, players will be informed that the block is not handled.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">If enabled, no message is shown when checking blocks not handled by the plugin. If disabled, players will be informed that the block is not handled.</span>
                                                    </span>
                                                </span>
                                            </div>
                                        </label>
                                        <label class="checkbox">
                                            <input type="checkbox" id="SilentWhenCheckingHandledBlocks" ${settings.Checktool.SilentWhenCheckingHandledBlocks ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            <div class="checkbox-label">
                                                <span class="setting-label-text">
                                                    Handled Blocks
                                                    <span class="setting-hint tooltip-trigger" data-tooltip="If enabled, no message is shown when checking blocks handled by the plugin. If disabled, players will see the block's durability.">
                                                        <span class="tooltip-icon">i</span>
                                                        <span class="tooltip-text">If enabled, no message is shown when checking blocks handled by the plugin. If disabled, players will see the block's durability.</span>
                                                    </span>
                                                </span>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Column 3: Localization -->
                    <div class="settings-column">
                        <section class="settings-section">
                            <div class="section-header">
                                <div class="section-icon">🌐</div>
                                <h2>Localization</h2>
                            </div>
                            
                            <div class="localization-container">
                                <!-- Left Column -->
                                <div class="localization-column">
                                    <!-- Message Prefix -->
                                    <div class="message-item">
                                        <label for="LocalePrefix">Message Prefix</label>
                                        <input type="text" id="LocalePrefix" value="${settings.LocalePrefix}" class="message-input" placeholder="[ExplodeAny] ">
                                        <div class="setting-description">Prefix for all player messages</div>
                                    </div>

                                    <!-- Essential Messages -->
                                    <div class="message-group">
                                        <h3>Essential Messages</h3>
                                        <div class="message-grid">
                                            <div class="message-item">
                                                <label for="NotAllowed">Not Allowed</label>
                                                <textarea id="NotAllowed" class="message-input">${settings.Locale.NotAllowed}</textarea>
                                            </div>
                                            <div class="message-item">
                                                <label for="Usage">Usage</label>
                                                <textarea id="Usage" class="message-input">${settings.Locale.Usage}</textarea>
                                            </div>
                                            <div class="message-item">
                                                <label for="OnlyPlayerAllowed">Only Player Allowed</label>
                                                <textarea id="OnlyPlayerAllowed" class="message-input">${settings.Locale.OnlyPlayerAllowed}</textarea>
                                            </div>
                                            <div class="message-item">
                                                <label for="PlayerDoesntExist">Player Doesn't Exist</label>
                                                <textarea id="PlayerDoesntExist" class="message-input">${settings.Locale.PlayerDoesntExist}</textarea>
                                            </div>
                                            <div class="message-item">
                                                <label for="PlayerIsOffline">Player Is Offline</label>
                                                <textarea id="PlayerIsOffline" class="message-input">${settings.Locale.PlayerIsOffline}</textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Right Column -->
                                <div class="localization-column">
                                    <!-- Checktool Messages -->
                                    <div class="message-group">
                                        <h3>Checktool Messages</h3>
                                        <div class="message-grid">
                                            <div class="message-item">
                                                <label for="EnterChecktoolMode">Enter Checktool Mode</label>
                                                <textarea id="EnterChecktoolMode" class="message-input">${settings.Locale.EnterChecktoolMode}</textarea>
                                            </div>
                                            <div class="message-item">
                                                <label for="LeaveChecktoolMode">Leave Checktool Mode</label>
                                                <textarea id="LeaveChecktoolMode" class="message-input">${settings.Locale.LeaveChecktoolMode}</textarea>
                                            </div>
                                            <div class="message-item">
                                                <label for="ChecktoolUse">Checktool Use</label>
                                                <textarea id="ChecktoolUse" class="message-input">${settings.Locale.ChecktoolUse}</textarea>
                                            </div>
                                            <div class="message-item">
                                                <label for="ChecktoolUseBossBar">Checktool Boss Bar</label>
                                                <textarea id="ChecktoolUseBossBar" class="message-input">${settings.Locale.ChecktoolUseBossBar}</textarea>
                                            </div>
                                            <div class="message-item">
                                                <label for="ChecktoolNotHandled">Checktool Not Handled</label>
                                                <textarea id="ChecktoolNotHandled" class="message-input">${settings.Locale.ChecktoolNotHandled}</textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Advanced Localization Messages -->
                            <div class="advanced-section">
                                <div class="advanced-toggle" id="advancedToggle">
                                    <span class="toggle-icon">📋</span>
                                    <span>Advanced Localization Messages</span>
                                    <span class="toggle-arrow">▼</span>
                                </div>
                    <div class="advanced-content" id="advancedContent">
                        <div class="advanced-grid">
                            <div class="message-item">
                                <label for="ChecktoolToggledOn">Checktool Toggled On</label>
                                <textarea id="ChecktoolToggledOn" class="message-input">${settings.Locale.ChecktoolToggledOn}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="ChecktoolToggledOff">Checktool Toggled Off</label>
                                <textarea id="ChecktoolToggledOff" class="message-input">${settings.Locale.ChecktoolToggledOff}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="ChecktoolSet">Checktool Set</label>
                                <textarea id="ChecktoolSet" class="message-input">${settings.Locale.ChecktoolSet}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="ChecktoolNotPersisted">Checktool Not Persisted</label>
                                <textarea id="ChecktoolNotPersisted" class="message-input">${settings.Locale.ChecktoolNotPersisted}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="ChecktoolGiven">Checktool Given</label>
                                <textarea id="ChecktoolGiven" class="message-input">${settings.Locale.ChecktoolGiven}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="ChecktoolReset">Checktool Reset</label>
                                <textarea id="ChecktoolReset" class="message-input">${settings.Locale.ChecktoolReset}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="ChecktoolInfo">Checktool Info</label>
                                <textarea id="ChecktoolInfo" class="message-input">${settings.Locale.ChecktoolInfo}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="ChecktoolAlwaysEnabled">Checktool Always Enabled</label>
                                <textarea id="ChecktoolAlwaysEnabled" class="message-input">${settings.Locale.ChecktoolAlwaysEnabled}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="DisabledInThisWorld">Disabled In This World</label>
                                <textarea id="DisabledInThisWorld" class="message-input">${settings.Locale.DisabledInThisWorld}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="Reloaded">Reloaded</label>
                                <textarea id="Reloaded" class="message-input">${settings.Locale.Reloaded}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="DebugEnabled">Debug Enabled</label>
                                <textarea id="DebugEnabled" class="message-input">${settings.Locale.DebugEnabled}</textarea>
                            </div>
                            <div class="message-item">
                                <label for="DebugDisabled">Debug Disabled</label>
                                <textarea id="DebugDisabled" class="message-input">${settings.Locale.DebugDisabled}</textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>
            </div>

        `;
    }

    // Save settings from form
    function saveSettingsFromForm() {
        const settings = {
            UseBlockDatabase: document.getElementById('UseBlockDatabase').checked,
            CheckBlockDatabaseAtStartup: document.getElementById('CheckBlockDatabaseAtStartup').checked,
            BlockDurability: parseFloat(document.getElementById('BlockDurability').value) || 100.0,
            EnableMetrics: document.getElementById('EnableMetrics').checked,
            LocalePrefix: document.getElementById('LocalePrefix').value,
            Checktool: {
                AlwaysEnabled: document.getElementById('AlwaysEnabled').checked,
                EnabledByDefault: document.getElementById('EnabledByDefault').checked,
                PreventActionWhenCheckingHandledBlocks: document.getElementById('PreventActionWhenCheckingHandledBlocks').checked,
                PreventActionWhenCheckingNonHandledBlocks: document.getElementById('PreventActionWhenCheckingNonHandledBlocks').checked,
                SilentWhenCheckingOnDisabledWorlds: document.getElementById('SilentWhenCheckingOnDisabledWorlds').checked,
                SilentWhenCheckingWithoutPermissions: document.getElementById('SilentWhenCheckingWithoutPermissions').checked,
                SilentWhenCheckingNonHandledBlocks: document.getElementById('SilentWhenCheckingNonHandledBlocks').checked,
                SilentWhenCheckingHandledBlocks: document.getElementById('SilentWhenCheckingHandledBlocks').checked,
                ShowBossBar: document.getElementById('ShowBossBar').checked,
                BossBarColor: document.getElementById('BossBarColor').value,
                BossBarStyle: document.getElementById('BossBarStyle').value,
                BossBarDuration: document.getElementById('BossBarDuration').value
            },
            Locale: {
                NotAllowed: document.getElementById('NotAllowed').value,
                Usage: document.getElementById('Usage').value,
                OnlyPlayerAllowed: document.getElementById('OnlyPlayerAllowed').value,
                PlayerDoesntExist: document.getElementById('PlayerDoesntExist').value,
                PlayerIsOffline: document.getElementById('PlayerIsOffline').value,
                EnterChecktoolMode: document.getElementById('EnterChecktoolMode').value,
                LeaveChecktoolMode: document.getElementById('LeaveChecktoolMode').value,
                ChecktoolToggledOn: document.getElementById('ChecktoolToggledOn').value,
                ChecktoolToggledOff: document.getElementById('ChecktoolToggledOff').value,
                ChecktoolUse: document.getElementById('ChecktoolUse').value,
                ChecktoolUseBossBar: document.getElementById('ChecktoolUseBossBar').value,
                ChecktoolSet: document.getElementById('ChecktoolSet').value,
                ChecktoolNotPersisted: document.getElementById('ChecktoolNotPersisted').value,
                ChecktoolGiven: document.getElementById('ChecktoolGiven').value,
                ChecktoolReset: document.getElementById('ChecktoolReset').value,
                ChecktoolNotHandled: document.getElementById('ChecktoolNotHandled').value,
                ChecktoolInfo: document.getElementById('ChecktoolInfo').value,
                ChecktoolAlwaysEnabled: document.getElementById('ChecktoolAlwaysEnabled').value,
                DisabledInThisWorld: document.getElementById('DisabledInThisWorld').value,
                Reloaded: document.getElementById('Reloaded').value,
                DebugEnabled: document.getElementById('DebugEnabled').value,
                DebugDisabled: document.getElementById('DebugDisabled').value
            }
        };

        // Validate block durability
        if (settings.BlockDurability < 1) {
            window.showNotification('Block durability must be at least 1', 'error');
            return false;
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            window.showNotification('Failed to save settings.', 'error');
            return false;
        }
    }

    // Reset settings to defaults
    function resetToDefaults() {
        localStorage.removeItem(STORAGE_KEY);
        window.showNotification('Settings reset to defaults!', 'success');
        // Reload the form with default values instead of page reload
        const container = document.getElementById('general-settings-container');
        container.innerHTML = createSettingsForm();
        setupEventListeners();
    }



    // Track previous values of inputs
    const previousValues = new WeakMap();

    // Save settings when user leaves an input or changes a checkbox/select
    function saveOnChange(event) {
        const element = event.target;
        let currentValue = element.type === 'checkbox' ? element.checked : element.value;
        
        // Convert to number for BlockDurability
        if (element.id === 'BlockDurability') {
            currentValue = parseFloat(currentValue);
            if (isNaN(currentValue) || currentValue < 1) {
                window.showNotification('Block durability must be at least 1', 'error');
                element.value = previousValues.get(element) || 100;
                return;
            }
        }
        
        const previousValue = previousValues.get(element);
        
        // Only proceed if the value actually changed
        if (currentValue !== previousValue) {
            previousValues.set(element, currentValue);
            const result = saveSettingsFromForm();
            
            // If save failed, revert the value
            if (result === false && element.id === 'BlockDurability') {
                element.value = previousValues.get(element) || 100;
            }
        }
    }

    // Shake animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);

    // Number input functionality
    function setupNumberInput() {
        const input = document.getElementById('BlockDurability');
        const box = input?.closest('.number-box');
        const incrementBtn = box?.querySelector('.increment');
        const decrementBtn = box?.querySelector('.decrement');
        const errorMsg = document.getElementById('BlockDurabilityError');
        
        if (!input || !box || !incrementBtn || !decrementBtn || !errorMsg) return;
        
        // Store previous valid value
        let previousValue = parseFloat(input.value) || 1;
        
        // Validate and update value
        function validateAndUpdate(value) {
            const num = parseFloat(value);
            if (isNaN(num) || num < 1) {
                box.classList.add('error');
                errorMsg.style.display = 'block';
                input.value = previousValue.toFixed(1);
                return false;
            }
            
            // Update value and save if changed
            if (num !== previousValue) {
                previousValue = num;
                input.value = num % 1 === 0 ? num.toString() : num.toFixed(1);
                saveSettingsFromForm();
            }
            
            box.classList.remove('error');
            errorMsg.style.display = 'none';
            return true;
        }
        
        // Button click handlers
        incrementBtn.addEventListener('click', () => {
            const newValue = (parseFloat(input.value) || 0) + 1;
            input.value = newValue % 1 === 0 ? newValue.toString() : newValue.toFixed(1);
            validateAndUpdate(input.value);
        });
        
        decrementBtn.addEventListener('click', () => {
            const newValue = Math.max(1, (parseFloat(input.value) || 1) - 1);
            input.value = newValue % 1 === 0 ? newValue.toString() : newValue.toFixed(1);
            validateAndUpdate(input.value);
        });
        
        // Input validation
        // Input validation
        input.addEventListener('input', (e) => {
            // Allow numbers and decimal point
            input.value = input.value.replace(/[^0-9.]/g, '');
            
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
            const newValue = currentValue + (direction * 0.1);
            input.value = newValue.toFixed(1);
            validateAndUpdate(input.value);
        }, { passive: false });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        const container = document.getElementById('general-settings-container');
        if (!container) return;
        
        // Setup number input
        setupNumberInput();
        
        // Add appropriate event listeners to form elements
        container.querySelectorAll('input, select, textarea').forEach(element => {
            // Store initial values
            previousValues.set(element, element.type === 'checkbox' ? element.checked : element.value);
            
            if (element.type === 'checkbox' || element.tagName === 'SELECT') {
                // For checkboxes and selects, use change event
                element.addEventListener('change', saveOnChange);
            } else {
                // For text inputs, use blur event (when leaving the field)
                element.addEventListener('blur', saveOnChange);
            }
        });

        // Toggle boss bar options based on showBossBar
        const bossBarCheckbox = document.getElementById('ShowBossBar');
        if (bossBarCheckbox) {
            const updateBossBarFields = () => {
                const isEnabled = bossBarCheckbox.checked;
                ['BossBarDuration', 'BossBarColor', 'BossBarStyle'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.disabled = !isEnabled;
                });
                
                const nestedSettings = bossBarCheckbox.closest('.settings-section')?.querySelector('.nested-section');
                if (nestedSettings) {
                    nestedSettings.classList.toggle('active', isEnabled);
                }
            };
            
            updateBossBarFields();
            bossBarCheckbox.addEventListener('change', updateBossBarFields);
        }

        // Simple advanced section toggle
        const advancedToggle = document.getElementById('advancedToggle');
        const advancedContent = document.getElementById('advancedContent');
        const arrow = advancedToggle?.querySelector('.toggle-arrow');
        
        if (advancedToggle && advancedContent && arrow) {
            advancedToggle.addEventListener('click', () => {
                const isActive = advancedContent.classList.toggle('active');
                arrow.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
                
                // Smooth scroll to show more content when opening
                if (isActive) {
                    setTimeout(() => {
                        advancedContent.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            inline: 'nearest'
                        });
                        // Scroll a bit more to show more content
               
                    }, 10);
                }
            });
        }

        // Reset to defaults
        const resetButton = document.getElementById('resetSettings');
        if (resetButton) {
            resetButton.addEventListener('click', resetToDefaults);
        }
    }

    // Initialize the module
    function init() {
        if (isInitialized) return;
        
        // Get or create the container
        let container = document.getElementById('general-settings-container');
        
        if (!container) {
            // If container doesn't exist, create it
            container = document.createElement('div');
            container.id = 'general-settings-container';
            document.body.appendChild(container);
        }
        
        // Add the settings form to the container
        container.innerHTML = createSettingsForm();
        
        // Setup event listeners
        setupEventListeners();
        isInitialized = true;
    }

    // Public methods
    return {
        init: init,
        getSettings: loadSettings,
        resetToDefaults: resetToDefaults
    };
})();

// Initialize when the DOM is fully loaded
function initializeGeneralSettings() {
    GeneralSettingsModule.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGeneralSettings);
} else {
    initializeGeneralSettings();
}

// Make GeneralSettingsModule globally accessible
window.GeneralSettingsModule = GeneralSettingsModule;

