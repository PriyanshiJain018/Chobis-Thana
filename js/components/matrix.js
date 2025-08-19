// Matrix Component
import { thanasData } from '../data/definitions.js';
import { matrixData, additionalMatrices } from '../data/matrix.js';
import { showMessage } from '../utils/helpers.js';

let selectedMatrix = 'default';

export function initMatrix() {
    loadMatrix();
}

function loadMatrix() {
    const container = document.getElementById('matrix-table');
    if (!container) return;
    
    if (selectedMatrix === 'default') {
        // Original Thana-Gunasthan matrix
        let html = '<table class="matrix-table"><thead><tr><th class="thana-header">Thana</th>';
        
        for (let i = 1; i <= 14; i++) {
            html += `<th>G${i}</th>`;
        }
        html += '</tr></thead><tbody>';
        
        thanasData.forEach((thana, index) => {
            html += `<tr><td class="thana-header">${thana.icon} ${thana.nameHi}</td>`;
            
            for (let g = 1; g <= 14; g++) {
                const count = matrixData[g][index];
                const total = thana.total || 0;
                const percentage = total > 0 ? (count / total * 100).toFixed(0) : 0;
                
                let cellClass = 'matrix-cell';
                if (count === 0) cellClass += ' zero';
                else if (count === total) cellClass += ' full';
                else cellClass += ' partial';
                
                html += `<td class="${cellClass}" 
                    onclick="showDetailedTooltip(${g}, ${index})"
                    title="G${g} - ${thana.nameHi}: ${count}/${total} (${percentage}%)">
                    ${count}
                </td>`;
            }
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } else {
        // Additional matrices
        const matrix = additionalMatrices[selectedMatrix];
        if (!matrix) return;
        
        let html = `<div class="matrix-info">
            <h3>${matrix.nameHi}</h3>
            <p>${matrix.description}</p>
        </div>`;
        
        html += '<table class="matrix-table"><thead><tr><th class="thana-header">Thana</th>';
        
        matrix.colHeaders.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        thanasData.forEach((thana, index) => {
            html += `<tr><td class="thana-header">${thana.icon} ${thana.nameHi}</td>`;
            
            const rowData = matrix.data[index] || [];
            rowData.forEach(value => {
                html += `<td class="matrix-cell">${value}</td>`;
            });
            
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }
}

// Show detailed tooltip for matrix cell
window.showDetailedTooltip = function(gunasthanId, thanaIndex) {
    const modal = document.getElementById('tooltip-modal');
    const thana = thanasData[thanaIndex];
    
    if (!modal || !thana) return;
    
    const count = matrixData[gunasthanId][thanaIndex];
    const total = thana.total || 0;
    
    // Basic tooltip implementation
    document.getElementById('tooltip-title').textContent = thana.nameHi;
    document.getElementById('tooltip-subtitle').textContent = `${thana.nameEn} - ${thana.english}`;
    document.getElementById('tooltip-gunasthan').textContent = `गुणस्थान ${gunasthanId}`;
    
    document.getElementById('stat-present').textContent = count;
    document.getElementById('stat-absent').textContent = total - count;
    document.getElementById('stat-total').textContent = total;
    
    const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
    
    let bodyHtml = `
        <div class="progress-info">
            <div class="progress-percentage">${percentage}%</div>
            <div class="progress-bar-large">
                <div class="progress-fill-large" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
    
    if (thana.definition) {
        bodyHtml += `
            <div style="margin-top: 16px; padding: 12px; background: #f9fafb; border-radius: 8px;">
                <strong>परिभाषा:</strong> ${thana.definition}
            </div>
        `;
    }
    
    document.getElementById('tooltip-body').innerHTML = bodyHtml;
    modal.classList.remove('hidden');
};

export { selectedMatrix };
