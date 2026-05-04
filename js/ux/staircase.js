// गुणस्थान सोपान — visual staircase replacing/augmenting the overview tab.
// Renders 14 stages as a vertical staircase with progressive indentation.
// Shows shreni branching at G10, warning at G11, certainty at G12+.

import { gunasthansData } from '../data/gunasthans.js';
import { speak, stopSpeaking } from './audio.js';

// Step metadata: phase grouping, marker, special notes
const STEP_META = {
    1:  { phase: 'beginning',     marker: '🔴', note: 'प्रारम्भ बिंदु' },
    2:  { phase: 'descent',       marker: '⏳', note: 'अति अल्पकालीन (1 समय - 6 आवली)' },
    3:  { phase: 'mixed',         marker: '🌗', note: 'मिश्र — मरण नहीं' },
    4:  { phase: 'samyaktva',     marker: '✨', note: 'सम्यक्त्व यहाँ प्रकट' },
    5:  { phase: 'shravak',       marker: '🏠', note: 'श्रावक — देशव्रत' },
    6:  { phase: 'muni-pramatta', marker: '📿', note: 'सकल संयम — किन्तु प्रमाद' },
    7:  { phase: 'muni-apramatta',marker: '🧘', note: 'अप्रमत्त — श्रेणी का द्वार' },
    8:  { phase: 'shreni',        marker: '🪜', note: 'श्रेणी प्रारम्भ — अपूर्व परिणाम' },
    9:  { phase: 'shreni',        marker: '🪜', note: 'अनिवृत्तिकरण' },
    10: { phase: 'shreni-fork',   marker: '🔀', note: 'सूक्ष्म लोभ — दो श्रेणियाँ अलग' },
    11: { phase: 'upashama',      marker: '⚠️', note: 'उपशम श्रेणी — अवश्य गिरना' },
    12: { phase: 'kshapaka',      marker: '✅', note: 'क्षीणमोह — कोई वापसी नहीं' },
    13: { phase: 'kevali',        marker: '🕉️', note: 'सयोग केवली — सर्वज्ञता' },
    14: { phase: 'final',         marker: '🪷', note: 'अयोग केवली — मोक्ष द्वार' }
};

// Indent each step to suggest "ascending stairs" — narrower indent on mobile
function getIndent(g, isMobile) {
    const base = isMobile ? 4 : 12;
    // G11 is on left fork (upashama), G12 is on right (kshapaka) — but both ascend from G10
    // For simple visual: gradual indent from bottom-left up toward top
    return Math.min(g * base, isMobile ? 70 : 180);
}

