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

// Tab switching functionality - DEFINE EARLY
function showTab(tabName) {
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
    updateSearchContext(tabName);
    
    // Load content based on tab
    switch(tabName) {
        case 'overview':
            if (!document.getElementById('gunasthan-list').innerHTML) {
                loadOverview();
            }
            break;
        case 'matrix':
            if (!document.getElementById('matrix-table').innerHTML) {
                loadMatrix();
            }
            break;
        case 'transitions':
            if (!document.getElementById('transitions-list').innerHTML) {
                loadTransitions();
            }
            break;
        case 'definitions':
            if (!document.getElementById('definitions-list').innerHTML) {
                loadDefinitions();
            }
            break;
    }
}

// Load Overview with PDF Source Disclaimer - DEFINE EARLY
function loadOverview() {
    const container = document.getElementById('gunasthan-list');
    
    let html = `
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 16px; padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden;">
            <!-- Decorative background pattern -->
            <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: linear-gradient(45deg, rgba(14, 165, 233, 0.1), rgba(59, 130, 246, 0.1)); border-radius: 50%; z-index: 0;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: linear-gradient(-45deg, rgba(14, 165, 233, 0.08), rgba(59, 130, 246, 0.08)); border-radius: 50%; z-index: 0;"></div>
            
            <div style="position: relative; z-index: 1;">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                    <div style="background: #0ea5e9; color: white; padding: 12px; border-radius: 12px; font-size: 24px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);">
                        📚
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                            🙏 Source & Acknowledgment | स्रोत एवं आभार
                        </h3>
                        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
                            This application is based entirely on the authentic text <strong>"श्री चौबीस ठाणा चर्चा"</strong> 
                            by Niryapak Muni Prashantsagarji Maharaj. All data, definitions, and spiritual concepts have been 
                            carefully extracted from this authoritative source.
                        </p>
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 16px; border: 1px solid rgba(14, 165, 233, 0.2); margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <span style="font-size: 18px;">📖</span>
                        <strong style="color: #0f172a; font-size: 16px;">Original Text:</strong>
                        <span style="color: #7c3aed; font-weight: 600; font-size: 16px;">श्री चौबीस ठाणा चर्चा</span>
                    </div>
                    <div style="color: #475569; font-size: 13px; line-height: 1.5;">
                        <strong>Author:</strong> Niryapak Shraman Muni Shri Prashantsagar Maharaj <br>
                        <strong>Content:</strong> Complete analysis of 24 Thanas across 14 Gunasthanas with detailed definitions<br>
                        <strong>Language:</strong> Hindi
                    </div>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
                    <a href="http://vidhyasagarpathshala.com/wp-content/uploads/2017/12/%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80-%E0%A4%9A%E0%A5%8C%E0%A4%AC%E0%A5%80%E0%A4%B8-%E0%A4%A0%E0%A4%BE%E0%A4%A3%E0%A4%BE-%E0%A4%9A%E0%A4%B0%E0%A5%8D%E0%A4%9A%E0%A4%BE.pdf" 
                    target="_blank" 
                    style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); transition: all 0.3s ease;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(220, 38, 38, 0.4)'"
                    onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 12px rgba(220, 38, 38, 0.3)'">
                        <span style="font-size: 16px;">📄</span>
                        Download Original PDF | मूल PDF डाउनलोड करें
                    </a>
                    
                    <button data-click="showSourceInfo" 
                            style="background: rgba(14, 165, 233, 0.1); border: 2px solid #0ea5e9; color: #0ea5e9; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease;"
                            onmouseover="this.style.background='rgba(14, 165, 233, 0.2)'"
                            onmouseout="this.style.background='rgba(14, 165, 233, 0.1)'">
                        ℹ️ More About Source
                    </button>
                    
                    <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; color: #16a34a; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ✅ 100% Authentic Content
                    </div>
                </div>
                
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(14, 165, 233, 0.2); font-size: 12px; color: #64748b; text-align: center; font-style: italic;">
                    🙏 We express our gratitude to Vidhyasagar Pathshala for making this knowledge accessible. 
                    This digital application serves as a modern interface to the timeless wisdom contained in the original text.
                </div>
            </div>
        </div>

        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #cbd5e1; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
            <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 22px; font-weight: 700;">
                Explore the Application Sections
            </h3>
            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Navigate through different tabs to explore the comprehensive analysis of 24 Thanas across 14 Gunasthanas
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 20px;">
                <div class="overview-card" data-click="showMatrixTab" style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Matrix View</div>
                    <div style="font-size: 12px; color: #64748b;">24×14 comprehensive grid</div>
                </div>
                
                <div class="overview-card" data-click="showTransitionsTab" style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🔄</div>
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Transitions</div>
                    <div style="font-size: 12px; color: #64748b;">गुणस्थान आरोहण-अवरोहण</div>
                </div>
                
                <div class="overview-card" data-click="showDefinitionsTab" style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">📖</div>
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Definitions</div>
                    <div style="font-size: 12px; color: #64748b;">Complete glossary</div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Helper functions for tab navigation from overview cards - DEFINE EARLY
function showMatrixTab() {
    showTab('matrix');
}

function showTransitionsTab() {
    showTab('transitions');
}

function showDefinitionsTab() {
    showTab('definitions');
}

// Show detailed source information - DEFINE EARLY  
function showSourceInfo() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.3s ease; padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 30px; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative;">
            <button onclick="this.closest('div').parentElement.remove()" 
                    style="position: absolute; top: 15px; right: 15px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-weight: bold; font-size: 16px;">×</button>
            
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 15px;">🕉️</div>
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px;">श्री चौबीस ठाणा चर्चा</h2>
                <p style="color: #6b7280; margin: 0; font-size: 16px;">Complete Source Information</p>
            </div>
            
            <div style="space-y: 20px;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 18px;">📖 About the Text</h3>
                    <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 14px;">
                        "श्री चौबीस ठाणा चर्चा" is a comprehensive Jain philosophical text that systematically 
                        analyzes the 24 Thanas (spiritual classifications) across all 14 Gunasthanas (stages of 
                        spiritual development). This authoritative work provides detailed definitions and 
                        explanations of fundamental Jain concepts.
                    </p>
                </div>
                
                <div style="background: #fef7ed; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #d97706; font-size: 18px;">🏛️ Publisher Details</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8; font-size: 14px;">
                        <li><strong>Institution:</strong> Vidhyasagar Pathshala</li>
                        <li><strong>Publication Year:</strong> 2017</li>
                        <li><strong>Format:</strong> Digital PDF</li>
                        <li><strong>Language:</strong> Hindi with Sanskrit terminology</li>
                        <li><strong>Content:</strong> 24 Thana analysis across 14 Gunasthanas</li>
                    </ul>
                </div>
                
                <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #22c55e; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #16a34a; font-size: 18px;">✅ Content Verification</h3>
                    <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 14px;">
                        Every definition, classification, and spiritual concept in this application has been 
                        carefully extracted and verified against the book written by Niryapak Muni Shri Prashantsagar Ji Maharaj with the blessings of Acharya Shri Vidyasagar ji Maharaj.
                        No modifications or interpretations have been added beyond organizing the content for digital accessibility.
                    </p>
                </div>
                
                <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; border-left: 4px solid #ec4899; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #be185d; font-size: 18px;">🙏 Acknowledgment</h3>
                    <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 14px;">
                        We express our deepest gratitude to Vidhyasagar Pathshala for making this invaluable 
                        knowledge freely available. This digital application serves as a modern interface to 
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
}

// Show gunasthan detail - DEFINE EARLY
function showGunasthanDetail(gunasthanId) {
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
}

// Helper function for search on enter - DEFINE EARLY
function searchOnEnter(event) {
    if (event.key === 'Enter') {
        searchDefinitions(event.target.value);
    }
}

// Helper function to search from input button - DEFINE EARLY
function searchDefinitionsFromInput() {
    const searchValue = document.getElementById('definition-search').value;
    searchDefinitions(searchValue);
}

// Helper function to close tooltip modal - DEFINE EARLY
function closeTooltipModal(event) {
    closeTooltip(event);
}

// Helper function to stop propagation - DEFINE EARLY
function stopPropagation(event) {
    event.stopPropagation();
}

// Initialize the application
function initializeApp() {
    if (isInitialized) return;
    
    console.log('🚀 Initializing Gunasthan App...');
    
    // Load initial content
    loadOverview();
    
    // Initialize voice search if supported
    initVoiceSearch();
    
    // Set up event listeners
    setupEventListeners();
    
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
            showTab(tabName);
            return;
        }
        
        // Handle other click events
        if (clickHandler && window[clickHandler]) {
            e.preventDefault();
            e.stopPropagation();
            
            // Special cases for functions that need parameters
            switch(clickHandler) {
                case 'closeTooltipModal':
                    closeTooltip(e);
                    break;
                case 'stopPropagation':
                    e.stopPropagation();
                    break;
                case 'searchDefinitionsFromInput':
                    const searchValue = document.getElementById('definition-search').value;
                    searchDefinitions(searchValue);
                    break;
                case 'showDetailedTooltip':
                    const gunasthan = e.target.closest('[data-gunasthan]').getAttribute('data-gunasthan');
                    const thana = e.target.closest('[data-thana]').getAttribute('data-thana');
                    showDetailedTooltip(parseInt(gunasthan), parseInt(thana));
                    break;
                case 'showNewDetailedTooltip':
                    const matrixType = e.target.closest('[data-matrix-type]').getAttribute('data-matrix-type');
                    const thanaIndex = e.target.closest('[data-thana-index]').getAttribute('data-thana-index');
                    const colIndex = e.target.closest('[data-col-index]').getAttribute('data-col-index');
                    showNewDetailedTooltip(matrixType, parseInt(thanaIndex), parseInt(colIndex));
                    break;
                case 'findDefinitionByThana':
                    const thanaName = e.target.getAttribute('data-thana-name');
                    const conceptName = e.target.getAttribute('data-concept-name');
                    findDefinitionByThana(thanaName, conceptName);
                    break;
                case 'scrollToGunasthan':
                    const gunasthanId = e.target.closest('[data-gunasthan-id]').getAttribute('data-gunasthan-id');
                    scrollToGunasthan(parseInt(gunasthanId));
                    break;
                default:
                    window[clickHandler]();
            }
        }
        
        // Handle modal background clicks
        if (e.target.id === 'tooltip-modal') {
            closeTooltip(e);
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
                searchDefinitions(e.target.value);
            }
        }
        
        // Global escape key handler
        if (e.key === 'Escape') {
            closeTooltip();
        }
    });
    
    // Handle keydown for escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTooltip();
        }
    });
}

// Tab switching functionality
function showTab(tabName) {
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
        tab.textContent.toLowerCase() === tabName
    );
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Update current tab
    currentTab = tabName;
    updateSearchContext(tabName);
    
    // Load content based on tab
    switch(tabName) {
        case 'overview':
            if (!document.getElementById('gunasthan-list').innerHTML) {
                loadOverview();
            }
            break;
        case 'matrix':
            if (!document.getElementById('matrix-table').innerHTML) {
                loadMatrix();
            }
            break;
        case 'transitions':
            if (!document.getElementById('transitions-list').innerHTML) {
                loadTransitions();
            }
            break;
        case 'definitions':
            if (!document.getElementById('definitions-list').innerHTML) {
                loadDefinitions();
            }
            break;
    }
}

// Load Overview with PDF Source Disclaimer
function loadOverview() {
    const container = document.getElementById('gunasthan-list');
    
    let html = `
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 16px; padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden;">
            <!-- Decorative background pattern -->
            <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: linear-gradient(45deg, rgba(14, 165, 233, 0.1), rgba(59, 130, 246, 0.1)); border-radius: 50%; z-index: 0;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: linear-gradient(-45deg, rgba(14, 165, 233, 0.08), rgba(59, 130, 246, 0.08)); border-radius: 50%; z-index: 0;"></div>
            
            <div style="position: relative; z-index: 1;">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                    <div style="background: #0ea5e9; color: white; padding: 12px; border-radius: 12px; font-size: 24px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);">
                        📚
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                            🙏 Source & Acknowledgment | स्रोत एवं आभार
                        </h3>
                        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
                            This application is based entirely on the authentic text <strong>"श्री चौबीस ठाणा चर्चा"</strong> 
                            by Niryapak Muni Prashantsagarji Maharaj. All data, definitions, and spiritual concepts have been 
                            carefully extracted from this authoritative source.
                        </p>
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.9); border-radius: 12px; padding: 16px; border: 1px solid rgba(14, 165, 233, 0.2); margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <span style="font-size: 18px;">📖</span>
                        <strong style="color: #0f172a; font-size: 16px;">Original Text:</strong>
                        <span style="color: #7c3aed; font-weight: 600; font-size: 16px;">श्री चौबीस ठाणा चर्चा</span>
                    </div>
                    <div style="color: #475569; font-size: 13px; line-height: 1.5;">
                        <strong>Author:</strong> Niryapak Shraman Muni Shri Prashantsagar Maharaj <br>
                        <strong>Content:</strong> Complete analysis of 24 Thanas across 14 Gunasthanas with detailed definitions<br>
                        <strong>Language:</strong> Hindi
                    </div>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
                    <a href="http://vidhyasagarpathshala.com/wp-content/uploads/2017/12/%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80-%E0%A4%9A%E0%A5%8C%E0%A4%AC%E0%A5%80%E0%A4%B8-%E0%A4%A0%E0%A4%BE%E0%A4%A3%E0%A4%BE-%E0%A4%9A%E0%A4%B0%E0%A5%8D%E0%A4%9A%E0%A4%BE.pdf" 
                    target="_blank" 
                    style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); transition: all 0.3s ease;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(220, 38, 38, 0.4)'"
                    onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 12px rgba(220, 38, 38, 0.3)'">
                        <span style="font-size: 16px;">📄</span>
                        Download Original PDF | मूल PDF डाउनलोड करें
                    </a>
                    
                    <button data-click="showSourceInfo" 
                            style="background: rgba(14, 165, 233, 0.1); border: 2px solid #0ea5e9; color: #0ea5e9; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.3s ease;"
                            onmouseover="this.style.background='rgba(14, 165, 233, 0.2)'"
                            onmouseout="this.style.background='rgba(14, 165, 233, 0.1)'">
                        ℹ️ More About Source
                    </button>
                    
                    <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; color: #16a34a; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ✅ 100% Authentic Content
                    </div>
                </div>
                
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(14, 165, 233, 0.2); font-size: 12px; color: #64748b; text-align: center; font-style: italic;">
                    🙏 We express our gratitude to Vidhyasagar Pathshala for making this knowledge accessible. 
                    This digital application serves as a modern interface to the timeless wisdom contained in the original text.
                </div>
            </div>
        </div>

        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #cbd5e1; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
            <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 22px; font-weight: 700;">
                Explore the Application Sections
            </h3>
            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Navigate through different tabs to explore the comprehensive analysis of 24 Thanas across 14 Gunasthanas
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 20px;">
                <div data-click="showMatrixTab" style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.3s ease; text-align: center;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; this.style.borderColor='#3b82f6'"
                    onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='none'; this.style.borderColor='#e2e8f0'">
                    <div style="font-size: 32px; margin-bottom: 8px;">📊</div>
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Matrix View</div>
                    <div style="font-size: 12px; color: #64748b;">24×14 comprehensive grid</div>
                </div>
                
                <div data-click="showTransitionsTab" style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.3s ease; text-align: center;"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; this.style.borderColor='#10b981'"
                    onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='none'; this.style.borderColor='#e2e8f0'">
                    <div style="font-size: 32px; margin-bottom: 8px;">🔄</div>
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Transitions</div>
                    <div style="font-size: 12px; color: #64748b;">गुणस्थान आरोहण-अवरोहण</div>
                </div>
                
                <div data-click="showDefinitionsTab" style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.3s ease; text-align: center;"
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
}

