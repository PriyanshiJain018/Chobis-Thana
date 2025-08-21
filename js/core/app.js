// Main App Module - Integrates all components and handles global functionality

import { gunasthansData, transitionRules } from '../data/gunasthans.js';
import { thanasData, matrixData } from '../data/matrix.js';
import { definitionsDatabase } from '../data/definitions.js';
import { getProgressColor, showMessage, scrollToGunasthan } from '../utils/helpers.js';
import { startVoiceSearch, stopVoiceSearch, initVoiceSearch } from '../utils/voice.js';
import { 
    loadMatrix, 
    changeMatrix, 
    showDetailedTooltip, 
    showNewDetailedTooltip, 
    closeTooltip, 
    searchInMatrix 
} from '../components/matrix.js';
import { 
    loadDefinitions, 
    searchDefinitions, 
    clearDefinitionSearch, 
    toggleCategory, 
    toggleAdditionalInfo, 
    toggleNestedSubtypes,
    showSubDefinitionDetail,
    showNestedDefinitionDetail,
    findAndShowDefinition,
    findDefinitionByThana 
} from '../components/definitions.js';
import { 
    loadTransitions, 
    launchGameMode, 
    searchInTransitions 
} from '../components/transitions.js';
import { 
    handleUniversalSearch, 
    updateSearchContext, 
    clearSearch, 
    searchInOverview, 
    searchThanas 
} from '../components/search.js';

// Global app state
let currentTab = 'overview';
let isInitialized = false;

// IMMEDIATELY EXPOSE CRITICAL FUNCTIONS TO WINDOW
// This must happen before any HTML with onclick handlers is created
window.showTab = function(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(`${tabName}-content`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
    }
    
    // Set active tab
    const targetTab = Array.from(document.querySelectorAll('.tab')).find(tab => 
        tab.textContent.toLowerCase() === tabName || tab.getAttribute('data-tab') === tabName
    );
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Update current tab
    currentTab = tabName;
    if (window.updateSearchContext) {
        window.updateSearchContext(tabName);
    }
    
    // Load content based on tab
    switch(tabName) {
        case 'overview':
            if (!document.getElementById('gunasthan-list').innerHTML) {
                window.loadOverview();
            }
            break;
        case 'matrix':
            if (!document.getElementById('matrix-table').innerHTML) {
                window.loadMatrix();
            }
            break;
        case 'transitions':
            if (!document.getElementById('transitions-list').innerHTML) {
                window.loadTransitions();
            }
            break;
        case 'definitions':
            if (!document.getElementById('definitions-list').innerHTML) {
                window.loadDefinitions();
            }
            break;
    }
};

