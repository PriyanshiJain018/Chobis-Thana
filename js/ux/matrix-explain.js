// मुझे समझाओ matrix mode — when active, the matrix tooltip enriches the cell
// data with a plain-Hindi prose explanation tailored to the gunasthan/thana pair.

import { completeMatrixData, thanasData } from '../data/matrix.js';
import { gunasthansData } from '../data/gunasthans.js';

const STORAGE_KEY = 'chobis-matrix-mode';

// Mode: 'numbers' | 'explain'
export function getMatrixMode() {
    return localStorage.getItem(STORAGE_KEY) || 'numbers';
}

export function setMatrixMode(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
    updateToggleButtons(mode);
}

function updateToggleButtons(mode) {
    document.querySelectorAll('.matrix-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
}

// Generate a plain-Hindi explanation block for a given gunasthan × thana cell
export function generateExplanation(gunasthanId, thanaIdx) {
    const cell = completeMatrixData[gunasthanId]?.[thanaIdx];
    if (!cell) return null;
    const g = gunasthansData[gunasthanId];
    const t = thanasData[thanaIdx];
    if (!g || !t) return null;

    const count = cell.count;
    const total = cell.total;
    const present = cell.present || [];
    const absent = cell.absent || [];
    const notes = cell.notes || '';

    // Build the explanation
    let explainTitle = `${g.nameHi} गुणस्थान में ${t.nameHi}`;
    let summary = '';
    let yesLine = '';
    let noLine = '';
    let interpretation = '';

    // Summary based on count
    if (count === 0) {
        summary = `इस गुणस्थान में कोई भी ${t.nameHi} नहीं है (कुल ${total} में से 0)।`;
    } else if (count === total) {
        summary = `इस गुणस्थान में सभी ${total} ${t.nameHi} संभव हैं।`;
    } else {
        summary = `इस गुणस्थान में कुल ${total} ${t.nameHi} में से ${count} शेष हैं।`;
    }

    // Yes line — present items
    if (present.length && count > 0 && count < total) {
        const items = present.length <= 6 ? present.join(', ')
                     : present.slice(0, 6).join(', ') + ' आदि';
        yesLine = `<span class="yes">✅ शेष / उपस्थित:</span> ${items}।`;
    } else if (count === total) {
        yesLine = `<span class="yes">✅ सभी ${total} प्रकार उपस्थित हैं।</span>`;
    }

    // No line — absent items
    if (absent.length && count > 0 && count < total) {
        const items = absent.length <= 6 ? absent.join(', ')
                     : absent.slice(0, 6).join(', ') + ' आदि';
        noLine = `<span class="no">❌ अनुपस्थित / क्षय या अप्रकट:</span> ${items}।`;
    } else if (count === 0) {
        noLine = `<span class="no">❌ सभी ${total} ${t.nameHi} अनुपस्थित।</span>`;
    }

    // Interpretation — gunasthan-specific narrative for the chosen thana
    interpretation = generateInterpretation(gunasthanId, thanaIdx, count, total, g, t);

    // Notes from data file (if any)
    const notesLine = notes ? `<p style="margin-top: 10px; font-style: italic; color: var(--c-maroon);"><strong>विशेष:</strong> ${notes}</p>` : '';

    return {
        title: explainTitle,
        prose: `
            <p>${summary}</p>
            ${yesLine ? `<p>${yesLine}</p>` : ''}
            ${noLine ? `<p>${noLine}</p>` : ''}
            ${interpretation ? `<p style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border-strong);"><strong>अर्थ:</strong> ${interpretation}</p>` : ''}
            ${notesLine}
        `
    };
}

// Per-thana interpretation in plain Hindi.
// Gives a "what does this mean spiritually?" explanation for the cell.
function generateInterpretation(g, t, count, total, gData, tData) {
    // Thana-by-thana interpretive logic
    switch (t) {
        case 0: // गति
            if (g === 14) return 'अयोग केवली का देह छूटते ही सीधे सिद्धगति प्राप्त होती है — किसी अन्य गति का स्पर्श नहीं।';
            if (g === 13) return 'सयोग केवली केवल मनुष्य भव में सम्भव हैं।';
            if (g >= 11) return 'इस ऊँचाई पर केवल मनुष्य गति में पहुँचना सम्भव है।';
            if (count === 4) return 'चारों गतियों के जीव इस गुणस्थान में सम्भव हैं — मिथ्यात्व सर्वव्यापी अवस्था है।';
            return '';

        case 1: // इन्द्रिय
            if (count === 1 && g >= 4) return 'सम्यक्त्व-धारी ऊँचे गुणस्थानों में केवल पंचेन्द्रिय जीव ही पहुँच सकते हैं।';
            return '';

        case 2: // काय
            if (count === 1 && g >= 4) return 'त्रसकाय (पंचेन्द्रिय गतिशील देह) के अतिरिक्त किसी काय में ये उच्च गुणस्थान सम्भव नहीं।';
            return '';

        case 3: // योग
            if (g === 14) return 'अयोग केवली में मन-वचन-काय के सभी योग रुक चुके हैं।';
            if (g === 13 && count === 7) return 'सयोग केवली में योग शेष — किन्तु असत्य या उभय रूप योग नहीं रहते (शुद्ध परिणाम के कारण)।';
            return '';

        case 5: // कषाय
            if (count === 0) return 'सभी 25 कषायों का क्षय/उपशम हो चुका है — आत्मा कषाय-मुक्त है।';
            if (count === 1 && g === 10) return 'मात्र संज्वलन लोभ का अत्यन्त सूक्ष्म उदय शेष — इसी के नाम पर "सूक्ष्मसाम्पराय"।';
            if (count === 7 && g === 9) return 'अनिवृत्तिकरण में 4 संज्वलन कषाय + 3 वेद शेष — हास्य-रति आदि नो-कषाय भी क्षय हो चुके।';
            if (count === 13 && g >= 6 && g <= 8) return 'अप्रत्याख्यानावरण और प्रत्याख्यानावरण कषाय क्षय/उपशम हो चुके — संज्वलन 4 + नो-कषाय 9 शेष।';
            if (count === 17 && g === 5) return 'अनन्तानुबन्धी और अप्रत्याख्यानावरण कषाय अनुपस्थित — श्रावक के देश-संयम के योग्य अवस्था।';
            if (count === 21 && g >= 4 && g < 5) return 'अनन्तानुबन्धी कषाय का अनुदय — सम्यग्दर्शन की पहली शर्त।';
            return '';

        case 6: // ज्ञान
            if (count === 1 && g >= 13) return 'केवलज्ञान — असीम, समस्त त्रिकाल पदार्थों को जानने वाला; अन्य ज्ञानों की आवश्यकता नहीं।';
            if (count === 4 && (g === 11 || g === 12)) return 'मति, श्रुत, अवधि, मनःपर्यय — चार सम्यग्ज्ञान; केवलज्ञान अभी प्रकट नहीं हुआ।';
            if (count === 3 && g === 3) return 'मिश्र गुणस्थान में तीनों ज्ञान "मिश्र" रूप में हैं — खिचड़ी की तरह सम्यक् और मिथ्या मिश्रित।';
            if (count === 3 && (g === 1 || g === 2)) return 'सम्यक्त्व न होने से तीनों कुज्ञान — कुमति, कुश्रुत, कुअवधि (विभंग)।';
            return '';

        case 7: // संयम
            if (count === 1 && g === 1) return 'मिथ्यात्व में कोई व्रत-संयम नहीं — असंयम।';
            if (count === 1 && g === 5) return 'देशसंयम — श्रावक का आंशिक व्रत; पूर्ण मुनि-दीक्षा नहीं।';
            if (count === 1 && g >= 11) return 'यथाख्यात संयम — पूर्ण आदर्श मुनि-संयम; मोह की समाप्ति/उपशम के बाद।';
            return '';

        case 9: // लेश्या
            if (count === 1 && g >= 13) return 'केवल शुक्ल लेश्या — परम शुद्ध परिणाम।';
            if (count === 3 && g <= 2) return 'मात्र अशुभ लेश्याएँ (कृष्ण, नील, कापोत) — अधोगति की संकेत।';
            return '';

        case 10: // भव्य
            if (count === 1) return 'इस गुणस्थान तक पहुँचने वाला अवश्य भव्य ही है — अभव्य कभी सम्यक्त्व प्राप्त नहीं कर सकता।';
            return '';

        case 11: // सम्यक्त्व
            if (count === 2 && g === 11) return 'द्वितीयोपशम सम्यक्त्व (उपशम श्रेणी से आए हुए को) तथा क्षायिक सम्यक्त्व — दोनों मोह-रहित अवस्थाएँ।';
            if (count === 1 && g >= 12) return 'क्षायिक सम्यक्त्व — मोहनीय कर्म का पूर्ण क्षय; अब कभी पतन नहीं।';
            return '';

        case 13: // आहारक
            if (count === 1 && g >= 13) return 'अयोग केवली एवं विग्रहगति में अनाहारक स्थिति — कर्म-शरीर-योग्य पुद्गल ग्रहण नहीं।';
            return '';

        case 17: // प्राण
            if (count === 4) return 'एकेन्द्रिय जीव — स्पर्श इन्द्रिय, काय बल, आयु, श्वास — मात्र चार प्राण।';
            if (count === 1 && g === 14) return 'अयोग केवली में मात्र आयु प्राण शेष — अन्य सब रुक चुके।';
            return '';

        case 18: // संज्ञा
            if (count === 1 && g === 10) return 'दसवें गुणस्थान तक मात्र परिग्रह संज्ञा का सूक्ष्म रूप शेष।';
            if (count === 0) return 'चारों संज्ञाएँ क्षय हो चुकीं — आत्मा संज्ञा-मुक्त।';
            return '';

        case 20: // ध्यान
            if (count === 1 && g === 13) return 'सयोग केवली का तृतीय शुक्लध्यान — सूक्ष्मक्रियाप्रतिपाति, जब केवल सूक्ष्म काययोग शेष हो।';
            if (count === 1 && g === 14) return 'अयोग केवली का चौथा शुक्लध्यान — व्युपरतक्रियानिवृत्ति; सभी क्रियाएँ रुक चुकीं।';
            if (count === 4 && g === 7) return 'अप्रमत्तविरत में मात्र चारों धर्म्यध्यान — आर्त-रौद्र समाप्त, शुक्ल अभी प्रकट नहीं।';
            if (count === 9 && g === 3) return 'मिश्र गुणस्थान में आर्त 4 + रौद्र 4 + धर्म्य आज्ञाविचय 1 = 9 ध्यान।';
            return '';

        case 21: // आस्रव
            if (count === 0) return 'चारों प्रकार के आस्रव (मिथ्यात्व, अविरति, कषाय, योग) रुक चुके — परम संवर अवस्था।';
            return '';

        default:
            return '';
    }
}

// Set up the toggle UI
export function setupMatrixModeToggle() {
    const matrixContainer = document.querySelector('.matrix-container');
    if (!matrixContainer) return;
    if (document.querySelector('.matrix-mode-toggle')) return; // already set up

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;';
    wrap.innerHTML = `
        <div class="matrix-mode-toggle">
            <button class="matrix-mode-btn" data-mode="numbers" type="button">📊 संख्या</button>
            <button class="matrix-mode-btn" data-mode="explain" type="button">💡 समझाओ</button>
        </div>
        <span style="font-family: var(--font-hindi); font-size: var(--fs-sm); color: var(--text-muted);">
            खाने पर टैप करें →
        </span>
    `;
    matrixContainer.insertBefore(wrap, matrixContainer.firstChild);

    wrap.querySelectorAll('.matrix-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setMatrixMode(btn.dataset.mode);
        });
    });

    updateToggleButtons(getMatrixMode());
}
