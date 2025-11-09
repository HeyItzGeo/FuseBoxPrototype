class TutorialManager {
    constructor(steps = []) {
        this.steps = steps;
        this.currentStep = 0;
        this.highlightedElement = null;
        this.highlightedElements = null;
        this.modal = null;
        this.init();
    }

    init() {
        this.createPopup();
        this.setupEventListeners();
    }

    createPopup() {
        // Create or get the overlay
        let overlay = document.querySelector('.tutorial-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'tutorial-overlay';
            document.body.appendChild(overlay);
            this.overlay = overlay;
        }

        // Create or get the popup
        let popup = document.getElementById('tutorial-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'tutorial-popup';
            popup.className = 'tutorial-popup';
            document.body.appendChild(popup);
        }
        this.popup = popup;
        this.updatePopupContent();
    }

    updatePopupContent() {
        if (this.currentStep < 0 || this.currentStep >= this.steps.length) {
            this.closeTutorial();
            return;
        }

        const step = this.steps[this.currentStep];
        
        this.removeHighlight();
        
        // Show/hide overlay based on whether this is the welcome step
        const isWelcomeStep = this.currentStep === 0;
        if (this.overlay) {
            this.overlay.style.display = isWelcomeStep ? 'none' : 'block';
        }
        
        if (step.onShow && typeof step.onShow === 'function') {
            step.onShow.call(this);
        }
        
        if (step.target) {
            if (step.multipleTargets) {
                const elements = document.querySelectorAll(step.target);
                this.highlightedElements = [];
                elements.forEach(el => {
                    el.classList.add('tutorial-highlight');
                    this.highlightedElements.push(el);
                });
            } else {
                this.highlightElement(step.target);
            }
        }

        this.popup.innerHTML = this.generatePopupHTML(step);
        
        setTimeout(() => this.popup.classList.add('show'), 10);
    }

    generatePopupHTML(step) {
        const isFirstStep = this.currentStep === 0;
        const isLastStep = this.currentStep === this.steps.length - 1;
        
        return `
            <div class="tutorial-card">
                <div class="tutorial-progress">
                    ${this.steps.map((_, i) => 
                        `<div class="progress-step ${i === this.currentStep ? 'active' : ''} ${i < this.currentStep ? 'completed' : ''}"></div>`
                    ).join('')}
                </div>
                <div class="tutorial-content">
                    <h3>${step.title || 'Tutorial'}</h3>
                    <p>${step.content}</p>
                    <div class="tutorial-actions">
                        ${this.currentStep > 0 ? 
                            `<button class="btn-ghost" id="tutorial-prev">
                                <i class="fas fa-arrow-left"></i> Back
                            </button>` : 
                            `<button class="btn-ghost" id="tutorial-skip">
                                Skip Tutorial
                            </button>`
                        }
                        <button class="btn-primary" id="tutorial-next">
                            ${isFirstStep ? 'Start' : isLastStep ? 'Finish' : 'Next'}
                            <i class="fas ${isLastStep ? 'fa-check' : 'fa-arrow-right'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        this.highlightedElement = element;
        element.classList.add('tutorial-highlight');
        
        if (element.closest('.settings-dashboard')) {
            return;
        }
        
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    }

    removeHighlight() {
        if (this.highlightedElement) {
            this.highlightedElement.classList.remove('tutorial-highlight');
            this.highlightedElement = null;
        }
        
        if (this.highlightedElements) {
            this.highlightedElements.forEach(el => {
                if (el) el.classList.remove('tutorial-highlight');
            });
            this.highlightedElements = [];
        }
    }

    setupEventListeners() {
        this.popup.addEventListener('click', (e) => {
            if (e.target.closest('#tutorial-next')) {
                this.nextStep();
            } else if (e.target.closest('#tutorial-prev')) {
                this.previousStep();
            } else if (e.target.closest('#tutorial-skip')) {
                this.closeTutorial();
            }
        });
    }

    nextStep() {
        const currentStep = this.steps[this.currentStep];
        if (currentStep && typeof currentStep.onNext === 'function') {
            const shouldProceed = currentStep.onNext.call(this);
            if (shouldProceed === false) return;
        }
        
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updatePopupContent();
        } else {
            this.closeTutorial();
        }
    }

    previousStep() {
        const currentStep = this.steps[this.currentStep];
        if (currentStep && typeof currentStep.onHide === 'function') {
            currentStep.onHide.call(this);
        }
        
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updatePopupContent();
        }
    }

    closeTutorial() {
        // Remove the popup
        if (this.popup) {
            this.popup.classList.remove('show');
            setTimeout(() => {
                if (this.popup && this.popup.parentNode) {
                    this.popup.parentNode.removeChild(this.popup);
                }
            }, 300);
        }

        // Remove the overlay
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }

        this.removeHighlight();
        localStorage.setItem('tutorialShown', 'true');
        
        // Ensure tutorial helper button is visible when tutorial is closed
        updateTutorialButtonVisibility();
    }
}

// Tutorial Step Definitions
const TutorialSteps = {
    // Welcome and Introduction
    WELCOME: {
        title: 'Welcome to FuseBox!',
        content: 'Ready to create amazing explosions? Our quick guide will show you how to get started in no time.',
        target: null,
        onShow: null
    },

    // Vanilla Manager Section
    VANILLA_MANAGER: {
        title: 'Vanilla Manager',
        content: 'The Vanilla Tab is used to Add a pair of Entity | Material combo to the config',
        target: 'button.tab[data-tab="vanilla"]',
        onShow: function() {
            const vanillaTab = document.querySelector('button.tab[data-tab="vanilla"]');
            if (vanillaTab) vanillaTab.click();
        },
        onHide: function() {
            this.ensureTabActive('welcome');
        }
    },

    VANILLA_INPUTS: {
        title: 'Vanilla Inputs',
        content: 'Both an Entity and Material can be clicked to open a modal for each',
        target: '#vanilla-entity-name, #vanilla-material-name',
        multipleTargets: true,
        onShow: function() {
            const vanillaTab = document.querySelector('button.tab[data-tab="vanilla"]');
            if (vanillaTab && !vanillaTab.classList.contains('active')) {
                vanillaTab.click();
            }
        }
    },

    ENTITY_SELECTION: {
        title: 'Entity Selection',
        content: 'This is a list of Minecraft entities. Please select an entity from the list. The first entity is highlighted for you. Click Next when done.',
        target: '.item-option',
        onShow: function() {
            this.modal = null;
            const entityInput = document.getElementById('vanilla-entity-name');
            if (entityInput) {
                entityInput.focus();
                setTimeout(() => {
                    const modal = document.querySelector('.item-selector-modal.active');
                    if (modal) {
                        this.modal = modal;
                        const options = Array.from(modal.querySelectorAll('.item-option'));
                        if (options.length > 0) {
                            const firstOption = options[0];
                            firstOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                            firstOption.style.backgroundColor = 'rgba(110, 142, 251, 0.1)';
                            firstOption.style.borderLeft = '3px solid #6e8efb';
                            firstOption.style.paddingLeft = '8px';
                        }
                    }
                }, 1000);
            }
        },
        onNext: function() {
            const entityInput = document.getElementById('vanilla-entity-name');
            if (this.modal) {
                const closeBtn = this.modal.querySelector('.item-selector-close');
                if (closeBtn) closeBtn.click();
            }
            // Auto-select the first option if none is selected
            if (entityInput && !entityInput.value) {
                entityInput.value = 'Wither';
                if (window.configManager) {
                    window.configManager.setValue('vanilla-entity-name', 'Wither');
                }
            }
            return true;
        },
        onHide: function() {
            this.closeModal();
        }
    },

    WITHER_SELECTED: {
        title: 'Wither Selected',
        content: 'You\'ve selected Wither',
        onShow: function() {
            this.selectFirstOptionAndClose('vanilla-entity-name', 'Wither');
        }
    },

    MATERIAL_SELECTION: {
        title: 'Material Selection',
        content: 'This is a list of Minecraft materials. Please select a material from the list. The first material is highlighted for you. Click Next when done.',
        target: '.item-option',
        onShow: function() {
            this.modal = null;
            const materialInput = document.getElementById('vanilla-material-name');
            if (materialInput) {
                materialInput.focus();
                setTimeout(() => {
                    const modal = document.querySelector('.item-selector-modal.active');
                    if (modal) {
                        this.modal = modal;
                        const options = Array.from(modal.querySelectorAll('.item-option'));
                        if (options.length > 0) {
                            const firstOption = options[0];
                            firstOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                            firstOption.style.backgroundColor = 'rgba(110, 142, 251, 0.1)';
                            firstOption.style.borderLeft = '3px solid #6e8efb';
                            firstOption.style.paddingLeft = '8px';
                        }
                    }
                }, 1000);
            }
        },
        onNext: function() {
            const materialInput = document.getElementById('vanilla-material-name');
            if (this.modal) {
                const closeBtn = this.modal.querySelector('.item-selector-close');
                if (closeBtn) closeBtn.click();
            }
            // Auto-select the first option if none is selected
            if (materialInput && !materialInput.value) {
                materialInput.value = 'STONE';
                if (window.configManager) {
                    window.configManager.setValue('vanilla-material-name', 'STONE');
                }
            }
            return true;
        },
        onHide: function() {
            this.closeModal();
        }
    },

    STONE_SELECTED: {
        title: 'Stone Selected',
        content: 'You\'ve selected Stone',
        onShow: function() {
            this.selectFirstOptionAndClose('vanilla-material-name', 'STONE');
        }
    },

    SAVE_VANILLA: {
        title: 'Save Configuration',
        content: 'Click the Next button below to save your configuration. You only need an entity and a material to continue. You can always come back and edit the values later.',
        target: '#save-vanilla-pair',
        onShow: function() {
            this.flashElement('#save-vanilla-pair');
        },
        onNext: function() {
            this.clickElement('#save-vanilla-pair');
        },
        onHide: function() {
            this.removeFlashFromElement('#save-vanilla-pair');
        }
    },

    // Group Manager Section
    GROUP_MANAGER: {
        title: 'Group Manager',
        content: 'The Group tab is used to add multiple entities | materials under one group entity | material name',
        target: 'button.tab[data-tab="group"]',
        onShow: function() {
            setTimeout(() => {
                const groupTab = document.querySelector('button.tab[data-tab="group"]');
                if (groupTab && !groupTab.classList.contains('active')) {
                    groupTab.click();
                }
            }, 100);
        },
        onHide: function() {
            const vanillaTab = document.querySelector('button.tab[data-tab="vanilla"]');
            if (vanillaTab && !vanillaTab.classList.contains('active')) {
                vanillaTab.click();
            }
        }
    },

    GROUP_INPUTS: {
        title: 'Group Inputs',
        content: 'Groups can have multiple Entity | Material added.\n\nClick on the entity input to open the selection modal.',
        target: '#new-entity',
        onShow: function() {
            this.ensureTabActive('group');
            setTimeout(() => {
                const firstInput = document.querySelector('#new-entity');
                if (firstInput) {
                    firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    },

    GROUP_ENTITY_SELECTION: {
        title: 'Select Multiple Entities',
        content: 'You can select multiple entities for this group. The first three entities will be selected automatically. Click Next to confirm your selections.',
        target: '.item-option',
        onShow: function() {
            this.prepareMultipleSelection('new-entity', 3);
        },
        onNext: function() {
            this.finalizeMultipleSelection(3);
            return true;
        },
        onHide: function() {
            this.cleanupMultipleSelection('new-entity');
        }
    },

    GROUP_MATERIAL_SELECTION_INTRO: {
        title: 'Next: Adding Materials',
        content: 'Great job with the entities! Now, let\'s add some materials to your group. The process is similar to adding entities - we\'ll select multiple materials for your group.',
        target: '#new-material',
        onShow: function() {
            const materialInput = document.getElementById('new-material');
            if (materialInput) {
                materialInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    },

    GROUP_MATERIAL_SELECTION: {
        title: 'Select Multiple Materials',
        content: 'You can select multiple materials for this group. The first three materials will be selected automatically. Click Next to confirm your selections.',
        target: '.item-option',
        onShow: function() {
            this.prepareMultipleSelection('new-material', 3);
        },
        onNext: function() {
            this.finalizeMultipleSelection(3);
            return true;
        },
        onHide: function() {
            this.cleanupMultipleSelection('new-material');
        }
    },

    GROUP_NAMING: {
        title: 'Naming Your Group',
        content: 'Groups need unique names for both the entity and material group categories.',
        target: '#group-entity-name, #group-material-name',
        multipleTargets: true,
        onShow: function() {
            this.closeActiveModal();
            this.ensureTabActive('group');
            setTimeout(() => {
                const firstInput = document.querySelector('#group-entity-name');
                if (firstInput) {
                    firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    },

    GROUP_EXAMPLE_NAMES: {
        title: 'Example Names Added',
        content: 'Example names added:\n\n- Entity Group: Explosives\n- Material Group: Unbreakables',
        target: '#group-entity-name, #group-material-name',
        multipleTargets: true,
        onShow: function() {
            this.setInputValue('#group-entity-name', 'Explosives');
            this.setInputValue('#group-material-name', 'Unbreakables');
        },
        onHide: function() {
            this.setInputValue('#group-entity-name', '');
            this.setInputValue('#group-material-name', '');
        }
    },

    SAVE_GROUP: {
        title: 'Save Group Configuration',
        content: 'Click the Next button below to save your group configuration. This will save both the entity and material groups you\'ve created.',
        target: '#save-group-pair',
        onShow: function() {
            this.ensureTabActive('group');
            setTimeout(() => {
                const saveButton = document.getElementById('save-group-pair');
                if (saveButton) {
                    saveButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    saveButton.classList.add('tutorial-flash');
                }
            }, 300);
        },
        onNext: function() {
            this.clickElement('#save-group-pair');
        },
        onHide: function() {
            this.removeFlashFromElement('#save-group-pair');
        }
    },

    // Saved Pairs Management
    SAVED_PAIRS: {
        title: 'Managing Saved Pairs',
        content: 'Now let\'s look at how to manage your saved pairs and groups. The Saved Pairs tab shows all your configurations in one place.',
        target: 'button.tab[data-tab="saved-pairs"]',
        onShow: function() {
            const savedTab = document.querySelector('button.tab[data-tab="saved-pairs"]');
            if (savedTab && !savedTab.classList.contains('active')) {
                savedTab.click();
            }
        },
        onNext: function() {
            this.removeAllFlashes();
        }
    },

    LOAD_CONFIGURATIONS: {
        title: 'Loading Saved Configurations',
        content: 'You can load any saved configuration by clicking its Load button. This works for both vanilla pairs and groups.',
        target: '.pair-button.load-vanilla, .pair-button.load-group',
        onShow: function() {
            this.flashElements('.pair-button.load-vanilla, .pair-button.load-group');
        },
        onNext: function() {
            this.removeFlashFromElements('.pair-button.load-vanilla, .pair-button.load-group');
        },
        onHide: function() {
            this.removeFlashFromElements('.pair-button.load-vanilla, .pair-button.load-group');
        }
    },

    DELETE_CONFIGURATIONS: {
        title: 'Deleting Configurations',
        content: 'You can delete any saved configuration by clicking the Delete button. Be careful, this action cannot be undone!',
        target: '.pair-button.delete',
        onShow: function() {
            this.flashElements('.pair-button.delete');
        },
        onNext: function() {
            this.removeFlashFromElements('.pair-button.delete');
        },
        onHide: function() {
            this.removeFlashFromElements('.pair-button.delete, .pair-button.load-vanilla, .pair-button.load-group');
        }
    },

    // Conversion Features
    CONVERSION_SECTION: {
        title: 'Converting Pairs to Groups',
        content: 'You can convert single entity-material pairs into group configurations. Use the dropdown to select a saved pair, then enter names for your entity and material groups. This allows you to combine multiple entities and materials into reusable groups.',
        target: '.conversion-section',
        onShow: function() {
            this.ensureTabActive('saved-pairs');
            const section = document.querySelector('.conversion-section');
            if (section) {
                section.classList.add('tutorial-highlight');
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        },
        onNext: function() {
            this.removeHighlightFromElement('.conversion-section');
        },
        onHide: function() {
            this.removeHighlightFromElement('.conversion-section');
        }
    },

    CONVERSION_SELECT: {
        title: 'Converting a Pair to Group',
        content: 'Let\'s convert a saved pair into a group. I\'ll automatically select a pair for you to demonstrate how it works.',
        target: '#select-vanilla-pair',
        onShow: function() {
            this.ensureTabActive('saved-pairs');
            const select = document.querySelector('#select-vanilla-pair');
            if (select) {
                select.classList.add('tutorial-highlight');
                select.focus();
                setTimeout(() => {
                    select.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (select.options.length > 1) {
                        select.selectedIndex = 1;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }, 100);
            }
        },
        onNext: function() {
            this.removeHighlightFromElement('#select-vanilla-pair');
        },
        onHide: function() {
            this.resetConversionForm();
        }
    },

    CONVERT_TO_GROUP: {
        title: 'Convert to Group',
        content: 'Click the "Convert to Group" button to create a new group from the selected pair. This will combine the entity and material into reusable groups.',
        target: '#convert-to-group',
        onShow: function() {
            const convertButton = document.querySelector('#convert-to-group');
            if (convertButton) {
                convertButton.classList.add('tutorial-flash');
                setTimeout(() => {
                    convertButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        },
        onNext: function() {
            this.clickElement('#convert-to-group');
            this.removeAllFlashes();
        },
        onHide: function() {
            this.removeFlashFromElement('#convert-to-group');
        }
    },

    // Additional Features
    QUICK_TIP: {
        title: 'Quick Tip',
        content: 'Remember to use unique group names for your configs. This helps keep your configurations organized and prevents any unintended overrides.',
        target: '.tutorial-content',
        onShow: function() {
            const tutorialContent = document.querySelector('.tutorial-content');
            if (tutorialContent) {
                tutorialContent.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    },

    QUICK_EXPORT: {
        title: 'Export Your Config',
        content: 'You can quickly export your current configuration using the Export button in the top-left corner. This saves all your groups and settings.',
        target: '#quickExportBtn',
        onShow: function() {
            this.flashElement('#quickExportBtn');
        },
        onHide: function() {
            this.removeFlashFromElement('#quickExportBtn');
        }
    },

    IMPORT_EXPORT: {
        title: 'Import/Export Options',
        content: 'For more control, use the Export and Import buttons on the Welcome tab. These allow you to save and load your complete configuration.',
        target: '#export-config, #import-config',
        multipleTargets: true,
        onShow: function() {
            this.ensureTabActive('welcome');
            setTimeout(() => {
                this.flashElement('#export-config');
                this.flashElement('#import-config');
                const exportBtn = document.querySelector('#export-config');
                if (exportBtn) {
                    exportBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        },
        onHide: function() {
            this.removeFlashFromElement('#export-config');
            this.removeFlashFromElement('#import-config');
            this.ensureTabActive('saved-pairs');
        }
    },

    SETTINGS_DASHBOARD: {
        title: 'Additional Settings',
        content: 'You can manage all general configuration settings in the settings dashboard on the welcome page. This includes various options to customize your experience.',
        target: '.settings-dashboard.compact',
        onShow: function() {
            this.removeAllFlashes();
            this.ensureTabActive('welcome');
            const settingsDashboard = document.querySelector('.settings-dashboard.compact');
            if (settingsDashboard) {
                settingsDashboard.classList.add('tutorial-highlight');
                this.scrollToBottomThenTop();
            }
        },
        onHide: function() {
            this.removeHighlightFromElement('.settings-dashboard.compact');
        }
    },

    COMPLETION: {
        title: 'Tutorial Complete!',
        content: 'You now know how to create, manage, and export your configurations! You can always revisit this tutorial by clicking the tutorial button in the bottom right corner.',
        onShow: function() {
            this.removeAllHighlights();
            this.ensureTabActive('welcome');
        }
    }
};

// Default tutorial steps in order
const defaultTutorialSteps = [
    TutorialSteps.WELCOME,
    TutorialSteps.VANILLA_MANAGER,
    TutorialSteps.VANILLA_INPUTS,
    TutorialSteps.ENTITY_SELECTION,
    TutorialSteps.WITHER_SELECTED,
    TutorialSteps.MATERIAL_SELECTION,
    TutorialSteps.STONE_SELECTED,
    TutorialSteps.SAVE_VANILLA,
    TutorialSteps.GROUP_MANAGER,
    TutorialSteps.GROUP_INPUTS,
    TutorialSteps.GROUP_ENTITY_SELECTION,
    TutorialSteps.GROUP_MATERIAL_SELECTION_INTRO,
    TutorialSteps.GROUP_MATERIAL_SELECTION,
    TutorialSteps.GROUP_NAMING,
    TutorialSteps.GROUP_EXAMPLE_NAMES,
    TutorialSteps.SAVE_GROUP,
    TutorialSteps.SAVED_PAIRS,
    TutorialSteps.LOAD_CONFIGURATIONS,
    TutorialSteps.DELETE_CONFIGURATIONS,
    TutorialSteps.CONVERSION_SECTION,
    TutorialSteps.CONVERSION_SELECT,
    TutorialSteps.CONVERT_TO_GROUP,
    TutorialSteps.QUICK_TIP,
    TutorialSteps.QUICK_EXPORT,
    TutorialSteps.IMPORT_EXPORT,
    TutorialSteps.SETTINGS_DASHBOARD,
    TutorialSteps.COMPLETION
];

// Enhanced TutorialManager with helper methods
TutorialManager.prototype.closeModal = function() {
    if (this.modal) {
        const closeBtn = this.modal.querySelector('.item-selector-close');
        if (closeBtn) closeBtn.click();
        this.modal = null;
    } else {
        const activeModal = document.querySelector('.item-selector-modal.active');
        if (activeModal) {
            const closeBtn = activeModal.querySelector('.item-selector-close');
            if (closeBtn) closeBtn.click();
        }
    }
    document.body.removeAttribute('data-tutorial-lock');
    const style = document.getElementById('tutorial-modal-style');
    if (style) style.remove();
};

TutorialManager.prototype.selectFirstOptionAndClose = function(inputId, value) {
    const firstOption = document.querySelector('.item-option:first-child');
    if (firstOption) {
        const modal = document.querySelector('.item-selector-modal.active');
        firstOption.click();
        
        const input = document.getElementById(inputId);
        if (input) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            if (window.configManager) {
                window.configManager.setValue(inputId, value);
            }
        }
        
        if (modal) {
            setTimeout(() => {
                modal.classList.remove('active');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                document.body.removeAttribute('data-tutorial-lock');
                const style = document.getElementById('tutorial-modal-style');
                if (style) style.remove();
                
                const vanillaTab = document.querySelector('button.tab[data-tab="vanilla"]');
                if (vanillaTab && !vanillaTab.classList.contains('active')) {
                    vanillaTab.click();
                }
            }, 100);
        }
    }
};

TutorialManager.prototype.flashElement = function(selector) {
    const element = document.querySelector(selector);
    if (element) element.classList.add('tutorial-flash');
};

TutorialManager.prototype.flashElements = function(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        el.classList.add('tutorial-flash');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
};

TutorialManager.prototype.removeFlashFromElement = function(selector) {
    const element = document.querySelector(selector);
    if (element) element.classList.remove('tutorial-flash');
};

TutorialManager.prototype.removeFlashFromElements = function(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.classList.remove('tutorial-flash'));
};

TutorialManager.prototype.removeAllFlashes = function() {
    document.querySelectorAll('.tutorial-flash').forEach(el => {
        el.classList.remove('tutorial-flash');
    });
};

TutorialManager.prototype.clickElement = function(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.remove('tutorial-flash');
        element.click();
    }
};

TutorialManager.prototype.ensureTabActive = function(tabName) {
    const tab = document.querySelector(`button.tab[data-tab="${tabName}"]`);
    if (tab && !tab.classList.contains('active')) {
        tab.click();
    }
};

TutorialManager.prototype.closeActiveModal = function() {
    const activeModal = document.querySelector('.item-selector-modal.active');
    if (activeModal) {
        const closeBtn = activeModal.querySelector('.item-selector-close');
        if (closeBtn) closeBtn.click();
    }
};

TutorialManager.prototype.prepareMultipleSelection = function(inputId, count) {
    this.modal = null;
    this.clearExistingSelections();
    
    const existingModal = document.querySelector('.item-selector-modal.active');
    if (existingModal) {
        this.clearModalSelections(existingModal);
        const closeBtn = existingModal.querySelector('.item-selector-close');
        if (closeBtn) closeBtn.click();
        setTimeout(() => this.openSelectionModal(inputId, count), 100);
    } else {
        this.openSelectionModal(inputId, count);
    }
};

TutorialManager.prototype.openSelectionModal = function(inputId, count) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
        input.focus();
        setTimeout(() => {
            const modal = document.querySelector('.item-selector-modal.active');
            if (modal) {
                this.modal = modal;
                this.clearModalSelections(modal);
                const options = Array.from(modal.querySelectorAll('.item-option'));
                const selectionCount = Math.min(count, options.length);
                
                setTimeout(() => {
                    options.slice(0, selectionCount).forEach((option, index) => {
                        setTimeout(() => {
                            if (option) option.click();
                        }, index * 300);
                    });
                }, 200);
            }
        }, 300);
    }
};

TutorialManager.prototype.finalizeMultipleSelection = function(count) {
    const modal = this.modal || document.querySelector('.item-selector-modal.active');
    if (modal) {
        const selectedCount = modal.querySelectorAll('.item-option.selected').length;
        const remaining = Math.max(0, count - selectedCount);
        const unselectedOptions = Array.from(modal.querySelectorAll('.item-option:not(.selected)'));
        
        unselectedOptions.slice(0, remaining).forEach(option => option.click());
        
        const addButton = modal.querySelector('.item-custom-submit');
        if (addButton) addButton.click();
    }
};

TutorialManager.prototype.cleanupMultipleSelection = function(inputId) {
    if (this.modal) {
        this.clearModalSelections(this.modal);
        const closeBtn = this.modal.querySelector('.item-selector-close');
        if (closeBtn) closeBtn.click();
        this.modal = null;
    } else {
        const activeModal = document.querySelector('.item-selector-modal.active');
        if (activeModal) {
            this.clearModalSelections(activeModal);
            const closeBtn = activeModal.querySelector('.item-selector-close');
            if (closeBtn) closeBtn.click();
        }
    }
    
    this.clearExistingSelections();
    const input = document.getElementById(inputId);
    if (input) input.value = '';
    document.body.removeAttribute('data-tutorial-lock');
    const style = document.getElementById('tutorial-modal-style');
    if (style) style.remove();
};

TutorialManager.prototype.clearExistingSelections = function() {
    const existingSelections = document.querySelectorAll('.group-entity-item, .group-material-item');
    existingSelections.forEach(item => item.remove());
};

TutorialManager.prototype.clearModalSelections = function(modal) {
    const selectedOptions = modal.querySelectorAll('.item-option.selected');
    selectedOptions.forEach(option => option.classList.remove('selected'));
    
    const searchInput = modal.querySelector('.item-search-input');
    if (searchInput) searchInput.value = '';
};

TutorialManager.prototype.setInputValue = function(selector, value) {
    const input = document.querySelector(selector);
    if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
};

TutorialManager.prototype.removeHighlightFromElement = function(selector) {
    const element = document.querySelector(selector);
    if (element) element.classList.remove('tutorial-highlight');
};

TutorialManager.prototype.removeAllHighlights = function() {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
};

TutorialManager.prototype.resetConversionForm = function() {
    const select = document.querySelector('#select-vanilla-pair');
    const entityInput = document.getElementById('group-entity-name-conversion');
    const materialInput = document.getElementById('group-material-name-conversion');
    const section = document.querySelector('.conversion-section');
    
    if (section) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1000);
    }
    
    if (select) {
        select.classList.remove('tutorial-highlight');
        select.selectedIndex = 0;
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (entityInput) entityInput.value = '';
    if (materialInput) materialInput.value = '';
};

TutorialManager.prototype.scrollToBottomThenTop = function() {
    const start = window.scrollY;
    const end = document.body.scrollHeight - window.innerHeight;
    const duration = 1500;
    let startTime = null;
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    const scrollStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / duration;
        
        if (progress < 1) {
            const ease = easeInOutCubic(progress);
            window.scrollTo(0, start + (end - start) * ease);
            window.requestAnimationFrame(scrollStep);
        } else {
            window.scrollTo(0, end);
            setTimeout(() => {
                startTime = null;
                const topScroll = () => {
                    const current = window.scrollY;
                    if (current > 0) {
                        window.scrollTo(0, Math.max(0, current - 20));
                        requestAnimationFrame(topScroll);
                    }
                };
                topScroll();
            }, 1000);
        }
    };
    
    window.requestAnimationFrame(scrollStep);
};

// Global tutorial functions
function showTutorialIfNeeded() {
    const tutorialShown = localStorage.getItem('tutorialShown');
    if (tutorialShown) return;

    const tutorialBtn = document.getElementById('tutorial-helper');
    if (tutorialBtn) tutorialBtn.style.display = 'none';

    window.tutorial = new TutorialManager(defaultTutorialSteps);
}

function resetTutorial() {
    localStorage.removeItem('tutorialShown');
    showTutorialIfNeeded();
}

function startTutorial() {
    if (window.tutorial) {
        window.tutorial.closeTutorial();
    }
    localStorage.removeItem('tutorialShown');
    showTutorialIfNeeded();
}

function addTutorialButton() {
    if (document.getElementById('tutorial-helper')) return;
    
    const tutorialBtn = document.createElement('div');
    tutorialBtn.id = 'tutorial-helper';
    tutorialBtn.style.display = 'none';
    tutorialBtn.innerHTML = `
        <div class="tutorial-helper" title="Show Tutorial">
            <i class="fas fa-arrow-up"></i>
            <span>Tutorial</span>
        </div>
    `;
    
    tutorialBtn.addEventListener('click', startTutorial);
    document.body.appendChild(tutorialBtn);
    updateTutorialButtonVisibility();
}

function updateTutorialButtonVisibility() {
    const tutorialBtn = document.getElementById('tutorial-helper');
    if (!tutorialBtn) return;
    
    const activeTab = document.querySelector('.tab.active');
    if (activeTab && activeTab.dataset.tab === 'welcome') {
        tutorialBtn.style.display = 'block';
    } else {
        tutorialBtn.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    addTutorialButton();
    
    document.addEventListener('click', (e) => {
        if (e.target.closest('.tab')) {
            setTimeout(updateTutorialButtonVisibility, 10);
        }
    });
});

window.showTutorialIfNeeded = showTutorialIfNeeded;
window.startTutorial = startTutorial;
window.resetTutorial = resetTutorial;
window.TutorialManager = TutorialManager;
window.TutorialSteps = TutorialSteps;
window.defaultTutorialSteps = defaultTutorialSteps;