// Show detailed source information
function showSourceInfo() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.3s ease; padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 30px; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative;">
            <button onclick="this.closest('div').parentElement.remove()" 
                    style="position: absolute; top: 15px; right: 15px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-weight: bold; font-size: 16px;">×</button>
            
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 15px;">🕉️</div>
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px;">श्री चौबीस ठाणा चर्चा</h2>
                <p style="color: #6b7280; margin: 0; font-size: 16px;">Complete Source Information</p>
            </div>
            
            <div style="space-y: 20px;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 18px;">📖 About the Text</h3>
                    <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 14px;">
                        "श्री चौबीस ठाणा चर्चा" is a comprehensive Jain philosophical text that systematically 
                        analyzes the 24 Thanas (spiritual classifications) across all 14 Gunasthanas (stages of 
                        spiritual development). This authoritative work provides detailed definitions and 
                        explanations of fundamental Jain concepts.
                    </p>
                </div>
                
                <div style="background: #fef7ed; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #d97706; font-size: 18px;">🏛️ Publisher Details</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8; font-size: 14px;">
                        <li><strong>Institution:</strong> Vidhyasagar Pathshala</li>
                        <li><strong>Publication Year:</strong> 2017</li>
                        <li><strong>Format:</strong> Digital PDF</li>
                        <li><strong>Language:</strong> Hindi with Sanskrit terminology</li>
                        <li><strong>Content:</strong> 24 Thana analysis across 14 Gunasthanas</li>
                    </ul>
                </div>
                
                <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #22c55e; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #16a34a; font-size: 18px;">✅ Content Verification</h3>
                    <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 14px;">
                        Every definition, classification, and spiritual concept in this application has been 
                        carefully extracted and verified against the book written by Niryapak Muni Shri Prashantsagar Ji Maharaj with the blessings of Acharya Shri Vidyasagar ji Maharaj.
                        No modifications or interpretations have been added beyond organizing the content for digital accessibility.
                    </p>
                </div>
                
                <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; border-left: 4px solid #ec4899; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #be185d; font-size: 18px;">🙏 Acknowledgment</h3>
                    <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 14px;">
                        We express our deepest gratitude to Vidhyasagar Pathshala for making this invaluable 
                        knowledge freely available. This digital application serves as a modern interface to 
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
}

