// Voice Search Functionality

import { showMessage } from './helpers.js';

let recognition = null;
let isListening = false;

export function initVoiceSearch() {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        return false;
    }
    
    // Configure speech recognition
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // Hindi first, but will also recognize English
    
    // Handle successful recognition
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('definition-search').value = transcript;
        
        // Call search function if available
        if (window.searchDefinitions) {
            window.searchDefinitions(transcript);
        }
        
        stopVoiceSearch();
        showMessage('success', `🎤 Voice search: "${transcript}"`);
    };
    
    // Handle errors
    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        stopVoiceSearch();
        
        let errorMessage = 'Voice search failed. ';
        switch(event.error) {
            case 'no-speech':
                errorMessage += 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                errorMessage += 'Microphone not found or not working.';
                break;
            case 'not-allowed':
                errorMessage += 'Microphone permission denied.';
                break;
            case 'network':
                errorMessage += 'Network error. Check your connection.';
                break;
            default:
                errorMessage += 'Please try again or type your search.';
        }
        showMessage('warning', `⚠️ ${errorMessage}`);
    };
    
    // Handle when recognition ends
    recognition.onend = function() {
        stopVoiceSearch();
    };
    
    return true;
}

export function startVoiceSearch() {
    if (!recognition && !initVoiceSearch()) {
        showMessage('warning', '⚠️ Voice search not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
    }
    
    if (isListening) {
        stopVoiceSearch();
        return;
    }
    
    try {
        isListening = true;
        const btn = document.getElementById('voice-search-btn');
        const status = document.getElementById('voice-status');

        // Update button appearance
        if (btn) {
            btn.style.background = '#ef4444';
            btn.innerHTML = '⏹️';
            btn.title = 'Stop listening';
            btn.classList.add('voice-listening');
        }
        
        // Show status
        if (status) {
            status.style.display = 'block';
            status.innerHTML = '🎤 Listening... Speak your search term in Hindi or English!';
        }
        
        // Start recognition
        recognition.start();
        
        // Auto-stop after 10 seconds
        setTimeout(() => {
            if (isListening) {
                stopVoiceSearch();
                showMessage('info', 'ℹ️ Voice search timed out. Please try again.');
            }
        }, 10000);
        
    } catch (error) {
        console.error('Error starting voice search:', error);
        stopVoiceSearch();
        showMessage('warning', '⚠️ Could not start voice search. Please try again.');
    }
}

export function stopVoiceSearch() {
    isListening = false;
    const btn = document.getElementById('voice-search-btn');
    const status = document.getElementById('voice-status');
    
    if (recognition) {
        recognition.stop();
    }
    
    // Reset button appearance
    if (btn) {
        btn.style.background = '#10b981';
        btn.innerHTML = '🎤';
        btn.title = 'Voice search';
        btn.classList.remove('voice-listening');
    }
    
    // Hide status
    if (status) {
        status.style.display = 'none';
    }
}

export function isVoiceSearchSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function getVoiceSearchStatus() {
    return {
        supported: isVoiceSearchSupported(),
        listening: isListening,
        initialized: recognition !== null
    };
}
