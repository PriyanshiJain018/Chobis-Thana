// Definitions Component
import { definitionsDatabase } from '../data/definitions.js';

export function initDefinitions() {
    loadDefinitions();
}

function loadDefinitions() {
    const container = document.getElementById('definitions-list');
    if (!container) return;
    
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
                            `<button class="toggle-button" onclick="toggleAdditionalInfo('${defKey}')">+</button>` : ''}
                    </div>
                    
                    <div class="definition-content">
                        ${def.definition}
                    </div>
                    
                    <div id="additional-${defKey}" style="display: none;">
                        ${def.additionalNotes ? `
                            <div style="margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #78350f;">
                                <strong>विशेष:</strong> ${def.additionalNotes}
                            </div>
                        ` : ''}
                        
                        ${def.subtypes && Object.keys(def.subtypes).length > 0 ? `
                            <div class="sub-definitions">
                                <h4 style="margin-bottom: 12px; color: #374151;">Sub-types:</h4>
                                ${Object.keys(def.subtypes).map(subKey => {
                                    const subDef = def.subtypes[subKey];
                                    return `
                                        <div class="sub-definition" onclick="showSubDefinitionDetail('${subKey}', '${defKey}')">
                                            <div class="sub-definition-title">${subDef.nameHi || ''} (${subDef.nameEn || ''})</div>
                                            <div class="sub-definition-content">${subDef.definition || ''}</div>
                                            ${subDef.additionalNotes ? `
                                                <div style="margin-top: 8px; font-style: italic; color: #78350f;">
                                                    <strong>विशेष:</strong> ${subDef.additionalNotes}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div></div>';
    });
    
    container.innerHTML = html;
}

// Toggle category visibility
window.toggleCategory = function(categoryKey) {
    const content = document.getElementById(`category-${categoryKey}`);
    if (content) {
        content.classList.toggle('expanded');
    }
};

// Toggle additional information
window.toggleAdditionalInfo = function(defKey) {
    const content = document.getElementById(`additional-${defKey}`);
    const toggleButton = document.querySelector(`#def-${defKey} .toggle-button`);
    
    if (content && toggleButton) {
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
        toggleButton.textContent = isVisible ? '+' : '−';
    }
};

// Show sub-definition detail
window.showSubDefinitionDetail = function(subKey, parentKey) {
    // Find the sub-definition data
    let foundSubDef = null;
    
    Object.keys(definitionsDatabase).forEach(catKey => {
        const category = definitionsDatabase[catKey];
        Object.keys(category.definitions).forEach(defKey => {
            const def = category.definitions[defKey];
            if (def.subtypes && def.subtypes[subKey]) {
                foundSubDef = def.subtypes[subKey];
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
};

// Search in definitions
export function searchDefinitions(searchTerm) {
    if (!searchTerm) {
        loadDefinitions();
        return;
    }
    
    const term = searchTerm.toLowerCase();
    const container = document.getElementById('definitions-list');
    let html = '';
    let found = false;
    
    Object.keys(definitionsDatabase).forEach(categoryKey => {
        const category = definitionsDatabase[categoryKey];
        let categoryHtml = '';
        let categoryFound = false;
        
        Object.keys(category.definitions).forEach(defKey => {
            const def = category.definitions[defKey];
            let defFound = false;
            
            // Check main definition
            if ((def.nameHi && def.nameHi.includes(searchTerm)) || 
                (def.nameEn && def.nameEn.toLowerCase().includes(term)) ||
                (def.english && def.english.toLowerCase().includes(term)) ||
                (def.definition && def.definition.includes(searchTerm))) {
                defFound = true;
            }
            
            if (defFound) {
                found = true;
                categoryFound = true;
                
                categoryHtml += `
                    <div class="definition-card search-highlight">
                        <div class="definition-header">
                            <div>
                                <div class="definition-title">${def.nameHi} (${def.nameEn})</div>
                                <div class="definition-subtitle">${def.english}</div>
                            </div>
                        </div>
                        <div class="definition-content">${def.definition}</div>
                    </div>
                `;
            }
        });
        
        if (categoryFound) {
            html += `
                <div class="category-section">
                    <div class="category-header">
                        <div class="category-title">${category.title}</div>
                        <div class="category-subtitle">${category.titleEn} - ${category.english}</div>
                    </div>
                    <div class="collapsible-content expanded">
                        ${categoryHtml}
                    </div>
                </div>
            `;
        }
    });
    
    if (found) {
        container.innerHTML = `
            <div style="margin-bottom: 20px; padding: 16px; background: #f0f9ff; border-radius: 12px; border: 1px solid #3b82f6;">
                <h3 style="color: #1e40af; margin-bottom: 8px;">🔍 Search Results</h3>
                <p style="color: #1e40af; margin: 0;">Found definitions matching: <strong>${searchTerm}</strong></p>
            </div>
            ${html}
        `;
    } else {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h3>No definitions found</h3>
                <p>No definitions match "${searchTerm}". Try a different search term.</p>
            </div>
        `;
    }
}
