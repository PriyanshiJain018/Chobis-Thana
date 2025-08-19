// Definitions Component - Handles definitions display and search

import { definitionsDatabase } from '../data/definitions.js';
import { showMessage, highlightSearchResult } from '../utils/helpers.js';

// Load all definitions
export function loadDefinitions() {
    const container = document.getElementById('definitions-list');
    let html = '';
    
    Object.keys(definitionsDatabase).forEach(categoryKey => {
        const category = definitionsDatabase[categoryKey];
        
        html += `
            <div class="category-section">
                <div class="category-header" onclick="toggleCategory('${categoryKey}')">
                    <div class="category-title">${category.title}</div>
                    <div class="category-subtitle">${category.titleEn} - ${category.english}</div>
                </div>
                <div id="category-${categoryKey}" class="collapsible-content">
                    <div style="margin-bottom: 12px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                        ${category.description}
                    </div>
        `;
        
        Object.keys(category.definitions).forEach(defKey => {
            const def = category.definitions[defKey];
            
            html += `
                <div class="definition-card" id="def-${defKey}">
                    <div class="definition-header">
                        <div>
                            <div class="definition-title">${def.nameHi} (${def.nameEn})</div>
                            <div class="definition-subtitle">${def.english}</div>
                        </div>
                        ${def.additionalNotes || (def.subtypes && Object.keys(def.subtypes).length > 0) ? 
                            `<button class="know-more-btn" onclick="toggleAdditionalInfo('${defKey}')">
                                <span id="toggle-text-${defKey}">Show Details</span>
                            </button>` : ''}
                    </div>
                    <div class="definition-content">${def.definition}</div>
            `;
            
            if (def.additionalNotes) {
                html += `
                    <div id="additional-${defKey}" class="additional-notes" style="display: none;">
                        <strong>विशेष:</strong> ${def.additionalNotes}
                    </div>
                `;
            }
            
            if (def.subtypes && Object.keys(def.subtypes).length > 0) {
                html += `
                    <div id="subtypes-${defKey}" class="sub-definitions" style="display: none;">
                        <h4 style="margin-bottom: 12px; color: #374151;">Sub-types:</h4>
                `;
                
                Object.keys(def.subtypes).forEach(subKey => {
                    const subDef = def.subtypes[subKey];
                    html += `
                        <div class="sub-definition" onclick="showSubDefinitionDetail('${subKey}')">
                            <div class="sub-definition-title">${subDef.nameHi} (${subDef.nameEn})
                                ${subDef.subtypes && Object.keys(subDef.subtypes).length > 0 ? 
                                    `<button class="know-more-btn" style="margin-left: 8px; font-size: 10px; padding: 4px 8px;" onclick="event.stopPropagation(); toggleNestedSubtypes('${subKey}')">
                                        <span id="nested-toggle-${subKey}">+</span>
                                    </button>` : ''}
                            </div>
                            <div class="sub-definition-content">${subDef.definition}</div>
                            ${subDef.additionalNotes ? `<div style="margin-top: 8px; font-style: italic; color: #78350f;"><strong>विशेष:</strong> ${subDef.additionalNotes}</div>` : ''}
                            
                            ${subDef.subtypes && Object.keys(subDef.subtypes).length > 0 ? `
                                <div id="nested-subtypes-${subKey}" class="sub-definitions" style="display: none; margin-left: 20px; margin-top: 12px; border-left: 3px solid #e5e7eb; padding-left: 12px;">
                                    <h5 style="margin-bottom: 8px; color: #374151; font-size: 14px;">Sub-categories:</h5>
                                    ${Object.keys(subDef.subtypes).map(nestedKey => {
                                        const nestedDef = subDef.subtypes[nestedKey];
                                        return `
                                            <div class="sub-definition" style="margin-bottom: 8px; padding: 8px; background: #f9fafb; border-radius: 6px;" onclick="showNestedDefinitionDetail('${nestedKey}', '${subKey}')">
                                                <div class="sub-definition-title" style="font-size: 13px;">${nestedDef.nameHi} (${nestedDef.nameEn})</div>
                                                <div class="sub-definition-content" style="font-size: 12px;">${nestedDef.definition}</div>
                                                ${nestedDef.additionalNotes ? `<div style="margin-top: 6px; font-style: italic; color: #78350f; font-size: 11px;"><strong>विशेष:</strong> ${nestedDef.additionalNotes}</div>` : ''}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                });
                
                html += '</div>';
            }
            
            html += '</div>';
        });
        
        html += '</div></div>';
    });
    
    container.innerHTML = html;
}

// Search definitions
export function searchDefinitions(searchTerm) {
    if (!searchTerm) {
        loadDefinitions();
        return;
    }
    
    const term = searchTerm.toLowerCase();
    const container = document.getElementById('definitions-list');
    let html = '';
    let found = false;
    let matchedSubtypes = []; // Track which subtypes matched for auto-expansion
    
    Object.keys(definitionsDatabase).forEach(categoryKey => {
        const category = definitionsDatabase[categoryKey];
        let categoryHtml = '';
        let categoryFound = false;
        
        Object.keys(category.definitions).forEach(defKey => {
            const def = category.definitions[defKey];
            let defFound = false;
            let hasSubtypeMatch = false;
            let matchedSubtypeKeys = [];
            
            // Check main definition with null checks
            if ((def.nameHi && def.nameHi.includes(searchTerm)) || 
                (def.nameEn && def.nameEn.toLowerCase().includes(term)) ||
                (def.english && def.english.toLowerCase().includes(term)) ||
                (def.definition && def.definition.includes(searchTerm))) {
                defFound = true;
            }
            
            // Check subtypes with null checks
            if (def.subtypes && Object.keys(def.subtypes).length > 0) {
                Object.keys(def.subtypes).forEach(subKey => {
                    const subDef = def.subtypes[subKey];
                    if ((subDef.nameHi && subDef.nameHi.includes(searchTerm)) || 
                        (subDef.nameEn && subDef.nameEn.toLowerCase().includes(term)) ||
                        (subDef.english && subDef.english.toLowerCase().includes(term)) ||
                        (subDef.definition && subDef.definition.includes(searchTerm)) ||
                        (subDef.additionalNotes && subDef.additionalNotes.includes(searchTerm))) {
                        defFound = true;
                        hasSubtypeMatch = true;
                        matchedSubtypeKeys.push(subKey);
                    }
                });
            }
            
            if (defFound) {
                found = true;
                categoryFound = true;
                
                // Store info for auto-expansion
                if (hasSubtypeMatch) {
                    matchedSubtypes.push({
                        defKey: defKey,
                        subtypeKeys: matchedSubtypeKeys
                    });
                }
                
                categoryHtml += `
                    <div class="definition-card" id="def-${defKey}">
                        <div class="definition-header">
                            <div>
                                <div class="definition-title">${def.nameHi || ''} (${def.nameEn || ''})</div>
                                <div class="definition-subtitle">${def.english || ''}</div>
                            </div>
                            ${def.additionalNotes || (def.subtypes && Object.keys(def.subtypes).length > 0) ? 
                                `<button class="know-more-btn" onclick="toggleAdditionalInfo('${defKey}')">Know More</button>` : ''}
                        </div>
                        <div class="definition-content">${def.definition || ''}</div>
                `;
                
                if (def.additionalNotes) {
                    categoryHtml += `
                        <div id="additional-${defKey}" class="additional-notes" style="${hasSubtypeMatch ? 'display: block;' : 'display: none;'}">
                            <strong>विशेष:</strong> ${def.additionalNotes}
                        </div>
                    `;
                }
                
                if (def.subtypes && Object.keys(def.subtypes).length > 0) {
                    categoryHtml += `
                        <div id="subtypes-${defKey}" class="sub-definitions" style="${hasSubtypeMatch ? 'display: block;' : 'display: none;'}">
                            <h4 style="margin-bottom: 12px; color: #374151;">Sub-types:</h4>
                    `;
                    
                    Object.keys(def.subtypes).forEach(subKey => {
                        const subDef = def.subtypes[subKey];
                        const isMatched = matchedSubtypeKeys.includes(subKey);
                        categoryHtml += `
                            <div class="sub-definition" id="subdef-${subKey}" style="${isMatched ? 'background: #fef3c7; border: 2px solid #f59e0b;' : ''}">
                                <div class="sub-definition-title">${subDef.nameHi || ''} (${subDef.nameEn || ''})</div>
                                <div class="sub-definition-content">${subDef.definition || ''}</div>
                                ${subDef.additionalNotes ? `<div style="margin-top: 8px; font-style: italic; color: #78350f;"><strong>विशेष:</strong> ${subDef.additionalNotes}</div>` : ''}
                            </div>
                        `;
                    });
                    
                    categoryHtml += '</div>';
                }
                
                categoryHtml += '</div>';
            }
        });
        
        if (categoryFound) {
            html += `
                <div class="category-section">
                    <div class="category-header">
                        <div class="category-title">${category.title || ''}</div>
                        <div class="category-subtitle">${category.titleEn || ''} - ${category.english || ''}</div>
                    </div>
                    <div class="collapsible-content expanded">
                        ${categoryHtml}
                    </div>
                </div>
            `;
        }
    });
    
    if (!found) {
        html = '<div class="loading">No definitions found for your search term...</div>';
    }
    
    container.innerHTML = html;
    
    // Auto-scroll to first matched subtype if any
    if (matchedSubtypes.length > 0) {
        setTimeout(() => {
            const firstMatch = matchedSubtypes[0];
            const firstSubtype = firstMatch.subtypeKeys[0];
            const element = document.getElementById(`subdef-${firstSubtype}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add pulse animation
                element.style.animation = 'pulse 2s ease-in-out';
                setTimeout(() => {
                    element.style.animation = '';
                }, 2000);
            } else {
                // Fallback to main definition
                const defElement = document.getElementById(`def-${firstMatch.defKey}`);
                if (defElement) {
                    defElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 300);
    }
}

// Clear definition search
export function clearDefinitionSearch() {
    document.getElementById('definition-search').value = '';
    loadDefinitions();
}

// Toggle category expansion
export function toggleCategory(categoryKey) {
    const element = document.getElementById(`category-${categoryKey}`);
    element.classList.toggle('expanded');
}

// Toggle additional information
export function toggleAdditionalInfo(defKey) {
    const additionalElement = document.getElementById(`additional-${defKey}`);
    const subtypesElement = document.getElementById(`subtypes-${defKey}`);
    const toggleButton = document.getElementById(`toggle-text-${defKey}`);
    
    let isVisible = false;
    
    if (additionalElement) {
        const currentDisplay = additionalElement.style.display;
        const newDisplay = currentDisplay === 'none' ? 'block' : 'none';
        additionalElement.style.display = newDisplay;
        if (newDisplay === 'block') isVisible = true;
    }
    
    if (subtypesElement) {
        const currentDisplay = subtypesElement.style.display;
        const newDisplay = currentDisplay === 'none' ? 'block' : 'none';
        subtypesElement.style.display = newDisplay;
        if (newDisplay === 'block') isVisible = true;
    }
    
    // Update button text
    if (toggleButton) {
        toggleButton.textContent = isVisible ? 'Hide Details' : 'Show Details';
    }
}

// Toggle nested subtypes
export function toggleNestedSubtypes(subKey) {
    const nestedElement = document.getElementById(`nested-subtypes-${subKey}`);
    const toggleButton = document.getElementById(`nested-toggle-${subKey}`);
    
    if (nestedElement) {
        const isVisible = nestedElement.style.display !== 'none';
        nestedElement.style.display = isVisible ? 'none' : 'block';
        
        if (toggleButton) {
            toggleButton.textContent = isVisible ? '+' : '−';
        }
    }
}

// Show sub-definition detail
export function showSubDefinitionDetail(subKey) {
    // Find the subtype data
    let foundSubDef = null;
    let categoryTitle = '';
    
    Object.keys(definitionsDatabase).forEach(catKey => {
        const category = definitionsDatabase[catKey];
        Object.keys(category.definitions).forEach(defKey => {
            const def = category.definitions[defKey];
            if (def.subtypes && def.subtypes[subKey]) {
                foundSubDef = def.subtypes[subKey];
                categoryTitle = category.title;
                return;
            }
        });
    });
    
    if (foundSubDef) {
        let message = `${foundSubDef.nameHi} (${foundSubDef.nameEn})\n`;
        message += `${foundSubDef.english}\n\n`;
        message += `${foundSubDef.definition}`;
        
        if (foundSubDef.additionalNotes) {
            message += `\n\nविशेष: ${foundSubDef.additionalNotes}`;
        }
        
        alert(message);
    }
}

// Show nested definition detail
export function showNestedDefinitionDetail(nestedKey, parentKey) {
    // Find the nested definition data
    let foundNestedDef = null;
    
    Object.keys(definitionsDatabase).forEach(catKey => {
        const category = definitionsDatabase[catKey];
        Object.keys(category.definitions).forEach(defKey => {
            const def = category.definitions[defKey];
            if (def.subtypes && def.subtypes[parentKey] && def.subtypes[parentKey].subtypes && def.subtypes[parentKey].subtypes[nestedKey]) {
                foundNestedDef = def.subtypes[parentKey].subtypes[nestedKey];
                return;
            }
        });
    });
    
    if (foundNestedDef) {
        let message = `${foundNestedDef.nameHi} (${foundNestedDef.nameEn})\n`;
        message += `${foundNestedDef.english}\n\n`;
        message += `${foundNestedDef.definition}`;
        
        if (foundNestedDef.additionalNotes) {
            message += `\n\nविशेष: ${foundNestedDef.additionalNotes}`;
        }
        
        alert(message);
    }
}

// Find and show definition with deep search
export function findAndShowDefinition(searchTerm) {
    // Switch to definitions tab first
    if (window.showTab) {
        window.showTab('definitions');
    }
    
    // Ensure definitions are loaded
    if (!document.getElementById('definitions-list').innerHTML) {
        loadDefinitions();
    }
    
    // Wait for tab switch and load, then search
    setTimeout(() => {
        let found = false;
        let categoryKey = null;
        let defKey = null;
        let subKey = null;
        let isSubtype = false;
        
        // Search through all definitions
        Object.keys(definitionsDatabase).forEach(catKey => {
            const category = definitionsDatabase[catKey];
            
            Object.keys(category.definitions).forEach(dKey => {
                const def = category.definitions[dKey];
                
                // Check if it's a main definition
                if (def.nameHi === searchTerm || def.nameEn === searchTerm) {
                    found = true;
                    categoryKey = catKey;
                    defKey = dKey;
                    return;
                }
                
                // Check subtypes
                if (def.subtypes) {
                    Object.keys(def.subtypes).forEach(sKey => {
                        const subDef = def.subtypes[sKey];
                        if (subDef.nameHi === searchTerm || subDef.nameEn === searchTerm) {
                            found = true;
                            categoryKey = catKey;
                            defKey = dKey;
                            subKey = sKey;
                            isSubtype = true;
                            return;
                        }
                    });
                }
            });
        });
        
        if (found) {
            // Expand the category
            const categoryElement = document.getElementById(`category-${categoryKey}`);
            if (categoryElement) {
                categoryElement.classList.add('expanded');
            }
            
            // If it's a subtype, expand the additional info
            if (isSubtype && defKey) {
                const additionalElement = document.getElementById(`additional-${defKey}`);
                const subtypesElement = document.getElementById(`subtypes-${defKey}`);
                
                if (additionalElement) {
                    additionalElement.style.display = 'block';
                }
                if (subtypesElement) {
                    subtypesElement.style.display = 'block';
                }
                
                // Scroll to and highlight the specific subtype
                setTimeout(() => {
                    const targetElement = document.getElementById(`subdef-${subKey}`);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        highlightSearchResult(targetElement, 'warning');
                    }
                }, 500);
            } else {
                // Scroll to main definition
                setTimeout(() => {
                    const targetElement = document.getElementById(`def-${defKey}`);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        highlightSearchResult(targetElement, 'success');
                    }
                }, 500);
            }
            
            // Show success message
            showMessage('success', `✅ Found: ${searchTerm} - Definition highlighted below`);
        } else {
            // Fallback: use regular search if exact match not found
            searchDefinitions(searchTerm);
            showMessage('info', `🔍 Searching for: ${searchTerm} - Check results below`);
        }
    }, 300);
}

// Function to search by thana name instead of specific concept
export function findDefinitionByThana(thanaName, conceptName) {
    // Close any open modals first
    if (window.closeTooltip) {
        window.closeTooltip();
    }
    
    // Small delay to ensure modal closes smoothly
    setTimeout(() => {
        // Switch to definitions tab
        if (window.showTab) {
            window.showTab('definitions');
        }
        
        // Ensure definitions are loaded
        if (!document.getElementById('definitions-list').innerHTML) {
            loadDefinitions();
        }
        
        // Wait for tab switch and load, then search by thana name
        setTimeout(() => {
            searchDefinitions(thanaName);
            
            // Show message about what we're searching for
            showMessage('info', `🔍 Showing definitions for ${thanaName} category (related to: ${conceptName})`);
            
        }, 300);
    }, 200);
}
