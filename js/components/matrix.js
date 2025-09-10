// Matrix Component - Handles matrix display and interactions
// FIXED VERSION - Resolves click handling issues

import { thanasData, matrixData, additionalMatrices, matrixDetailedData, completeMatrixData } from '../data/matrix.js';
import { gunasthansData } from '../data/gunasthans.js';
import { getProgressColor, showMessage } from '../utils/helpers.js';

let selectedMatrix = 'default';

// Load Matrix based on selected type
export function loadMatrix() {
    const container = document.getElementById('matrix-table');
    
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
                const total = thana.total;
                const percentage = (count / total) * 100;
                const color = getProgressColor(percentage);
                
                // FIXED: Use onclick directly for better reliability
                html += `
                    <td onclick="window.showDetailedTooltip(${g}, ${index})" style="cursor: pointer;">
                        <div class="cell-fraction" style="pointer-events: none;">${count}/${total}</div>
                        <div class="progress-bar" style="pointer-events: none;">
                            <div class="progress-fill" style="width: ${percentage}%; background: ${color}; pointer-events: none;"></div>
                        </div>
                    </td>
                `;
            }
            
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
        
    } else {
        // Other matrices - CONSISTENT STRUCTURE: Thanas as rows, Categories as columns
        const matrix = additionalMatrices[selectedMatrix];
        let html = '<table class="matrix-table"><thead><tr><th class="thana-header">Thana</th>';
        
        // Column headers - proper names, not just icons
        matrix.colHeaders.forEach(colName => {
            html += `<th style="font-size: 11px; padding: 6px 3px;">${colName}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        // Rows are Thanas (consistent with original)
        thanasData.forEach((thana, thanaIndex) => {
            html += `<tr><td class="thana-header">${thana.icon} ${thana.nameHi}</td>`;
            
            for (let colIndex = 0; colIndex < matrix.cols; colIndex++) {
                const count = matrix.data[thanaIndex][colIndex];
                const total = matrix.totals[thanaIndex];
                const percentage = (count / total) * 100;
                const color = getProgressColor(percentage);
                
                // FIXED: Use window.showNewDetailedTooltip for consistency
                html += `
                    <td onclick="window.showNewDetailedTooltip('${selectedMatrix}', ${thanaIndex}, ${colIndex})" style="cursor: pointer;">
                        <div class="cell-fraction" style="pointer-events: none;">${count}/${total}</div>
                        <div class="progress-bar" style="pointer-events: none;">
                            <div class="progress-fill" style="width: ${percentage}%; background: ${color}; pointer-events: none;"></div>
                        </div>
                    </td>
                `;
            }
            
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }
}

// Change matrix type
export function changeMatrix() {
    const selector = document.getElementById('matrix-selector');
    selectedMatrix = selector.value;
    loadMatrix();
}

// Show detailed tooltip for default matrix
export function showDetailedTooltip(gunasthanId, thanaIndex) {
    console.log('showDetailedTooltip called:', gunasthanId, thanaIndex);
    
    const modal = document.getElementById('tooltip-modal');
    if (!modal) {
        console.error('Tooltip modal not found!');
        return;
    }
    
    const g = gunasthansData[gunasthanId];
    const t = thanasData[thanaIndex];
    
    if (!g || !t) {
        console.error('Invalid gunasthan or thana:', gunasthanId, thanaIndex);
        return;
    }
    
    // Get the count from matrix data
    const count = matrixData[gunasthanId][thanaIndex];
    const total = t.total;
    
    // Get detailed data from completeMatrixData
    let cellData;
    
    // First try to get from completeMatrixData which has the accurate data
    if (completeMatrixData && completeMatrixData[thanaIndex] && completeMatrixData[thanaIndex][gunasthanId - 1]) {
        const rawData = completeMatrixData[thanaIndex][gunasthanId - 1];
        cellData = {
            present: rawData.present || [],
            absent: rawData.absent || [],
            count: count,
            total: total,
            notes: `Gunasthan ${gunasthanId} में ${t.nameHi} के ${count}/${total} गुण उपस्थित हैं`
        };
    } else if (matrixDetailedData && matrixDetailedData['default'] && 
               matrixDetailedData['default'][thanaIndex] && 
               matrixDetailedData['default'][thanaIndex][gunasthanId]) {
        // Fallback to matrixDetailedData
        cellData = matrixDetailedData['default'][thanaIndex][gunasthanId];
    } else {
        // Last resort fallback
        console.warn('No detailed data found, using fallback');
        cellData = {
            present: count === total ? t.subtypes : (count === 0 ? [] : t.subtypes.slice(0, count)),
            absent: count === 0 ? t.subtypes : (count === total ? [] : t.subtypes.slice(count)),
            count: count,
            total: total,
            notes: `Gunasthan ${gunasthanId} में ${t.nameHi} के ${count}/${total} गुण उपस्थित हैं`
        };
    }
    
    // Update modal header
    document.getElementById('tooltip-title').textContent = `${t.icon} ${t.nameHi}`;
    document.getElementById('tooltip-subtitle').textContent = `${t.nameEn} - ${t.english}`;
    document.getElementById('tooltip-gunasthan').textContent = `Gunasthan ${gunasthanId}: ${g.nameHi}`;
    
    // Update stats
    document.getElementById('stat-present').textContent = cellData.present.length;
    document.getElementById('stat-absent').textContent = cellData.absent.length;
    document.getElementById('stat-total').textContent = cellData.total;
    
    // Build body content
    let bodyHtml = '';
    
    // Present characteristics
    if (cellData.present && cellData.present.length > 0) {
        bodyHtml += `
            <div class="tooltip-section present">
                <div class="section-header">
                    <span class="icon present">✓</span>
                    <span class="section-title present">Present (${cellData.present.length})</span>
                </div>
                <div class="section-items">
                    ${cellData.present.map(item => 
                        `<span class="item-tag present" onclick="window.findDefinitionByThana('${t.nameHi}', '${item}')" style="cursor: pointer;">${item}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    // Absent characteristics
    if (cellData.absent && cellData.absent.length > 0) {
        bodyHtml += `
            <div class="tooltip-section absent">
                <div class="section-header">
                    <span class="icon absent">✗</span>
                    <span class="section-title absent">Absent (${cellData.absent.length})</span>
                </div>
                <div class="section-items">
                    ${cellData.absent.map(item => 
                        `<span class="item-tag" onclick="window.findDefinitionByThana('${t.nameHi}', '${item}')" style="cursor: pointer;">${item}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    // Add notes if available
    if (cellData.notes) {
        bodyHtml += `
            <div class="tooltip-notes">
                <strong>विशेष:</strong> ${cellData.notes}
            </div>
        `;
    }
    
    // Progress visualization
    const percentage = (cellData.count / cellData.total * 100).toFixed(1);
    bodyHtml += `
        <div class="progress-info">
            <div class="progress-percentage">${percentage}%</div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                ${cellData.count} out of ${cellData.total} characteristics present
            </div>
            <div class="progress-bar-large">
                <div class="progress-fill-large" style="width: ${percentage}%; background: ${getProgressColor(parseFloat(percentage))}"></div>
            </div>
        </div>
    `;
    
    document.getElementById('tooltip-body').innerHTML = bodyHtml;
    
    // Show modal
    modal.classList.remove('hidden');
}

// Show detailed tooltip for alternative matrices
export function showNewDetailedTooltip(matrixType, thanaIndex, colIndex) {
    console.log('showNewDetailedTooltip called:', matrixType, thanaIndex, colIndex);
    
    const modal = document.getElementById('tooltip-modal');
    if (!modal) {
        console.error('Tooltip modal not found!');
        return;
    }
    
    const matrix = additionalMatrices[matrixType];
    const thana = thanasData[thanaIndex];
    const colName = matrix.colHeaders[colIndex];
    const count = matrix.data[thanaIndex][colIndex];
    const total = matrix.totals[thanaIndex];
    
    // Update header
    document.getElementById('tooltip-title').textContent = `${thana.icon} ${thana.nameHi}`;
    document.getElementById('tooltip-subtitle').textContent = `${thana.nameEn} - ${thana.english}`;
    document.getElementById('tooltip-gunasthan').textContent = colName;
    
    // Update stats
    document.getElementById('stat-present').textContent = count;
    document.getElementById('stat-absent').textContent = total - count;
    document.getElementById('stat-total').textContent = total;
    
    // Build body content
    let bodyHtml = '';
    
    // Check if we have detailed data for this matrix
    if (matrixDetailedData && matrixDetailedData[matrixType] && 
        matrixDetailedData[matrixType][thanaIndex] && 
        matrixDetailedData[matrixType][thanaIndex][colIndex]) {
        
        const cellData = matrixDetailedData[matrixType][thanaIndex][colIndex];
        
        // Present items
        if (cellData.present && cellData.present.length > 0) {
            bodyHtml += `
                <div class="tooltip-section present">
                    <div class="section-header">
                        <span class="icon present">✓</span>
                        <span class="section-title present">Present (${cellData.present.length})</span>
                    </div>
                    <div class="section-items">
                        ${cellData.present.map(item => 
                            `<span class="item-tag present" onclick="window.findDefinitionByThana('${thana.nameHi}', '${item}')" style="cursor: pointer;">${item}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        // Absent items
        if (cellData.absent && cellData.absent.length > 0) {
            bodyHtml += `
                <div class="tooltip-section absent">
                    <div class="section-header">
                        <span class="icon absent">✗</span>
                        <span class="section-title absent">Absent (${cellData.absent.length})</span>
                    </div>
                    <div class="section-items">
                        ${cellData.absent.map(item => 
                            `<span class="item-tag" onclick="window.findDefinitionByThana('${thana.nameHi}', '${item}')" style="cursor: pointer;">${item}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        // Notes
        if (cellData.notes) {
            bodyHtml += `
                <div class="tooltip-notes">
                    <strong>विशेष:</strong> ${cellData.notes}
                </div>
            `;
        }
    } else {
        // Fallback for data without detailed breakdown
        bodyHtml = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 36px; margin-bottom: 16px;">📊</div>
                <h3 style="margin-bottom: 12px;">${thana.nameHi}</h3>
                <p style="color: #6b7280; margin-bottom: 20px;">in ${colName}</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 12px;">
                    <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${count}/${total}</div>
                    <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">
                        ${((count/total)*100).toFixed(1)}% characteristics present
                    </div>
                </div>
            </div>
        `;
    }
    
    // Progress visualization
    const percentage = (count / total * 100).toFixed(1);
    bodyHtml += `
        <div class="progress-info">
            <div class="progress-percentage">${percentage}%</div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                ${count} out of ${total} characteristics present
            </div>
            <div class="progress-bar-large">
                <div class="progress-fill-large" style="width: ${percentage}%; background: ${getProgressColor(parseFloat(percentage))}"></div>
            </div>
        </div>
    `;
    
    document.getElementById('tooltip-body').innerHTML = bodyHtml;
    modal.classList.remove('hidden');
}

// Search in matrix
export function searchInMatrix(searchTerm) {
    const term = searchTerm.toLowerCase();
    
    // Highlight relevant Thana rows
    document.querySelectorAll('.matrix-table tbody tr').forEach((row, index) => {
        const thana = thanasData[index];
        if (thana && (thana.nameHi.includes(searchTerm) || 
                    thana.nameEn.toLowerCase().includes(term) ||
                    thana.english.toLowerCase().includes(term))) {
            row.style.background = '#f0f9ff';
            row.style.border = '2px solid #3b82f6';
            row.classList.add('search-highlight');
            
            // Scroll to first match
            if (!document.querySelector('.search-highlight')) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            row.style.background = '';
            row.style.border = '';
            row.classList.remove('search-highlight');
        }
    });
    
    // Show search info
    showMessage('info', `🔍 Highlighted Thanas matching: ${searchTerm}`);
}

// Close tooltip
export function closeTooltip(event) {
    if (!event || event.target.id === 'tooltip-modal' || event.target.classList.contains('close-button')) {
        document.getElementById('tooltip-modal').classList.add('hidden');
    }
}
