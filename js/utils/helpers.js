// Utility helper functions

// Helper function to get progress color based on percentage
export function getProgressColor(percentage) {
    if (percentage === 0) return '#9CA3AF';
    if (percentage < 25) return '#10B981';
    if (percentage < 50) return '#F59E0B';
    if (percentage < 75) return '#F97316';
    return '#EF4444';
}

// Helper function to show messages/toasts
export function showMessage(type, message) {
    // Create a simple toast message
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
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

// Helper function to scroll to a gunasthan
export function scrollToGunasthan(gunasthanId) {
    // This will be implemented in the main app
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

// Helper function to clear search highlights
export function clearSearchHighlights() {
    document.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
        el.style.background = '';
        el.style.border = '';
        el.style.boxShadow = '';
        el.style.animation = '';
    });
}

// Helper function to highlight search results
export function highlightSearchResult(element, type = 'info') {
    const colors = {
        success: { bg: '#f0fdf4', border: '#22c55e', shadow: 'rgba(34, 197, 94, 0.5)' },
        warning: { bg: '#fef3c7', border: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.5)' },
        info: { bg: '#f0f9ff', border: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.5)' }
    };
    
    const color = colors[type] || colors.info;
    
    element.style.background = color.bg;
    element.style.border = `3px solid ${color.border}`;
    element.style.boxShadow = `0 0 20px ${color.shadow}`;
    element.style.animation = 'pulse 3s ease-in-out';
    element.classList.add('search-highlight');
    
    // Remove highlight after 5 seconds
    setTimeout(() => {
        element.style.background = '';
        element.style.border = '';
        element.style.boxShadow = '';
        element.style.animation = '';
        element.classList.remove('search-highlight');
    }, 5000);
}

// Helper function to format numbers for display
export function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Helper function to debounce function calls
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

// Helper function to check if string contains search term (case insensitive)
export function containsSearchTerm(text, searchTerm) {
    if (!text || !searchTerm) return false;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
}

// Helper function to create loading spinner
export function createLoadingSpinner() {
    return '<div class="loading"><div class="loading-spinner"></div><p>Loading...</p></div>';
}

// Helper function to animate element entrance
export function animateElementEntrance(element, delay = 0) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        element.style.transition = 'all 0.3s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, delay);
}

// Helper function to copy text to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showMessage('success', 'Copied to clipboard!');
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        showMessage('warning', 'Failed to copy text');
        return false;
    }
}