// Load Overview with PDF Source Disclaimer
window.loadOverview = function() {
    const container = document.getElementById('gunasthan-list');
    
    let html = `
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 16px; padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 16px rgba(14, 165, 233, 0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <span style="font-size: 28px;">📚</span>
                <h3 style="color: #0c4a6e; font-size: 20px; font-weight: 700; margin: 0;">Source Material</h3>
            </div>
            <p style="color: #1e293b; line-height: 1.6; margin-bottom: 16px;">
                This application is based entirely on the authentic text:
                <strong style="color: #0ea5e9;">श्री चौबीस ठाणा चर्चा</strong> 
                by निर्यापक मुनि श्री प्रशांतसागर जी महाराज. All data, definitions, and spiritual concepts have been carefully extracted from this authoritative source. 
            </p>
            <button onclick="showSourceInfo()" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);">
                📄 View Original PDF Source
            </button>
        </div>
        
        <div style="margin-bottom: 24px;">
            <h3 style="color: #1e293b; margin-bottom: 16px;">🏛️ The 14 Gunasthans - Stages of Spiritual Development</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div onclick="showMatrixTab()" style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.3s ease; text-align: center;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; this.style.borderColor='#3b82f6'"
                    onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='none'; this.style.borderColor='#e2e8f0'">
                    <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Matrix View</div>
                    <div style="font-size: 12px; color: #64748b;">24 ठाणा Analysis</div>
                </div>
                
                <div onclick="showTransitionsTab()" style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.3s ease; text-align: center;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; this.style.borderColor='#10b981'"
                    onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='none'; this.style.borderColor='#e2e8f0'">
                    <div style="font-size: 32px; margin-bottom: 8px;">🔄</div>
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Transitions</div>
                    <div style="font-size: 12px; color: #64748b;">गुणस्थान आरोहण-अवरोहण</div>
                </div>
                
                <div onclick="showDefinitionsTab()" style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.3s ease; text-align: center;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; this.style.borderColor='#f59e0b'"
                    onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='none'; this.style.borderColor='#e2e8f0'">
                    <div style="font-size: 32px; margin-bottom: 8px;">📖</div>
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Definitions</div>
                    <div style="font-size: 12px; color: #64748b;">Complete glossary</div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
};

// Helper functions for tab navigation from overview cards
window.showMatrixTab = function() {
    window.showTab('matrix');
};

window.showTransitionsTab = function() {
    window.showTab('transitions');
};

window.showDefinitionsTab = function() {
    window.showTab('definitions');
};

// Show detailed source information
window.showSourceInfo = function() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.3s ease; padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 32px; max-width: 600px; width: 90%; position: relative; animation: slideUp 0.3s ease;">
            <button onclick="this.parentElement.parentElement.remove()" 
                style="position: absolute; top: 16px; right: 16px; background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center;">
                ×
            </button>
            
            <h2 style="color: #1e293b; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">📚</span>
                Original Source Document
            </h2>
            
            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h3 style="color: #92400e; margin-bottom: 12px; font-size: 18px;">श्री चौबीस ठाणा चर्चा</h3>
                <div style="color: #78350f; line-height: 1.8;">
                    <p style="margin-bottom: 8px;"><strong>Author:</strong> निर्यापक मुनि श्री प्रशांतसागर जी महाराज </p>
                    <p style="margin-bottom: 8px;"><strong>Language:</strong> Hindi</p>
                    <p style="margin-bottom: 8px;"><strong>Content:</strong> Complete analysis of 24 Thanas</p>
                    <p style="margin-bottom: 12px;"><strong>Significance:</strong> Authoritative Jain scripture on core concepts</p>
                    <p style="font-style: italic; color: #92400e;">
                        This digital application serves as a modern interface to 
                        access and study the timeless wisdom contained in the original text.
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <a href="http://vidhyasagarpathshala.com/wp-content/uploads/2017/12/%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80-%E0%A4%9A%E0%A5%8C%E0%A4%AC%E0%A5%80%E0%A4%B8-%E0%A4%A0%E0%A4%BE%E0%A4%A3%E0%A4%BE-%E0%A4%9A%E0%A4%B0%E0%A5%8D%E0%A4%9A%E0%A4%BE.pdf" 
                target="_blank" 
                style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); transition: all 0.3s ease;"
                onmouseover="this.style.transform='translateY(-2px)'"
                onmouseout="this.style.transform='translateY(0px)'">
                    <span style="font-size: 18px;">📄</span>
                    Access Original PDF Document
                </a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Show gunasthan detail
window.showGunasthanDetail = function(gunasthanId) {
    const g = gunasthansData[gunasthanId];
    const rule = transitionRules[gunasthanId];
    
    let message = `🔢 Gunasthan ${gunasthanId}: ${g.nameHi}\n`;
    message += `📖 ${g.nameEn} - ${g.english}\n\n`;
    message += `${g.description}\n\n`;
    message += `🔄 Transitions: ${rule.description}\n`;
    
    if (rule.canGoTo.length > 0) {
        message += `Can go to: ${rule.canGoTo.map(id => `G${id}`).join(', ')}`;
    } else {
        message += `🎯 Final stage - Liberation awaits!`;
    }
    
    alert(message);
};

// Helper function for search on enter
window.searchOnEnter = function(event) {
    if (event.key === 'Enter') {
        window.searchDefinitions(event.target.value);
    }
};

// Helper function to search from input button
window.searchDefinitionsFromInput = function() {
    const searchValue = document.getElementById('definition-search').value;
    window.searchDefinitions(searchValue);
};

// Helper function to close tooltip modal
window.closeTooltipModal = function(event) {
    window.closeTooltip(event);
};

// Helper function to stop propagation
window.stopPropagation = function(event) {
    event.stopPropagation();
};

// EXPOSE ALL IMPORTED FUNCTIONS TO GLOBAL SCOPE
// This ensures all functions are available for onclick handlers
const exposeFunctionsGlobally = () => {
    // Matrix functions
    window.loadMatrix = loadMatrix;
    window.changeMatrix = changeMatrix;
    window.showDetailedTooltip = showDetailedTooltip;
    window.showNewDetailedTooltip = showNewDetailedTooltip;
    window.closeTooltip = closeTooltip;
    window.searchInMatrix = searchInMatrix;

    // Definitions functions
    window.loadDefinitions = loadDefinitions;
    window.searchDefinitions = searchDefinitions;
    window.clearDefinitionSearch = clearDefinitionSearch;
    window.toggleCategory = toggleCategory;
    window.toggleAdditionalInfo = toggleAdditionalInfo;
    window.toggleNestedSubtypes = toggleNestedSubtypes;
    window.showSubDefinitionDetail = showSubDefinitionDetail;
    window.showNestedDefinitionDetail = showNestedDefinitionDetail;
    window.findAndShowDefinition = findAndShowDefinition;
    window.findDefinitionByThana = findDefinitionByThana;

    // Transitions functions
    window.loadTransitions = loadTransitions;
    window.launchGameMode = launchGameMode;
    window.searchInTransitions = searchInTransitions;
    window.scrollToGunasthan = scrollToGunasthan;

    // Search functions
    window.handleUniversalSearch = handleUniversalSearch;
    window.updateSearchContext = updateSearchContext;
    window.clearSearch = clearSearch;
    window.searchInOverview = searchInOverview;
    window.searchThanas = searchThanas;

    // Voice functions
    window.startVoiceSearch = startVoiceSearch;
    window.stopVoiceSearch = stopVoiceSearch;
    window.initVoiceSearch = initVoiceSearch;

    // Utility functions
    window.showMessage = showMessage;
    window.getProgressColor = getProgressColor;
    
    console.log('✅ All functions exposed globally');
};

// EXPOSE FUNCTIONS IMMEDIATELY - BEFORE ANYTHING ELSE
exposeFunctionsGlobally();

// Set up event listeners IMMEDIATELY to ensure tabs work
setupEventListeners();

// Initialize the application
function initializeApp() {
    if (isInitialized) return;
    
    console.log('🚀 Initializing Gunasthan App...');
    
    // Load initial content
    window.loadOverview();
    
    // Initialize voice search if supported
    initVoiceSearch();
    
    // Mark as initialized
    isInitialized = true;
    
    console.log('✅ App initialized successfully');
}

// Set up event listeners
function setupEventListeners() {
    // Event delegation for all click events
    document.addEventListener('click', (e) => {
        const clickHandler = e.target.getAttribute('data-click');
        const tabName = e.target.getAttribute('data-tab');
        
        // Handle tab clicks
        if (tabName) {
            window.showTab(tabName);
            return;
        }
        
        // Handle other click events
        if (clickHandler && window[clickHandler]) {
            e.preventDefault();
            e.stopPropagation();
            
            // Special cases for functions that need parameters
            switch(clickHandler) {
                case 'closeTooltipModal':
                    window.closeTooltip(e);
                    break;
                case 'stopPropagation':
                    e.stopPropagation();
                    break;
                case 'searchDefinitionsFromInput':
                    const searchValue = document.getElementById('definition-search').value;
                    window.searchDefinitions(searchValue);
                    break;
                case 'showDetailedTooltip':
                    const gunasthan = e.target.closest('[data-gunasthan]').getAttribute('data-gunasthan');
                    const thana = e.target.closest('[data-thana]').getAttribute('data-thana');
                    window.showDetailedTooltip(parseInt(gunasthan), parseInt(thana));
                    break;
                case 'showNewDetailedTooltip':
                    const matrixType = e.target.closest('[data-matrix-type]').getAttribute('data-matrix-type');
                    const thanaIndex = e.target.closest('[data-thana-index]').getAttribute('data-thana-index');
                    const colIndex = e.target.closest('[data-col-index]').getAttribute('data-col-index');
                    window.showNewDetailedTooltip(matrixType, parseInt(thanaIndex), parseInt(colIndex));
                    break;
                case 'findDefinitionByThana':
                    const thanaName = e.target.getAttribute('data-thana-name');
                    const conceptName = e.target.getAttribute('data-concept-name');
                    window.findDefinitionByThana(thanaName, conceptName);
                    break;
                case 'scrollToGunasthan':
                    const gunasthanId = e.target.closest('[data-gunasthan-id]').getAttribute('data-gunasthan-id');
                    window.scrollToGunasthan(parseInt(gunasthanId));
                    break;
                default:
                    window[clickHandler]();
            }
        }
        
        // Handle modal background clicks
        if (e.target.id === 'tooltip-modal') {
            window.closeTooltip(e);
        }
    });
    
    // Handle change events
    document.addEventListener('change', (e) => {
        const changeHandler = e.target.getAttribute('data-change');
        if (changeHandler && window[changeHandler]) {
            window[changeHandler]();
        }
    });
    
    // Handle input events
    document.addEventListener('input', (e) => {
        const inputHandler = e.target.getAttribute('data-input');
        if (inputHandler && window[inputHandler]) {
            window[inputHandler](e.target.value);
        }
    });
    
    // Handle keypress events
    document.addEventListener('keypress', (e) => {
        const keypressHandler = e.target.getAttribute('data-keypress');
        if (keypressHandler) {
            if (keypressHandler === 'searchOnEnter' && e.key === 'Enter') {
                window.searchDefinitions(e.target.value);
            }
        }
        
        // Global escape key handler
        if (e.key === 'Escape') {
            window.closeTooltip();
        }
    });
    
    // Handle keydown for escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeTooltip();
        }
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for potential module usage
export { 
    initializeApp, 
    currentTab
};
