// Voice Search Utility
import { showMessage } from './helpers.js';
import { quickSearch } from '../components/search.js';

let recognition = null;
let isListening = false;

// Initialize voice search
export function initVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech recognition not supported');
        return false;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // Hindi language
    
    recognition.onstart = () => {
        isListening = true;
        updateVoiceUI(true);
        showMessage('info', '🎤 Listening... Speak now');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        showMessage('success', `🎤 Heard: "${transcript}"`);
        
        // Perform search with the transcript
        quickSearch(transcript);
        
        stopVoiceSearch();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceSearch();
        
        let errorMessage = 'Voice search error occurred';
        switch(event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                errorMessage = 'No microphone found. Please check your settings.';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone access denied. Please allow microphone access.';
                break;
            case 'network':
                errorMessage = 'Network error. Please check your connection.';
                break;
            default:
                errorMessage = `Voice search error: ${event.error}`;
        }
        
        showMessage('warning', errorMessage);
    };
    
    recognition.onend = () => {
        isListening = false;
        updateVoiceUI(false);
    };
    
    return true;
}

// Start voice search
export function startVoiceSearch() {
    if (!recognition) {
        showMessage('warning', 'Voice search not available');
        return;
    }
    
    if (isListening) {
        stopVoiceSearch();
        return;
    }
    
    try {
        recognition.start();
        
        // Auto-stop after 10 seconds
        setTimeout(() => {
            if (isListening) {
                stopVoiceSearch();
                showMessage('info', 'Voice search timed out. Please try again.');
            }
        }, 10000);
        
    } catch (error) {
        console.error('Error starting voice search:', error);
        stopVoiceSearch();
        showMessage('warning', '⚠️ Could not start voice search. Please try again.');
    }
}

// Stop voice search
export function stopVoiceSearch() {
    isListening = false;
    
    if (recognition) {
        recognition.stop();
    }
    
    updateVoiceUI(false);
}

// Update voice search UI
function updateVoiceUI(listening) {
    const btn = document.getElementById('voice-search-btn');
    const status = document.getElementById('voice-status');
    
    if (btn) {
        if (listening) {
            btn.style.background = '#ef4444';
            btn.innerHTML = '⏹️';
            btn.title = 'Stop listening';
            btn.classList.add('voice-listening');
        } else {
            btn.style.background = '#10b981';
            btn.innerHTML = '🎤';
            btn.title = 'Voice search';
            btn.classList.remove('voice-listening');
        }
    }
    
    if (status) {
        status.style.display = listening ? 'block' : 'none';
    }
}

// Add voice search button to page (if desired)
export function addVoiceSearchButton() {
    // Check if button already exists
    if (document.getElementById('voice-search-btn')) return;
    
    const button = document.createElement('button');
    button.id = 'voice-search-btn';
    button.innerHTML = '🎤';
    button.title = 'Voice search';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: #10b981;
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    // Add listening animation styles
    const style = document.createElement('style');
    style.textContent = `
        .voice-listening {
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    button.onclick = startVoiceSearch;
    document.body.appendChild(button);
    
    // Add status indicator
    const status = document.createElement('div');
    status.id = 'voice-status';
    status.textContent = 'Listening...';
    status.style.cssText = `
        position: fixed;
        bottom: 85px;
        right: 20px;
        padding: 8px 12px;
        background: rgba(0,0,0,0.8);
        color: white;
        border-radius: 6px;
        font-size: 12px;
        display: none;
        z-index: 1000;
    `;
    document.body.appendChild(status);
}

// Check if voice search is supported
export function isVoiceSearchSupported() {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
}

// Export state getter
export function getVoiceSearchState() {
    return {
        isSupported: isVoiceSearchSupported(),
        isListening,
        isInitialized: !!recognition
    };
}