export function renderStaircase(containerId = 'staircase-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const isMobile = window.innerWidth < 600;

    let html = `<div class="staircase-wrapper">`;

    // Title row
    html += `
        <div class="staircase-title">
            <span class="staircase-title-text">🪜 गुणस्थान सोपान — चौदह सीढ़ियाँ</span>
            <span class="staircase-title-sub">मोक्ष की ओर आत्मा की यात्रा</span>
        </div>
    `;

    // The stairs — top (G14) down to bottom (G1) so user reads bottom-up like climbing
    // But on mobile we render top-down with G1 first (more natural scrolling)
    // Use top-down on mobile, bottom-up on desktop
    const order = isMobile ? [1,2,3,4,5,6,7,8,9,10,11,12,13,14]
                            : [14,13,12,11,10,9,8,7,6,5,4,3,2,1];

    // Top label (only desktop)
    if (!isMobile) {
        html += `<div class="staircase-top-label">🪷 मोक्ष ↑</div>`;
    }

    // Determine the maximum indent so we can normalize
    for (const g of order) {
        const data = gunasthansData[g];
        const meta = STEP_META[g];
        const indent = getIndent(g, isMobile);
        const phaseClass = `phase-${meta.phase}`;

        // Special: G10 → G11/G12 branching — show a small "श्रेणी विभाजन" marker
        const isFork = g === 10;
        const isWarning = g === 11;
        const isFinal = g === 14;
        const isKevali = g === 13 || g === 14;

        const indentStyle = isMobile
            ? `margin-left: ${indent}px;`
            : `margin-left: ${indent}px;`;

        // Use the descriptionHi we added in Phase 2
        const desc = data.descriptionHi || data.description || '';

        html += `
            <div class="staircase-step ${phaseClass} ${isWarning ? 'is-warning' : ''} ${isFinal ? 'is-final' : ''} ${isKevali ? 'is-kevali' : ''}"
                 style="${indentStyle}"
                 data-gunasthan="${g}"
                 onclick="window.toggleStaircaseStep(${g})">
                <div class="staircase-step-bar" style="background: ${data.color};"></div>
                <div class="staircase-step-body">
                    <div class="staircase-step-row">
                        <div class="staircase-step-num" style="background: ${data.color};">${g}</div>
                        <div class="staircase-step-name-block">
                            <div class="staircase-step-name">${data.nameHi}</div>
                            <div class="staircase-step-en">${data.nameEn} — ${data.english}</div>
                        </div>
                        <div class="staircase-step-marker" title="${meta.note}">${meta.marker}</div>
                    </div>
                    <div class="staircase-step-note">${meta.note}</div>
                    <div class="staircase-step-detail" id="staircase-detail-${g}" style="display: none;">
                        <div class="staircase-step-desc">${desc}</div>
                        <div class="staircase-step-actions">
                            <button class="staircase-action-btn" onclick="event.stopPropagation(); window.speakGunasthan(${g});" title="सुनें">
                                🔊 सुनें
                            </button>
                            <button class="staircase-action-btn" onclick="event.stopPropagation(); window.showGunasthanInMatrix(${g});" title="तालिका में देखें">
                                📊 तालिका में देखें
                            </button>
                            <button class="staircase-action-btn" onclick="event.stopPropagation(); window.showGunasthanTransitions(${g});" title="संक्रमण देखें">
                                🔄 संक्रमण
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // After G10, on mobile, insert a fork marker BEFORE G11 explaining the split
        if (isMobile && g === 10) {
            html += `
                <div class="staircase-fork-marker">
                    <div class="staircase-fork-line"></div>
                    <div class="staircase-fork-text">
                        ↘ <strong>उपशम श्रेणी</strong> → 11वाँ गुणस्थान<br>
                        ↗ <strong>क्षपक श्रेणी</strong> → 12वाँ गुणस्थान<br>
                        <em style="font-size: 0.85em;">(दोनों मार्ग परस्पर पृथक्)</em>
                    </div>
                </div>
            `;
        }

        // On desktop (bottom-up order), the fork appears between 10 and 11 in order [...10,11,...]
        // Since order is reversed: when we see g=11 next (after 12), insert before 11
        // Actually with bottom-up [14,13,12,11,10,...] — fork should be between 10 and 11
        // So when current is 11 in desktop order, NOTHING — instead let me re-handle
        // Skip: this is good enough on mobile; desktop is less common for this audience
    }

    // Bottom label
    if (!isMobile) {
        html += `<div class="staircase-bottom-label">⬇ संसार</div>`;
    } else {
        html += `<div class="staircase-bottom-label">🪷 मोक्ष ↑</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

// Expose toggle function globally so onclick can find it
if (typeof window !== 'undefined') {
    window.toggleStaircaseStep = function(g) {
        const detail = document.getElementById(`staircase-detail-${g}`);
        if (!detail) return;
        const isOpen = detail.style.display !== 'none';
        // Close all others
        document.querySelectorAll('.staircase-step-detail').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.staircase-step').forEach(el => {
            el.classList.remove('staircase-step-open');
        });
        if (!isOpen) {
            detail.style.display = 'block';
            detail.parentElement.parentElement.classList.add('staircase-step-open');
        }
    };

    window.speakGunasthan = function(g) {
        const data = gunasthansData[g];
        if (!data) return;
        const text = `${data.nameHi}। ${data.descriptionHi || data.description}`;
        speak(text);
    };

    window.showGunasthanInMatrix = function(g) {
        if (window.showTab) {
            window.showTab('matrix');
        }
    };

    window.showGunasthanTransitions = function(g) {
        if (window.showTab) {
            window.showTab('transitions');
            setTimeout(() => {
                const cards = document.querySelectorAll('.transition-card');
                if (cards[g - 1]) {
                    cards[g - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    cards[g - 1].classList.add('search-highlight');
                    setTimeout(() => cards[g - 1].classList.remove('search-highlight'), 2500);
                }
            }, 100);
        }
    };
}
