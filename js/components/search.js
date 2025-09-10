// Search Component - Universal search functionality

import { gunasthansData } from '../data/gunasthans.js';
import { thanasData, matrixData } from '../data/matrix.js';
import { showMessage, clearSearchHighlights } from '../utils/helpers.js';

// Universal Search Functionality
export function handleUniversalSearch(searchTerm) {
    const activeTab = document.querySelector('.tab.active').textContent.toLowerCase();
    updateSearchContext(activeTab);
    
    if (!searchTerm.trim()) {
        clearSearch();
        return;
    }
    
    switch(activeTab) {
        case 'overview':
            searchInOverview(searchTerm);
            break;
        case 'matrix':
            if (window.searchInMatrix) {
                window.searchInMatrix(searchTerm);
            }
            break;
        case 'transitions':
            if (window.searchInTransitions) {
                window.searchInTransitions(searchTerm);
            }
            break;
        case 'definitions':
            if (window.searchDefinitions) {
                window.searchDefinitions(searchTerm);
            }
            break;
        default:
            break;
    }
}

// Update search context
export function updateSearchContext(activeTab) {
    const contextElement = document.getElementById('search-context');
    const contexts = {
        'overview': 'Overview Mode',
        'matrix': 'Matrix Mode', 
        'transitions': 'Transitions Mode',
        'definitions': 'Definitions Mode'
    };
    
    if (contextElement) {
        contextElement.textContent = contexts[activeTab] || 'Search Mode';
    }
}

// Clear search
export function clearSearch() {
    // Clear any search highlights or filters
    clearSearchHighlights();
    
    // Reset any filtered content
    const activeTab = document.querySelector('.tab.active').textContent.toLowerCase();
    if (activeTab === 'overview' && !document.getElementById('gunasthan-list').innerHTML.includes('Enter a search term')) {
        if (window.loadOverview) {
            window.loadOverview();
        }
    }
}

// Search in overview
export function searchInOverview(searchTerm) {
    const term = searchTerm.toLowerCase();
    let found = false;
    let resultsHtml = '<div style="margin-bottom: 20px; padding: 16px; background: #f0f9ff; border-radius: 12px; border: 1px solid #3b82f6;"><h3 style="color: #1e40af; margin-bottom: 8px;">🔍 Search Results in Overview</h3><p style="color: #1e40af; margin: 0;">Found Gunasthanas matching: <strong>' + searchTerm + '</strong></p></div>';
    
    Object.keys(gunasthansData).forEach(id => {
        const g = gunasthansData[id];
        if (g.nameHi.includes(searchTerm) || 
            g.nameEn.toLowerCase().includes(term) ||
            g.english.toLowerCase().includes(term) ||
            g.description.toLowerCase().includes(term)) {
            found = true;
            
            resultsHtml += `
                <div class="gunasthan-card search-highlight" style="border: 2px solid #3b82f6; background: #f0f9ff;">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span class="gunasthan-number" style="background: ${g.color}">${id}</span>
                        <div style="flex: 1;">
                            <div class="gunasthan-name">${g.nameHi}</div>
                            <div class="gunasthan-sanskrit">${g.nameEn} - ${g.english}</div>
                        </div>
                    </div>
                    <div class="gunasthan-description">${g.description}</div>
                    <div style="margin-top: 12px; text-align: center;">
                        <button onclick="showGunasthanDetail(${id})" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">View Details</button>
                    </div>
                </div>
            `;
        }
    });
    
    if (!found) {
        resultsHtml += '<div style="text-align: center; padding: 40px; color: #6b7280;">No Gunasthanas found matching your search.</div>';
    }
    
    document.getElementById('gunasthan-list').innerHTML = resultsHtml;
}

