// Search Component
import { searchDefinitions } from './definitions.js';
import { searchInTransitions } from './transitions.js';
import { thanasData } from '../data/definitions.js';
import { matrixData } from '../data/matrix.js';
import { showMessage } from '../utils/helpers.js';

export function initSearch() {
    // Add search functionality if needed
    // This can be expanded based on requirements
}

// Main search function that routes to appropriate search handlers
export function performSearch(searchTerm, activeTab) {
    if (!searchTerm || searchTerm.trim() === '') {
        clearSearch();
        return;
    }
    
    const term = searchTerm.trim();
    
    switch(activeTab) {
        case 'overview':
            searchInOverview(term);
            break;
        case 'matrix':
            searchInMatrix(term);
            break;
        case 'transitions':
            searchInTransitions(term);
            break;
        case 'definitions':
            searchDefinitions(term);
            break;
        default:
            break;
    }
}

// Search in overview (gunasthanas)
function searchInOverview(searchTerm) {
    const term = searchTerm.toLowerCase();
    let found = false;
    
    document.querySelectorAll('.gunasthan-card').forEach(card => {
        const name = card.querySelector('.gunasthan-name');
        const sanskrit = card.querySelector('.gunasthan-sanskrit');
        const english = card.querySelector('.gunasthan-english');
        const description = card.querySelector('.gunasthan-description');
        
        let matchFound = false;
        
        if (name && name.textContent.includes(searchTerm)) matchFound = true;
        if (sanskrit && sanskrit.textContent.toLowerCase().includes(term)) matchFound = true;
        if (english && english.textContent.toLowerCase().includes(term)) matchFound = true;
        if (description && description.textContent.toLowerCase().includes(term)) matchFound = true;
        
        if (matchFound) {
            found = true;
            card.style.background = '#f0f9ff';
            card.style.border = '2px solid #3b82f6';
            card.classList.add('search-highlight');
            
            // Scroll to first match
            if (document.querySelectorAll('.search-highlight').length === 1) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            card.style.background = '';
            card.style.border = '';
            card.classList.remove('search-highlight');
        }
    });
    
    if (found) {
        showMessage('info', `🔍 Highlighted gunasthanas matching: ${searchTerm}`);
    } else {
        showMessage('warning', `No gunasthanas found matching: ${searchTerm}`);
    }
}

// Search in matrix (thanas)
function searchInMatrix(searchTerm) {
    const term = searchTerm.toLowerCase();
    let found = false;
    
    document.querySelectorAll('.matrix-table tr').forEach(row => {
        const thanaHeader = row.querySelector('.thana-header');
        if (thanaHeader) {
            const text = thanaHeader.textContent;
            if (text.includes(searchTerm) || text.toLowerCase().includes(term)) {
                found = true;
                row.style.background = '#f0f9ff';
                row.style.border = '2px solid #3b82f6';
                row.classList.add('search-highlight');
                
                // Scroll to first match
                if (document.querySelectorAll('.search-highlight').length === 1) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                row.style.background = '';
                row.style.border = '';
                row.classList.remove('search-highlight');
            }
        }
    });
    
    if (found) {
        showMessage('info', `🔍 Highlighted thanas matching: ${searchTerm}`);
    } else {
        showMessage('warning', `No thanas found matching: ${searchTerm}`);
    }
}

// Clear search highlights
function clearSearch() {
    document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
        el.style.background = '';
        el.style.border = '';
    });
}

// Quick search function for external use
export function quickSearch(searchTerm) {
    // Determine current active tab
    const activeTab = document.querySelector('.tab.active');
    const tabName = activeTab ? activeTab.textContent.toLowerCase() : 'overview';
    
    performSearch(searchTerm, tabName);
}

// Find definition by thana name (for matrix tooltips)
export function findDefinitionByThana(thanaName, conceptName) {
    // Switch to definitions tab
    window.showTab('definitions');
    
    // Wait for tab switch
    setTimeout(() => {
        searchDefinitions(thanaName);
        showMessage('info', `🔍 Showing definitions for ${thanaName} category (related to: ${conceptName})`);
    }, 300);
}
