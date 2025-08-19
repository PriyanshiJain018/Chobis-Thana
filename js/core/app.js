// Main Application Controller
import { gunasthansData } from '../data/gunasthans.js';
import { thanasData, definitionsDatabase } from '../data/definitions.js';
import { matrixData, additionalMatrices, transitionRules } from '../data/matrix.js';
import { initMatrix } from '../components/matrix.js';
import { initDefinitions } from '../components/definitions.js';
import { initTransitions } from '../components/transitions.js';
import { initSearch } from '../components/search.js';
import { showMessage } from '../utils/helpers.js';

// App state
let currentTab = 'overview';
let selectedMatrix = 'default';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadOverview();
    initSearch();
});

// Tab management
window.showTab = function(tab) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    const tabContent = document.getElementById(`${tab}-content`);
    const tabButton = document.querySelector(`.tab[onclick="showTab('${tab}')"]`);
    
    if (tabContent) {
        tabContent.classList.remove('hidden');
    }
    if (tabButton) {
        tabButton.classList.add('active');
    }
    
    // Load tab content
    currentTab = tab;
    switch(tab) {
        case 'overview':
            loadOverview();
            break;
        case 'matrix':
            initMatrix();
            break;
        case 'transitions':
            initTransitions();
            break;
        case 'definitions':
            initDefinitions();
            break;
    }
};

// Load overview content
function loadOverview() {
    const container = document.getElementById('gunasthan-list');
    if (!container) return;
    
    let html = '';
    
    Object.keys(gunasthansData).forEach(id => {
        const g = gunasthansData[id];
        const number = parseInt(id);
        
        html += `
            <div class="gunasthan-card" onclick="showGunasthanDetail(${id})">
                <div class="gunasthan-header">
                    <div class="gunasthan-number" style="background: ${g.color}">${number}</div>
                    <div class="gunasthan-info">
                        <div class="gunasthan-name">${g.nameHi}</div>
                        <div class="gunasthan-sanskrit">${g.nameEn}</div>
                        <div class="gunasthan-english">${g.english}</div>
                    </div>
                </div>
                <div class="gunasthan-description">${g.description}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Show detailed gunasthan info
window.showGunasthanDetail = function(gunasthanId) {
    const g = gunasthansData[gunasthanId];
    if (!g) return;
    
    const transitions = transitionRules[gunasthanId];
    let message = `${g.nameHi} (${g.nameEn})\n`;
    message += `${g.english}\n\n`;
    message += `${g.description}\n\n`;
    
    if (transitions) {
        message += `🔄 Transitions: ${transitions.description}\n`;
        if (transitions.canGoTo.length > 0) {
            message += `Can go to: ${transitions.canGoTo.map(id => `G${id}`).join(', ')}`;
        } else {
            message += `🎯 Final stage - Liberation awaits!`;
        }
    }
    
    alert(message);
};

// Tooltip management
window.closeTooltip = function(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('tooltip-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// Make utilities available globally
window.showMessage = showMessage;

// Export for other modules
export { currentTab, selectedMatrix, gunasthansData, thanasData, definitionsDatabase, matrixData };
