// Simple Hindi Display Solution
// Add this code at the END of your existing app.js file (don't replace anything)
// This will only change the display text without affecting any functionality

// Function to update display text to Hindi
function updateDisplayToHindi() {
    // Update tab display text only
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        const tabName = tab.getAttribute('data-tab');
        switch(tabName) {
            case 'overview':
                tab.textContent = 'मुख्य पृष्ठ';
                break;
            case 'matrix':
                tab.textContent = 'चार्ट';
                break;
            case 'transitions':
                tab.textContent = 'गुणस्थान बदलाव';
                break;
            case 'definitions':
                tab.textContent = 'परिभाषाएं ';
                break;
        }
    });
    
    // Update info section titles
    const updateInfoSections = () => {
        // Matrix section
        const matrixInfo = document.querySelector('#matrix-content .info-title');
        if (matrixInfo && matrixInfo.textContent === '24 Thana Matrix') {
            matrixInfo.textContent = '२४ ठाणा चार्ट';
        }
        
        const matrixDesc = document.querySelector('#matrix-content .info-description');
        if (matrixDesc) {
            matrixDesc.innerHTML = `
                १४ गुणस्थान में २४ आध्यात्मिक गुणों का पूरा विवरण।
                किसी भी खाने पर क्लिक करें - उपस्थित और अनुपस्थित गुणों की जानकारी मिलेगी।
                शब्दों का अर्थ जानने के लिए उन पर क्लिक करें।
            `;
        }
        
        // Transitions section  
        const transitionsInfo = document.querySelector('#transitions-content .info-title');
        if (transitionsInfo && transitionsInfo.textContent === 'Spiritual Progression Paths') {
            transitionsInfo.textContent = 'आध्यात्मिक प्रगति के मार्ग';
        }
        
        const transitionsDesc = document.querySelector('#transitions-content .info-description');
        if (transitionsDesc) {
            transitionsDesc.innerHTML = `
                गुणस्थानों के बीच संभावित बदलाव देखें। प्रत्येक स्तर से आगे या पीछे जाने के विशेष नियम हैं।
                ये नियम आपकी आध्यात्मिक प्रगति और कर्मों पर आधारित हैं।
                विभिन्न गुणस्थान में आरोहण तथा अवरोहण के नियम।
            `;
        }
        
        // Definitions section
        const defsInfo = document.querySelector('#definitions-content .info-title');
        if (defsInfo && defsInfo.textContent === 'Comprehensive Definitions') {
            defsInfo.textContent = 'विस्तृत परिभाषाएं ';
        }
        
        const defsDesc = document.querySelector('#definitions-content .info-description');
        if (defsDesc) {
            defsDesc.innerHTML = `
                इस ऐप में उपयोग किए गए सभी जैन दर्शन के शब्दों और विचारों की सरल व्याख्या।
                अर्थ समझने के लिए खोजें या श्रेणी के अनुसार देखें।
            `;
        }
        
        // Update matrix selector label
        const matrixLabel = document.querySelector('label[for="matrix-selector"]');
        if (!matrixLabel) {
            const matrixSelector = document.getElementById('matrix-selector');
            if (matrixSelector && matrixSelector.previousElementSibling) {
                const label = matrixSelector.previousElementSibling;
                if (label && label.textContent === 'Matrix View:') {
                    label.textContent = 'चार्ट का प्रकार:';
                }
            }
        }
        
        // Update matrix selector options
        const matrixSelector = document.getElementById('matrix-selector');
        if (matrixSelector) {
            const options = matrixSelector.querySelectorAll('option');
            options.forEach(option => {
                switch(option.value) {
                    case 'default':
                        option.textContent = 'ठाणा-गुणस्थान (२४×१४)';
                        break;
                    case 'gati':
                        option.textContent = 'गति चार्ट (४×२४)';
                        break;
                    case 'indriya':
                        option.textContent = 'इंद्रिय चार्ट (५×२४)';
                        break;
                }
            });
        }
        
        // Update subtitle in header
        const subtitle = document.querySelector('.app-subtitle');
        if (subtitle && subtitle.textContent === 'Complete Spiritual Journey Mapping') {
            subtitle.textContent = 'आध्यात्मिक यात्रा की पूरी जानकारी';
        }
        
        // Update definition search placeholder
        const defSearch = document.getElementById('definition-search');
        if (defSearch) {
            defSearch.placeholder = 'शब्द खोजें (हिंदी/अंग्रेजी में)...';
        }
        
        // Update tooltip stats labels
        const updateTooltipLabels = () => {
            const statLabels = document.querySelectorAll('.stat-label');
            statLabels.forEach(label => {
                switch(label.textContent) {
                    case 'Present':
                        label.textContent = 'उपस्थित';
                        break;
                    case 'Absent':
                        label.textContent = 'अनुपस्थित';
                        break;
                    case 'Total':
                        label.textContent = 'कुल';
                        break;
                }
            });
        };
        
        // Watch for tooltip modal to appear and update labels
        const tooltipObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.id === 'tooltip-modal' && 
                    !mutation.target.classList.contains('hidden')) {
                    updateTooltipLabels();
                }
            });
        });
        
        const tooltipModal = document.getElementById('tooltip-modal');
        if (tooltipModal) {
            tooltipObserver.observe(tooltipModal, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        }
    };
    
    // Update Overview section with Hindi
    const updateOverviewSection = () => {
        // This will be called when overview is loaded
        const sourceTitle = document.querySelector('#gunasthan-list h3');
        if (sourceTitle && sourceTitle.textContent === 'Source Material') {
            sourceTitle.textContent = 'स्रोत सामग्री';
            
            // Update source description
            const sourceDesc = sourceTitle.parentElement.nextElementSibling;
            if (sourceDesc) {
                sourceDesc.innerHTML = `
                    यह ऐप पूर्णतः प्रामाणिक ग्रंथ पर आधारित है:
                    <strong style="color: #0ea5e9;">श्री चौबीस ठाणा चर्चा</strong> 
                    लेखक - निर्यापक मुनि श्री प्रशांतसागर जी महाराज। 
                    सभी डेटा, परिभाषाएं और आध्यात्मिक विचार इस प्रामाणिक स्रोत से सावधानीपूर्वक लिए गए हैं।
                `;
            }
            
            // Update button text
            const sourceButton = sourceTitle.parentElement.parentElement.querySelector('button');
            if (sourceButton && sourceButton.textContent.includes('View Original PDF')) {
                sourceButton.innerHTML = '📄 मूल PDF देखें';
            }
        }
        
        // Update overview cards
        const gunasthanTitle = document.querySelector('#gunasthan-list h3:last-of-type');
        if (gunasthanTitle && gunasthanTitle.textContent.includes('14 Gunasthans')) {
            gunasthanTitle.innerHTML = '🛕 १४ गुणस्थान - आध्यात्मिक विकास के चरण';
        }
        
        // Update navigation cards in overview
        const cards = document.querySelectorAll('#gunasthan-list [onclick*="Tab"]');
        cards.forEach(card => {
            const titleDiv = card.querySelector('div[style*="font-weight: 600"]');
            const subtitleDiv = card.querySelector('div[style*="font-size: 12px"]');
            
            if (titleDiv && subtitleDiv) {
                if (titleDiv.textContent === 'Matrix View') {
                    titleDiv.textContent = 'चार्ट देखें';
                    subtitleDiv.textContent = '२४ ठाणा विश्लेषण';
                } else if (titleDiv.textContent === 'Transitions') {
                    titleDiv.textContent = 'गुणस्थान बदलाव';
                    subtitleDiv.textContent = 'गुणस्थान आरोहण-अवरोहण';
                } else if (titleDiv.textContent === 'Definitions') {
                    titleDiv.textContent = 'परिभाषाएं ';
                    subtitleDiv.textContent = 'संपूर्ण शब्दकोश';
                }
            }
        });
    };
    
    // Run updates
    updateInfoSections();
    
    // Watch for overview content to be loaded
    const overviewObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'gunasthan-list' && mutation.addedNodes.length > 0) {
                setTimeout(updateOverviewSection, 100);
            }
        });
    });
    
    const gunasthanList = document.getElementById('gunasthan-list');
    if (gunasthanList) {
        overviewObserver.observe(gunasthanList, { childList: true });
        // Also try to update immediately if content is already there
        if (gunasthanList.children.length > 0) {
            updateOverviewSection();
        }
    }
}

// Call this function after the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(updateDisplayToHindi, 100);
    });
} else {
    // DOM is already loaded
    setTimeout(updateDisplayToHindi, 100);
}

// Also update when tabs are switched
const originalShowTab = window.showTab;
if (originalShowTab) {
    window.showTab = function(tabName) {
        originalShowTab(tabName);
        setTimeout(updateDisplayToHindi, 50);
    };
}
