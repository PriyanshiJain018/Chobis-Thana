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
// Improved search function for definitions.js
// Replace the existing searchDefinitions function with this one

export function searchDefinitions(searchTerm) {
    if (!searchTerm) {
        loadDefinitions();
        return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const container = document.getElementById('definitions-list');
    let html = '';
    
    // Separate storage for exact and partial matches
    const exactMatches = {
        mainDefinitions: [],
        subtypes: []
    };
    
    const partialMatches = {
        mainDefinitions: [],
        subtypes: []
    };
    
    // Helper function to check match type
    const getMatchType = (text, searchTerm) => {
        if (!text) return 'none';
        const lowerText = text.toLowerCase();
        const lowerSearch = searchTerm.toLowerCase();
        
        // Check for exact word match
        const words = lowerText.split(/[\s,\-().]+/);
        if (words.includes(lowerSearch)) {
            return 'exact';
        }
        
        // Check for exact phrase match
        if (lowerText === lowerSearch) {
            return 'exact';
        }
        
        // Check for starts with
        if (lowerText.startsWith(lowerSearch)) {
            return 'startsWith';
        }
        
        // Check for contains
        if (lowerText.includes(lowerSearch)) {
            return 'contains';
        }
        
        return 'none';
    };
    
    // Search through all definitions
    Object.keys(definitionsDatabase).forEach(categoryKey => {
        const category = definitionsDatabase[categoryKey];
        
        Object.keys(category.definitions).forEach(defKey => {
            const def = category.definitions[defKey];
            let matchScore = 0;
            let matchType = 'none';
            
            // Check main definition matches
            const nameHiMatch = getMatchType(def.nameHi, term);
            const nameEnMatch = getMatchType(def.nameEn, term);
            const englishMatch = getMatchType(def.english, term);
            const definitionMatch = getMatchType(def.definition, term);
            
            // Calculate match score (exact = 10, startsWith = 5, contains = 1)
            if (nameHiMatch === 'exact' || nameEnMatch === 'exact') {
                matchScore = 10;
                matchType = 'exact';
            } else if (nameHiMatch === 'startsWith' || nameEnMatch === 'startsWith') {
                matchScore = 5;
                matchType = 'startsWith';
            } else if (englishMatch === 'exact') {
                matchScore = 8;
                matchType = 'exact';
            } else if (nameHiMatch === 'contains' || nameEnMatch === 'contains' || englishMatch === 'contains') {
                matchScore = 2;
                matchType = 'contains';
            } else if (definitionMatch === 'contains') {
                matchScore = 1;
                matchType = 'contains';
            }
            
            if (matchScore > 0) {
                const matchData = {
                    category: category,
                    categoryKey: categoryKey,
                    def: def,
                    defKey: defKey,
                    score: matchScore,
                    matchType: matchType
                };
                
                if (matchScore >= 8) {
                    exactMatches.mainDefinitions.push(matchData);
                } else {
                    partialMatches.mainDefinitions.push(matchData);
                }
            }
            
            // Check subtypes
            if (def.subtypes) {
                Object.keys(def.subtypes).forEach(subKey => {
                    const subDef = def.subtypes[subKey];
                    let subMatchScore = 0;
                    let subMatchType = 'none';
                    
                    const subNameHiMatch = getMatchType(subDef.nameHi, term);
                    const subNameEnMatch = getMatchType(subDef.nameEn, term);
                    const subEnglishMatch = getMatchType(subDef.english, term);
                    const subDefinitionMatch = getMatchType(subDef.definition, term);
                    
                    if (subNameHiMatch === 'exact' || subNameEnMatch === 'exact') {
                        subMatchScore = 10;
                        subMatchType = 'exact';
                    } else if (subNameHiMatch === 'startsWith' || subNameEnMatch === 'startsWith') {
                        subMatchScore = 5;
                        subMatchType = 'startsWith';
                    } else if (subEnglishMatch === 'exact') {
                        subMatchScore = 8;
                        subMatchType = 'exact';
                    } else if (subNameHiMatch === 'contains' || subNameEnMatch === 'contains' || subEnglishMatch === 'contains') {
                        subMatchScore = 2;
                        subMatchType = 'contains';
                    } else if (subDefinitionMatch === 'contains' || (subDef.additionalNotes && subDef.additionalNotes.toLowerCase().includes(term))) {
                        subMatchScore = 1;
                        subMatchType = 'contains';
                    }
                    
                    if (subMatchScore > 0) {
                        const subMatchData = {
                            category: category,
                            categoryKey: categoryKey,
                            def: def,
                            defKey: defKey,
                            subDef: subDef,
                            subKey: subKey,
                            score: subMatchScore,
                            matchType: subMatchType
                        };
                        
                        if (subMatchScore >= 8) {
                            exactMatches.subtypes.push(subMatchData);
                        } else {
                            partialMatches.subtypes.push(subMatchData);
                        }
                    }
                });
            }
        });
    });
    
    // Sort matches by score
    exactMatches.mainDefinitions.sort((a, b) => b.score - a.score);
    exactMatches.subtypes.sort((a, b) => b.score - a.score);
    partialMatches.mainDefinitions.sort((a, b) => b.score - a.score);
    partialMatches.subtypes.sort((a, b) => b.score - a.score);
    
    // Build HTML - Show exact matches first
    if (exactMatches.mainDefinitions.length > 0 || exactMatches.subtypes.length > 0) {
        html += `
            <div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h3 style="color: #166534; margin-bottom: 8px;">✓ सटीक मिलान (Exact Matches)</h3>
                <p style="color: #166534; font-size: 14px;">Found ${exactMatches.mainDefinitions.length + exactMatches.subtypes.length} exact matches for: <strong>${searchTerm}</strong></p>
            </div>
        `;
        
        // Display exact match main definitions
        exactMatches.mainDefinitions.forEach(match => {
            html += renderDefinitionCard(match, true);
        });
        
        // Display exact match subtypes
        exactMatches.subtypes.forEach(match => {
            html += renderSubtypeCard(match, true);
        });
    }
    
    // Show partial matches
    if (partialMatches.mainDefinitions.length > 0 || partialMatches.subtypes.length > 0) {
        html += `
            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <h3 style="color: #92400e; margin-bottom: 8px;">≈ आंशिक मिलान (Partial Matches)</h3>
                <p style="color: #92400e; font-size: 14px;">Found ${partialMatches.mainDefinitions.length + partialMatches.subtypes.length} partial matches containing: <strong>${searchTerm}</strong></p>
            </div>
        `;
        
        // Display partial match main definitions
        partialMatches.mainDefinitions.forEach(match => {
            html += renderDefinitionCard(match, false);
        });
        
        // Display partial match subtypes
        partialMatches.subtypes.forEach(match => {
            html += renderSubtypeCard(match, false);
        });
    }
    
    // No matches found
    if (exactMatches.mainDefinitions.length === 0 && exactMatches.subtypes.length === 0 &&
        partialMatches.mainDefinitions.length === 0 && partialMatches.subtypes.length === 0) {
        html = `
            <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; text-align: center;">
                <h3 style="color: #991b1b; margin-bottom: 8px;">❌ कोई परिणाम नहीं मिला</h3>
                <p style="color: #991b1b;">No results found for: <strong>${searchTerm}</strong></p>
                <p style="color: #7f1d1d; font-size: 14px; margin-top: 8px;">Try searching with different keywords in Hindi or English</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Auto-scroll to first exact match
    if (exactMatches.mainDefinitions.length > 0 || exactMatches.subtypes.length > 0) {
        setTimeout(() => {
            const firstMatch = document.querySelector('.exact-match');
            if (firstMatch) {
                firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add highlight animation
                firstMatch.style.animation = 'highlight-pulse 2s ease-in-out';
            }
        }, 100);
    }
}

// Helper function to render definition card
function renderDefinitionCard(match, isExact) {
    const { category, def, defKey } = match;
    const highlightClass = isExact ? 'exact-match' : 'partial-match';
    const borderStyle = isExact ? 'border: 3px solid #22c55e; background: #f0fdf4;' : 'border: 2px solid #f59e0b; background: #fffbeb;';
    
    let html = `
        <div class="category-section ${highlightClass}" style="margin-bottom: 16px;">
            <div class="category-header" onclick="toggleCategory('${match.categoryKey}')">
                <div class="category-title">${category.title}</div>
                <div class="category-subtitle">${category.titleEn} - ${category.english}</div>
            </div>
            <div class="collapsible-content expanded">
                <div class="definition-card" id="def-${defKey}" style="${borderStyle}">
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
            <div id="additional-${defKey}" class="additional-notes" style="display: block;">
                <strong>विशेष:</strong> ${def.additionalNotes}
            </div>
        `;
    }
    
    if (def.subtypes && Object.keys(def.subtypes).length > 0) {
        html += `
            <div id="subtypes-${defKey}" class="sub-definitions" style="display: block;">
                <h4 style="margin-bottom: 12px; color: #374151;">Sub-types:</h4>
                ${Object.keys(def.subtypes).map(subKey => {
                    const subDef = def.subtypes[subKey];
                    return `
                        <div class="sub-definition" onclick="showSubDefinitionDetail('${subKey}')">
                            <div class="sub-definition-title">${subDef.nameHi} (${subDef.nameEn})</div>
                            <div class="sub-definition-content">${subDef.definition}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    html += '</div></div></div>';
    return html;
}

// Helper function to render subtype card
function renderSubtypeCard(match, isExact) {
    const { category, def, defKey, subDef, subKey } = match;
    const highlightClass = isExact ? 'exact-match' : 'partial-match';
    const borderStyle = isExact ? 'border: 3px solid #22c55e; background: #f0fdf4;' : 'border: 2px solid #f59e0b; background: #fffbeb;';
    
    return `
        <div class="category-section ${highlightClass}" style="margin-bottom: 16px;">
            <div class="category-header" onclick="toggleCategory('${match.categoryKey}')">
                <div class="category-title">${category.title}</div>
                <div class="category-subtitle">${category.titleEn} - ${category.english}</div>
            </div>
            <div class="collapsible-content expanded">
                <div class="definition-card">
                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                        Parent: ${def.nameHi} (${def.nameEn})
                    </div>
                    <div class="sub-definition" id="subdef-${subKey}" style="${borderStyle} padding: 16px;">
                        <div class="sub-definition-title" style="font-size: 16px; font-weight: 600;">
                            ${subDef.nameHi} (${subDef.nameEn})
                        </div>
                        <div style="color: #6b7280; margin-bottom: 8px;">${subDef.english || ''}</div>
                        <div class="sub-definition-content">${subDef.definition}</div>
                        ${subDef.additionalNotes ? 
                            `<div style="margin-top: 8px; font-style: italic; color: #78350f;">
                                <strong>विशेष:</strong> ${subDef.additionalNotes}
                            </div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add CSS for highlight animation
if (!document.getElementById('search-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'search-highlight-styles';
    style.textContent = `
        @keyframes highlight-pulse {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
            50% { box-shadow: 0 0 20px 10px rgba(34, 197, 94, 0.3); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        
        .exact-match {
            position: relative;
        }
        
        .partial-match {
            opacity: 0.95;
        }
    `;
    document.head.appendChild(style);
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
