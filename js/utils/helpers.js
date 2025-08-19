// Utility Helper Functions

// Show toast message
export function showMessage(type, message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        max-width: 350px;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Format numbers with proper locale
export function formatNumber(num) {
    if (typeof num !== 'number') return num;
    return num.toLocaleString('hi-IN');
}

// Calculate percentage safely
export function calculatePercentage(value, total) {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
}

// Debounce function for search
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Check if device is mobile
export function isMobile() {
    return window.innerWidth <= 768;
}

// Smooth scroll to element
export function scrollToElement(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (element) {
        const top = element.offsetTop - offset;
        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    }
}

// Copy text to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showMessage('success', 'Copied to clipboard!');
        return true;
    } catch (err) {
        console.error('Failed to copy: ', err);
        showMessage('warning', 'Failed to copy to clipboard');
        return false;
    }
}

// Generate unique ID
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Deep clone object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Check if object is empty
export function isEmpty(obj) {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

// Add CSS animation styles if not already present
export function addAnimationStyles() {
    if (document.getElementById('helper-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'helper-animations';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        
        .search-highlight {
            animation: fadeIn 0.3s ease;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize helper utilities
export function initHelpers() {
    addAnimationStyles();
}

// Call init on import
initHelpers();
