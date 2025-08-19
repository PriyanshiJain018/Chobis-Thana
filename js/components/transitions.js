// Transitions Component
import { gunasthansData } from '../data/gunasthans.js';
import { transitionRules } from '../data/matrix.js';

export function initTransitions() {
    loadTransitions();
}

function loadTransitions() {
    const container = document.getElementById('transitions-list');
    if (!container) return;
    
    let html = '';
    
    Object.keys(gunasthansData).forEach(id => {
        const g = gunasthansData[id];
        const number = parseInt(id);
        const rule = transitionRules[number];
        
        if (!rule) return;
        
        html += `
            <div class="transition-card">
                <div class="transition-header">
                    <div class="gunasthan-number" style="background: ${g.color}">${number}</div>
                    <div class="gunasthan-info">
                        <div class="gunasthan-name">${g.nameHi}</div>
                        <div class="gunasthan-english">${g.english}</div>
                    </div>
                    <div class="transition-arrow">→</div>
                </div>
                
                <div class="transition-description">
                    ${rule.description}
                </div>
                
                ${rule.canGoTo.length > 0 ? `
                    <div class="transition-targets">
                        ${rule.canGoTo.map(targetId => {
                            const target = gunasthansData[targetId];
                            return target ? `
                                <div class="transition-target" onclick="scrollToGunasthan(${targetId})">
                                    G${targetId}: ${target.nameHi}
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                ` : `
                    <div style="margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 8px; text-align: center;">
                        🎯 <strong>मोक्ष</strong> - यह अंतिम लक्ष्य है
                    </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Scroll to specific gunasthan in overview
window.scrollToGunasthan = function(gunasthanId) {
    // Switch to overview tab
    window.showTab('overview');
    
    // Wait for tab switch, then scroll
    setTimeout(() => {
        const card = document.querySelector(`[onclick="showGunasthanDetail(${gunasthanId})"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight briefly
            card.style.transform = 'scale(1.02)';
            card.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
            card.style.borderColor = '#3b82f6';
            
            setTimeout(() => {
                card.style.transform = '';
                card.style.boxShadow = '';
                card.style.borderColor = '';
            }, 2000);
        }
    }, 300);
};

// Search in transitions
export function searchInTransitions(searchTerm) {
    const term = searchTerm.toLowerCase();
    
    document.querySelectorAll('.transition-card').forEach(card => {
        const gunasthanName = card.querySelector('.gunasthan-name');
        if (gunasthanName) {
            const text = gunasthanName.textContent;
            if (text.includes(searchTerm) || text.toLowerCase().includes(term)) {
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
        }
    });
}
