// Main App Module - Integrates all components and handles global functionality

import { gunasthansData, transitionRules } from '../data/gunasthans.js';
import { thanasData, matrixData } from '../data/matrix.js';
import { definitionsDatabase } from '../data/definitions.js';
import { getProgressColor, showMessage, scrollToGunasthan } from '../utils/helpers.js';
import { startVoiceSearch, stopVoiceSearch, initVoiceSearch } from '../utils/voice.js';
import { initUX, renderAajKaVishesh } from '../ux/theme.js';
import { renderStaircase } from '../ux/staircase.js';
import { initAudio, speak, stopSpeaking } from '../ux/audio.js';
import { setupMatrixModeToggle, getMatrixMode, generateExplanation } from '../ux/matrix-explain.js';
import { startTour, isTourCompleted } from '../ux/tour.js';
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
            // Always (re)install the मुझे समझाओ toggle in case it's not there
            requestAnimationFrame(() => setupMatrixModeToggle());
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
        <div class="info-section" style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 24px;">📚</span>
                <div class="info-title">मूल स्रोत — Source Material</div>
            </div>
            <p class="info-description hindi-prose" style="margin: 6px 0 12px;">
                यह एप पूर्णरूप से <strong>श्री चौबीस ठाणा चर्चा</strong> — निर्यापक मुनि श्री प्रशांतसागर जी महाराज द्वारा रचित प्रामाणिक ग्रंथ — पर आधारित है। समस्त डेटा, परिभाषाएँ एवं सिद्धांत इसी आधिकारिक स्रोत से सावधानीपूर्वक निकाले गए हैं।
            </p>
            <button onclick="showSourceInfo()" class="aaj-ka-vishesh-btn" type="button">
                📄 मूल PDF देखें
            </button>
        </div>

        <!-- गुणस्थान सोपान — visual staircase -->
        <div id="staircase-container" style="margin-bottom: 24px;"></div>

        <div style="margin-bottom: 20px;">
            <h3 class="hindi-prose" style="color: var(--c-maroon); margin-bottom: 14px; font-size: var(--fs-lg); font-weight: 700;">🔀 अन्य खंड</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                <div onclick="showMatrixTab()" class="nav-card" style="background: var(--bg-card); border: 2px solid var(--border-card); border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.3s ease; text-align: center; box-shadow: var(--shadow-card);"
                    onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='var(--c-saffron)'; this.style.boxShadow='var(--shadow-elev)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border-card)'; this.style.boxShadow='var(--shadow-card)'">
                    <div style="font-size: 28px; margin-bottom: 4px;">📊</div>
                    <div class="hindi-prose" style="font-weight: 700; color: var(--text-primary); font-size: var(--fs-base);">ठाणा तालिका</div>
                </div>
                
                <div onclick="showTransitionsTab()" class="nav-card" style="background: var(--bg-card); border: 2px solid var(--border-card); border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.3s ease; text-align: center; box-shadow: var(--shadow-card);"
                    onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='var(--c-deep-green)'; this.style.boxShadow='var(--shadow-elev)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border-card)'; this.style.boxShadow='var(--shadow-card)'">
                    <div style="font-size: 28px; margin-bottom: 4px;">🔄</div>
                    <div class="hindi-prose" style="font-weight: 700; color: var(--text-primary); font-size: var(--fs-base);">आरोहण-अवरोहण</div>
                </div>
                
                <div onclick="showDefinitionsTab()" class="nav-card" style="background: var(--bg-card); border: 2px solid var(--border-card); border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.3s ease; text-align: center; box-shadow: var(--shadow-card);"
                    onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='var(--c-gold)'; this.style.boxShadow='var(--shadow-elev)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border-card)'; this.style.boxShadow='var(--shadow-card)'">
                    <div style="font-size: 28px; margin-bottom: 4px;">📖</div>
                    <div class="hindi-prose" style="font-weight: 700; color: var(--text-primary); font-size: var(--fs-base);">शब्दकोश</div>
                </div>

                <div onclick="window.startTour(true)" class="nav-card" style="background: var(--bg-card); border: 2px solid var(--border-card); border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.3s ease; text-align: center; box-shadow: var(--shadow-card);"
                    onmouseover="this.style.transform='translateY(-3px)'; this.style.borderColor='var(--c-maroon)'; this.style.boxShadow='var(--shadow-elev)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border-card)'; this.style.boxShadow='var(--shadow-card)'">
                    <div style="font-size: 28px; margin-bottom: 4px;">🙏</div>
                    <div class="hindi-prose" style="font-weight: 700; color: var(--text-primary); font-size: var(--fs-base);">परिचय</div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;

    // Render the visual staircase
    renderStaircase('staircase-container');

    // Re-render the आज का विशेष card on top
    requestAnimationFrame(() => renderAajKaVishesh());
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
    if (g.descriptionHi) {
        message += `📜 स्रोत-वर्णन (हिंदी):\n${g.descriptionHi}\n\n`;
    }
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
    
    // Initialize UX (theme toggles, language, large view, night mode)
    initUX();

    // Initialize audio (Web Speech API voice list async-load)
    initAudio();
    
    // Load initial content
    window.loadOverview();

    // Re-render the आज का विशेष card after overview loads, so it appears on top
    requestAnimationFrame(() => renderAajKaVishesh());

    // Initialize voice search if supported
    initVoiceSearch();
    
    // Mark as initialized
    isInitialized = true;
    
    console.log('✅ App initialized successfully');

    // First-time guided tour (after a short delay so the page paints first)
    if (!isTourCompleted()) {
        setTimeout(() => startTour(), 600);
    }

    // Expose matrix-explain helpers for matrix component's tooltip injection
    window.__getMatrixMode = getMatrixMode;
    window.__generateExplanation = generateExplanation;
    window.__speakCellExplain = function(g, t) {
        const explain = generateExplanation(g, t);
        if (!explain) return;
        // Strip HTML tags for clean speech
        const text = explain.title + '। ' + explain.prose
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        speak(text, { id: `cell-${g}-${t}` });
    };
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