// Search thanas specifically
export function searchThanas(searchTerm) {
    const results = document.getElementById('search-results');
    
    if (!searchTerm) {
        results.innerHTML = '<div class="loading">Enter a search term to find Thanas...</div>';
        return;
    }
    
    const term = searchTerm.toLowerCase();
    let html = '';
    let found = false;
    
    thanasData.forEach((thana, index) => {
        if (thana.nameHi.includes(searchTerm) || 
            thana.nameEn.toLowerCase().includes(term) ||
            thana.english.toLowerCase().includes(term)) {
            found = true;
            
            // Calculate summary across all gunasthans
            let minCount = Infinity, maxCount = 0;
            let minGunasthan = null, maxGunasthan = null;
            
            for (let g = 1; g <= 14; g++) {
                const count = matrixData[g][index];
                if (count < minCount) {
                    minCount = count;
                    minGunasthan = g;
                }
                if (count > maxCount) {
                    maxCount = count;
                    maxGunasthan = g;
                }
            }
            
            html += `
                <div class="gunasthan-card">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 24px; margin-right: 12px;">${thana.icon}</span>
                        <div>
                            <div style="font-size: 18px; font-weight: 600;">${thana.nameHi}</div>
                            <div style="color: #6b7280;">${thana.nameEn} - ${thana.english}</div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
                        <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #86efac;">
                            <div style="font-size: 12px; color: #16a34a;">Maximum in</div>
                            <div style="font-weight: 600;">G${maxGunasthan}: ${maxCount}/${thana.total}</div>
                        </div>
                        <div style="background: #fef2f2; padding: 12px; border-radius: 8px; border: 1px solid #fca5a5;">
                            <div style="font-size: 12px; color: #dc2626;">Minimum in</div>
                            <div style="font-weight: 600;">G${minGunasthan}: ${minCount}/${thana.total}</div>
                        </div>
                    </div>
                    <div style="margin-top: 12px;">
                        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Subtypes (${thana.subtypes.length}):</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${thana.subtypes.slice(0, 5).map(s => `<span class="item-tag" onclick="findAndShowDefinition('${s}')">${s}</span>`).join('')}
                            ${thana.subtypes.length > 5 ? `<span class="item-tag">+${thana.subtypes.length - 5} more</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    if (!found) {
        html = '<div class="loading">No results found. Try searching in Hindi or English...</div>';
    }
    
    results.innerHTML = html;
}

// Advanced search functionality
export function performAdvancedSearch(query, filters = {}) {
    const results = {
        gunasthans: [],
        thanas: [],
        definitions: [],
        transitions: []
    };
    
    const term = query.toLowerCase();
    
    // Search Gunasthans
    Object.keys(gunasthansData).forEach(id => {
        const g = gunasthansData[id];
        if (g.nameHi.includes(query) || 
            g.nameEn.toLowerCase().includes(term) ||
            g.english.toLowerCase().includes(term) ||
            g.description.toLowerCase().includes(term)) {
            results.gunasthans.push({
                id: id,
                data: g,
                type: 'gunasthan'
            });
        }
    });
    
    // Search Thanas
    thanasData.forEach((thana, index) => {
        if (thana.nameHi.includes(query) || 
            thana.nameEn.toLowerCase().includes(term) ||
            thana.english.toLowerCase().includes(term)) {
            results.thanas.push({
                index: index,
                data: thana,
                type: 'thana'
            });
        }
    });
    
    return results;
}

// Get search suggestions
export function getSearchSuggestions(query) {
    const suggestions = [];
    const term = query.toLowerCase();
    
    if (query.length < 2) return suggestions;
    
    // Gunasthan suggestions
    Object.keys(gunasthansData).forEach(id => {
        const g = gunasthansData[id];
        if (g.nameHi.toLowerCase().includes(term) || 
            g.nameEn.toLowerCase().includes(term)) {
            suggestions.push({
                text: `${g.nameHi} (${g.nameEn})`,
                type: 'gunasthan',
                id: id
            });
        }
    });
    
    // Thana suggestions
    thanasData.forEach((thana, index) => {
        if (thana.nameHi.toLowerCase().includes(term) || 
            thana.nameEn.toLowerCase().includes(term)) {
            suggestions.push({
                text: `${thana.nameHi} (${thana.nameEn})`,
                type: 'thana',
                index: index
            });
        }
    });
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
}

// Search with filters
export function searchWithFilters(query, filters) {
    const results = performAdvancedSearch(query, filters);
    
    // Apply filters
    if (filters.type) {
        Object.keys(results).forEach(key => {
            if (key !== filters.type) {
                results[key] = [];
            }
        });
    }
    
    if (filters.gunasthanRange) {
        const [min, max] = filters.gunasthanRange;
        results.gunasthans = results.gunasthans.filter(item => {
            const id = parseInt(item.id);
            return id >= min && id <= max;
        });
    }
    
    return results;
}