// Show gunasthan detail
function showGunasthanDetail(gunasthanId) {
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
}

// Helper functions for tab navigation from overview cards
function showMatrixTab() {
    showTab('matrix');
}

function showTransitionsTab() {
    showTab('transitions');
}

function showDefinitionsTab() {
    showTab('definitions');
}

// Helper function for search on enter
function searchOnEnter(event) {
    if (event.key === 'Enter') {
        searchDefinitions(event.target.value);
    }
}

// Helper function to search from input button
function searchDefinitionsFromInput() {
    const searchValue = document.getElementById('definition-search').value;
    searchDefinitions(searchValue);
}

// Helper function to close tooltip modal
function closeTooltipModal(event) {
    closeTooltip(event);
}

// Helper function to stop propagation
function stopPropagation(event) {
    event.stopPropagation();
}

// IMMEDIATE FUNCTION EXPOSURE - MUST BE FIRST
// This ensures functions are available for any onclick handlers before DOM parsing
const exposeFunctionsGlobally = () => {
    // Core navigation functions - these are called by old onclick handlers
    window.showTab = showTab;  // CRITICAL: This must be available immediately
    
    // Tab functions
    window.loadOverview = loadOverview;
    window.showSourceInfo = showSourceInfo;
    window.showGunasthanDetail = showGunasthanDetail;

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
    
    // Helper functions for event handling
    window.searchOnEnter = searchOnEnter;
    window.searchDefinitionsFromInput = searchDefinitionsFromInput;
    window.closeTooltipModal = closeTooltipModal;
    window.stopPropagation = stopPropagation;
    window.showMatrixTab = showMatrixTab;
    window.showTransitionsTab = showTransitionsTab;
    window.showDefinitionsTab = showDefinitionsTab;
    
    console.log('✅ All functions exposed globally');
};

// EXPOSE FUNCTIONS IMMEDIATELY - BEFORE ANYTHING ELSE
exposeFunctionsGlobally();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for potential module usage
export { 
    initializeApp, 
    showTab, 
    loadOverview, 
    showGunasthanDetail,
    currentTab
};
