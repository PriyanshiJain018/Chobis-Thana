// Guided tour — 4-screen overlay shown on first launch.
// Persists "seen" flag in localStorage so it doesn't reappear.

const STORAGE_KEY = 'chobis-tour-seen';

const TOUR_STEPS = [
    {
        icon: '🙏',
        title: 'नमस्कार !',
        text: 'यह ऐप <strong>श्री चौबीस ठाणा चर्चा</strong> पुस्तक (मुनि श्री प्रशान्तसागरजी महाराज) पर पूर्ण रूप से आधारित है। चौदह गुणस्थानों और चौबीस ठाणाओं को सरल, दृश्य और इंटरैक्टिव रूप में देखें।'
    },
    {
        icon: '🪜',
        title: 'गुणस्थान सोपान',
        text: 'सारांश तब में आपको मिलेगी आत्मा की <strong>चौदह सीढ़ियाँ</strong> — मिथ्यात्व से मोक्ष तक की यात्रा। किसी भी सीढ़ी पर टैप करके विवरण देखें।'
    },
    {
        icon: '📊',
        title: 'ठाणा तालिका',
        text: 'पूरी 24×14 तालिका। किसी भी खाने पर टैप करके देखें कि किस गुणस्थान में कौन-से भेद उपस्थित या अनुपस्थित हैं। <strong>💡 समझाओ</strong> मोड में सरल हिंदी में अर्थ भी मिलेगा।'
    },
    {
        icon: '🔊',
        title: 'सहायक सुविधाएँ',
        text: 'हिंदी ↔ English टॉगल · <strong>बड़ा दृश्य</strong> (बुजुर्गों के लिए) · <strong>रात्रि स्वाध्याय</strong> मोड · <strong>सुनें</strong> बटन से ऑडियो · हर "आज का विशेष" को WhatsApp पर शेयर करें।'
    }
];

export function isTourCompleted() {
    return localStorage.getItem(STORAGE_KEY) === '1';
}

export function markTourCompleted() {
    localStorage.setItem(STORAGE_KEY, '1');
}

export function resetTour() {
    localStorage.removeItem(STORAGE_KEY);
}

export function startTour(force = false) {
    if (!force && isTourCompleted()) return;
    let idx = 0;

    // Build overlay
    const overlay = document.createElement('div');
    overlay.className = 'tour-overlay';
    overlay.id = 'tour-overlay';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function render() {
        const step = TOUR_STEPS[idx];
        const isLast = idx === TOUR_STEPS.length - 1;
        overlay.innerHTML = `
            <div class="tour-card">
                <div class="tour-step-num">${idx + 1} / ${TOUR_STEPS.length}</div>
                <div class="tour-icon">${step.icon}</div>
                <div class="tour-title">${step.title}</div>
                <div class="tour-text">${step.text}</div>
                <div class="tour-dots">
                    ${TOUR_STEPS.map((_, i) => `<div class="tour-dot ${i === idx ? 'active' : ''}"></div>`).join('')}
                </div>
                <div class="tour-actions">
                    <button class="tour-btn tour-btn-skip" id="tour-skip" type="button">
                        ${idx === 0 ? 'छोड़ें' : '← पिछला'}
                    </button>
                    <button class="tour-btn tour-btn-primary" id="tour-next" type="button">
                        ${isLast ? 'शुरू करें ✓' : 'अगला →'}
                    </button>
                </div>
            </div>
        `;

        const nextBtn = overlay.querySelector('#tour-next');
        const skipBtn = overlay.querySelector('#tour-skip');

        nextBtn.addEventListener('click', () => {
            if (isLast) {
                end();
            } else {
                idx++;
                render();
            }
        });

        skipBtn.addEventListener('click', () => {
            if (idx === 0) {
                end();
            } else {
                idx--;
                render();
            }
        });
    }

    function end() {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 300);
        markTourCompleted();
    }

    render();
}

// Re-launch tour from anywhere — bind to a button later if desired
if (typeof window !== 'undefined') {
    window.startTour = (force) => startTour(force !== false);
}
