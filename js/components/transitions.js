// Transitions Component - Handles transitions display and game mode

import { gunasthansData, transitionRules } from '../data/gunasthans.js';
import { showMessage } from '../utils/helpers.js';

// Load transitions
export function loadTransitions() {
    const container = document.getElementById('transitions-list');
    
    // Add Game Mode Button at the top
    let html = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px; text-align: center; cursor: pointer; transition: transform 0.3s ease;" onclick="launchGameMode()" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 8px;">🎮 गुणस्थान यात्रा गेम</div>
            <div style="color: rgba(255,255,255,0.9); font-size: 16px; margin-bottom: 12px;">Interactive Spiritual Journey Game</div>
            <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 15px;">Experience the 14 Gunasthanas through an engaging interactive game with choices, consequences, and spiritual progression!</div>
            <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 10px 20px; border-radius: 25px; font-weight: 600; color: white; border: 2px solid rgba(255,255,255,0.3);">
                🚀 Start Your Spiritual Journey
            </div>
        </div>
    `;
    
    // Generate transition cards for each Gunasthan
    for (let i = 1; i <= 14; i++) {
        const g = gunasthansData[i];
        const rule = transitionRules[i];
        
        html += `
            <div class="transition-card">
                <div class="transition-header">
                    <span class="gunasthan-number" style="background: ${g.color}">${i}</span>
                    <div style="flex: 1;">
                        <div class="gunasthan-name">${g.nameHi}</div>
                        <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">${rule.description}</div>
                    </div>
                </div>
        `;
        
        if (rule.canGoTo.length > 0) {
            html += '<div class="transition-targets">';
            rule.canGoTo.forEach(target => {
                html += `
                    <div class="transition-target" data-click="scrollToGunasthan" data-gunasthan-id="${target}">
                        <span class="transition-arrow">→</span> G${target}: ${gunasthansData[target].nameHi}
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<div style="text-align: center; margin-top: 16px; color: #f59e0b; font-weight: 600; font-size: 18px;">🎯 Liberation (Moksha)</div>';
        }
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Launch Game Mode - External File Version
export function launchGameMode() {
    // ⭐ THIS IS WHERE YOU CHANGE THE FILE NAME ⭐
    const gameFileName = 'gunasthan_game.html'; // Change this to your file name
    
    // Try to open the game file
    const gameWindow = window.open(gameFileName, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (gameWindow) {
        // Show success message
        showMessage('success', '🎮 गेम मोड नई विंडो में खुल रहा है! Game Mode opening in new window!');
        
        // Check if the file loaded successfully after a delay
        setTimeout(() => {
            try {
                if (gameWindow.closed) {
                    showMessage('info', 'ℹ️ गेम विंडो बंद हो गई। Game window was closed.');
                }
            } catch (e) {
                // Cross-origin error means file loaded from different domain - that's okay
            }
        }, 1000);
        
    } else {
        // Fallback if popup blocked
        showMessage('warning', '⚠️ पॉप-अप ब्लॉकर के कारण गेम नहीं खुल सका। कृपया पॉप-अप की अनुमति दें।');
        
        // Show alternative options
        showGameAlternatives(gameFileName);
    }
}

// Alternative options if popup fails
function showGameAlternatives(gameFileName) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 30px; max-width: 500px; text-align: center; position: relative;">
            <button onclick="this.closest('div').parentElement.remove()" 
                    style="position: absolute; top: 15px; right: 15px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-weight: bold;">×</button>
            
            <div style="font-size: 48px; margin-bottom: 20px;">🎮</div>
            <h2 style="margin-bottom: 15px; color: #1f2937;">गुणस्थान यात्रा गेम</h2>
            <p style="color: #6b7280; margin-bottom: 20px;">Choose how to access the game:</p>
            
            <div style="display: flex; flex-direction: column; gap: 12px; margin: 20px 0;">
                <button onclick="window.open('${gameFileName}', '_self')" 
                        style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    🔄 Open in Same Tab
                </button>
                
                <a href="${gameFileName}" target="_blank" 
                style="background: #3b82f6; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; display: block;">
                    🔗 Direct Link to Game
                </a>
                
                <button onclick="navigator.clipboard.writeText(window.location.origin + '/' + '${gameFileName}').then(() => alert('Game URL copied!'))" 
                        style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                    📋 Copy Game URL
                </button>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #f59e0b; font-size: 13px;">
                <strong>File:</strong> ${gameFileName}<br>
                Make sure this file is in the same folder as your main app.
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

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
    
    showMessage('info', `🔍 Highlighted transitions matching: ${searchTerm}`);
}

// Helper function to scroll to a gunasthan
export function scrollToGunasthan(gunasthanId) {
    if (window.showTab) {
        window.showTab('overview');
        setTimeout(() => {
            const cards = document.querySelectorAll('.gunasthan-card');
            if (cards[gunasthanId - 1]) {
                cards[gunasthanId - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                cards[gunasthanId - 1].style.animation = 'pulse 1s ease-in-out';
                setTimeout(() => {
                    cards[gunasthanId - 1].style.animation = '';
                }, 1000);
            }
        }, 100);
    }
}
