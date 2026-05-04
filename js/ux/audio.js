// Audio module — text-to-speech for Hindi content using Web Speech API.
// Free, built-in, no API keys required. Quality varies by browser+OS.

let currentUtterance = null;
let currentlySpeakingId = null;

function isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Find the best available Hindi voice
function pickHindiVoice() {
    if (!isSupported()) return null;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null;
    // Prefer hi-IN, then hi
    return voices.find(v => v.lang === 'hi-IN')
        || voices.find(v => v.lang && v.lang.startsWith('hi'))
        || voices.find(v => /hindi/i.test(v.name))
        || null;
}

export function speak(text, opts = {}) {
    if (!isSupported()) {
        alert('आपके ब्राउज़र में आवाज़ सुविधा उपलब्ध नहीं है।');
        return false;
    }
    if (!text) return false;

    // If speaking, stop and either restart same or replace with new
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        // If same id, treat as toggle off
        if (opts.id && opts.id === currentlySpeakingId) {
            currentlySpeakingId = null;
            currentUtterance = null;
            updateButtonStates();
            return false;
        }
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'hi-IN';
    utt.rate = opts.rate || 0.9;   // slightly slower for clarity
    utt.pitch = opts.pitch || 1.0;
    utt.volume = opts.volume || 1.0;

    const voice = pickHindiVoice();
    if (voice) utt.voice = voice;

    utt.onend = () => {
        currentUtterance = null;
        currentlySpeakingId = null;
        updateButtonStates();
    };
    utt.onerror = () => {
        currentUtterance = null;
        currentlySpeakingId = null;
        updateButtonStates();
    };

    currentUtterance = utt;
    currentlySpeakingId = opts.id || null;
    speechSynthesis.speak(utt);
    updateButtonStates();
    return true;
}

export function stopSpeaking() {
    if (!isSupported()) return;
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    currentUtterance = null;
    currentlySpeakingId = null;
    updateButtonStates();
}

// Update visual state of all data-speaks-id elements
function updateButtonStates() {
    document.querySelectorAll('[data-speaks-id]').forEach(el => {
        const id = el.getAttribute('data-speaks-id');
        if (id === currentlySpeakingId && currentlySpeakingId) {
            el.classList.add('speaking-active');
            const lab = el.querySelector('.speak-label');
            if (lab) lab.textContent = '⏹️ रोकें';
        } else {
            el.classList.remove('speaking-active');
            const lab = el.querySelector('.speak-label');
            if (lab) lab.textContent = '🔊 सुनें';
        }
    });
}

// Voice loading is async on most browsers — wait for it
export function initAudio() {
    if (!isSupported()) return;
    // Trigger voice list load
    const tryLoad = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            // Voices not yet loaded; try again
            setTimeout(tryLoad, 100);
        }
    };
    if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
        speechSynthesis.onvoiceschanged = tryLoad;
    }
    tryLoad();
}

// Helper for inline speak buttons
export function speakButton(id, text) {
    const safeId = id.replace(/[^a-zA-Z0-9]/g, '_');
    return `<button class="speak-btn" data-speaks-id="${safeId}"
                    onclick="event.stopPropagation(); window.__speakInline('${safeId}', this);"
                    title="सुनें / Listen">
                <span class="speak-label">🔊 सुनें</span>
            </button>`;
}

// Global helper that the inline buttons call
if (typeof window !== 'undefined') {
    window.__speakInline = function(id, btn) {
        const text = btn.getAttribute('data-text') || btn.parentElement?.dataset?.speakText
                      || btn.closest('[data-speak-text]')?.getAttribute('data-speak-text');
        if (!text) {
            // Fall back to nearest readable content
            const card = btn.closest('.staircase-step, .definition-card, .transition-card, .info-section');
            if (card) {
                const t = card.querySelector('.staircase-step-name, .definition-title, .gunasthan-name, .info-title')?.textContent || '';
                const d = card.querySelector('.staircase-step-desc, .definition-content, .info-description')?.textContent || '';
                return speak((t + '। ' + d).trim(), { id });
            }
            return;
        }
        speak(text, { id });
    };
}
