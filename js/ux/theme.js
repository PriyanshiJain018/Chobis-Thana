// UX module — language toggle, large view, night mode, and आज का विशेष card.
// Uses localStorage so user preferences persist across sessions.

import { definitionsDatabase } from '../data/definitions.js';
import { gunasthansData } from '../data/gunasthans.js';

// ---------- Storage keys ----------
const KEYS = {
    lang: 'chobis-lang',           // 'hi' | 'en'
    largeView: 'chobis-large',      // '1' | '0'
    nightMode: 'chobis-night',      // '1' | '0'
    vishesh: 'chobis-vishesh-idx'   // last shown index (round-robin)
};

// ---------- Tab labels (Hindi-first by default, English as toggle) ----------
const TAB_LABELS = {
    hi: { overview: 'सारांश', matrix: 'ठाणा तालिका', transitions: 'आरोहण-अवरोहण', definitions: 'शब्दकोश' },
    en: { overview: 'Overview', matrix: 'Matrix', transitions: 'Transitions', definitions: 'Definitions' }
};

const SECTION_TITLES = {
    hi: {
        matrix: 'चौबीस ठाणा × चौदह गुणस्थान — पूर्ण तालिका',
        matrixDesc: 'किसी भी खाने पर टैप करें — उपस्थित और अनुपस्थित विवरण देखें। शब्दों पर टैप कर परिभाषा भी देख सकते हैं।',
        transitions: 'गुणस्थान आरोहण एवं अवरोहण',
        transitionsDesc: 'विभिन्न गुणस्थानों में आरोहण तथा अवरोहण के नियम।',
        definitions: 'विस्तृत शब्दकोश',
        definitionsDesc: 'जैन पारिभाषिक शब्दों का विवरण। खोज करें या श्रेणी अनुसार देखें।'
    },
    en: {
        matrix: '24 Thana × 14 Gunasthan — Complete Matrix',
        matrixDesc: 'Click any cell to see detailed breakdown of present and absent characteristics. Click on individual terms to see their definitions.',
        transitions: 'Spiritual Progression Paths',
        transitionsDesc: 'Explore possible transitions between Gunasthanas. Each stage has specific paths forward or backward.',
        definitions: 'Comprehensive Definitions',
        definitionsDesc: 'Detailed explanations of all Jain philosophical terms and concepts. Search or browse by category.'
    }
};

// ---------- Read & apply preferences ----------
export function applyStoredPreferences() {
    const lang = localStorage.getItem(KEYS.lang) || 'hi';     // default Hindi
    const large = localStorage.getItem(KEYS.largeView) === '1';
    const night = localStorage.getItem(KEYS.nightMode) === '1';

    setLanguage(lang, false);
    setLargeView(large, false);
    setNightMode(night, false);
}

// ---------- Language toggle ----------
function setLanguage(lang, persist = true) {
    document.documentElement.setAttribute('data-lang', lang);
    if (persist) localStorage.setItem(KEYS.lang, lang);

    // Update tab labels
    const labels = TAB_LABELS[lang] || TAB_LABELS.hi;
    document.querySelectorAll('.tab').forEach(tab => {
        const k = tab.dataset.tab;
        if (labels[k]) {
            tab.textContent = labels[k];
            tab.classList.toggle('hindi-label', lang === 'hi');
        }
    });

    // Update info section titles/descriptions per tab
    const titles = SECTION_TITLES[lang] || SECTION_TITLES.hi;
    setSectionText('matrix-content', titles.matrix, titles.matrixDesc);
    setSectionText('transitions-content', titles.transitions, titles.transitionsDesc);
    setSectionText('definitions-content', titles.definitions, titles.definitionsDesc);

    // Update toggle button state
    const btn = document.getElementById('lang-toggle');
    if (btn) {
        btn.textContent = lang === 'hi' ? '🔤 EN' : '🔤 हिं';
        btn.title = lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें';
    }
}

function setSectionText(contentId, title, desc) {
    const root = document.getElementById(contentId);
    if (!root) return;
    const t = root.querySelector('.info-title');
    const d = root.querySelector('.info-description');
    if (t) t.textContent = title;
    if (d) d.textContent = desc;
}

// ---------- Large view toggle ----------
function setLargeView(on, persist = true) {
    document.body.classList.toggle('large-view', on);
    if (persist) localStorage.setItem(KEYS.largeView, on ? '1' : '0');
    const btn = document.getElementById('large-toggle');
    if (btn) btn.classList.toggle('active', on);
}

// ---------- Night mode toggle ----------
function setNightMode(on, persist = true) {
    document.body.classList.toggle('night-mode', on);
    if (persist) localStorage.setItem(KEYS.nightMode, on ? '1' : '0');
    const btn = document.getElementById('night-toggle');
    if (btn) {
        btn.textContent = on ? '☀️ दिन' : '🌙 रात्रि';
        btn.classList.toggle('active', on);
    }
    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', on ? '#1a1a3e' : '#FF6B00');
}

// ---------- Wire toggle buttons ----------
export function setupHeaderToggles() {
    // Insert a tools row into the header
    const header = document.querySelector('.app-header');
    if (!header) return;
    if (document.querySelector('.app-header-tools')) return; // already inserted

    const tools = document.createElement('div');
    tools.className = 'app-header-tools';
    tools.innerHTML = `
        <button id="lang-toggle"  class="tool-btn" type="button" title="भाषा बदलें">🔤 EN</button>
        <button id="large-toggle" class="tool-btn" type="button" title="बड़ा दृश्य">🔍 बड़ा</button>
        <button id="night-toggle" class="tool-btn" type="button" title="रात्रि स्वाध्याय">🌙 रात्रि</button>
    `;
    header.appendChild(tools);

    document.getElementById('lang-toggle').addEventListener('click', () => {
        const cur = localStorage.getItem(KEYS.lang) || 'hi';
        setLanguage(cur === 'hi' ? 'en' : 'hi');
    });
    document.getElementById('large-toggle').addEventListener('click', () => {
        const cur = localStorage.getItem(KEYS.largeView) === '1';
        setLargeView(!cur);
    });
    document.getElementById('night-toggle').addEventListener('click', () => {
        const cur = localStorage.getItem(KEYS.nightMode) === '1';
        setNightMode(!cur);
    });
}

// ---------- आज का विशेष card ----------
// Pulls vishesh entries from the data: definitions database (kashaya, shukladhyana),
// gunasthansData (descriptionHi extras), and a few hand-curated facts from the source book.
function collectVisheshFacts() {
    const facts = [];

    // From kashaya definition's vishesh
    try {
        const kashaya = definitionsDatabase['कषाय-मार्गणा']?.definitions?.['कषाय'];
        if (kashaya?.vishesh?.text) {
            facts.push({
                text: kashaya.vishesh.text,
                source: kashaya.vishesh.sourceRef || 'कषाय परिभाषा'
            });
        }
        if (kashaya?.additionalNotes) {
            facts.push({
                text: kashaya.additionalNotes,
                source: 'कषाय — कैस्केड नियम'
            });
        }
    } catch (e) { /* skip */ }

    // From shukladhyana
    try {
        const shukla = definitionsDatabase['ध्यान']?.definitions?.['ध्यान']?.subtypes?.['शुक्लध्यान'];
        if (shukla?.vishesh?.text) {
            facts.push({
                text: shukla.vishesh.text + ' निम्न में नहीं: ' + (shukla.vishesh.exclusions || []).join(', ') + '।',
                source: shukla.vishesh.sourceRef || 'शुक्लध्यान — विशेष'
            });
        }
    } catch (e) { /* skip */ }

    // From gunasthan descriptions — pick out the doctrinally-interesting ones
    try {
        for (let i = 1; i <= 14; i++) {
            const g = gunasthansData[i];
            if (g?.descriptionHi) {
                facts.push({
                    text: g.descriptionHi,
                    source: `पृष्ठ 19-21 — ${g.nameHi} गुणस्थान`
                });
            }
        }
    } catch (e) { /* skip */ }

    // Hand-curated key insights
    facts.push(
        { text: 'मिश्र गुणस्थान में मरण नहीं होता है। अतः कार्माण काययोग और औदारिक मिश्र काययोग नहीं बनेगा।', source: 'पृष्ठ 31, विशेष 1' },
        { text: 'सासादन गुणस्थान का काल अत्यल्प है — जघन्य 1 समय और उत्कृष्ट 6 आवली। फिर जीव या तो मिथ्यात्व में आता है या ऊपर बढ़ता है।', source: 'पृष्ठ 19, सासादन गुणस्थान' },
        { text: 'ग्यारहवें (उपशांत मोह) गुणस्थान से सीधे बारहवें या तेरहवें में नहीं जा सकते। बारहवें-तेरहवें केवल क्षपक श्रेणी से प्राप्त होते हैं।', source: 'पृष्ठ 19, उपशांत मोह' },
        { text: 'अयोग केवली का काल मात्र 5 ह्रस्व अक्षर (अ-इ-उ-ऋ-ऌ) बोलने जितना है। उपान्त्य समय में 72 + अन्तिम समय में 13 कर्म-प्रकृतियों का क्षय होकर मोक्ष।', source: 'पृष्ठ 21, अयोग केवली' },
        { text: 'दसवें (सूक्ष्मसाम्पराय) गुणस्थान में केवल 1 कषाय शेष रहती है — संज्वलन लोभ का अत्यन्त सूक्ष्म उदय। शेष 24 कषायों का क्षय/उपशम हो चुका है।', source: 'पृष्ठ 20, सूक्ष्मसाम्पराय' },
        { text: 'नारकी जीव दूसरों के दुःख दूर हों ऐसे भाव नहीं कर सकते। अतः उनमें धर्म्य ध्यान का अपायविचय भेद नहीं होता — केवल आज्ञाविचय 1 ही।', source: 'पृष्ठ 35-36' },
        { text: 'सयोग केवली में चार घातिया कर्मों के क्षय से अनन्त ज्ञान, अनन्त दर्शन, अनन्त सुख, अनन्त वीर्य प्रकट हो जाते हैं।', source: 'पृष्ठ 21, सयोग केवली' }
    );

    // Filter out very short or duplicate
    const seen = new Set();
    return facts
        .filter(f => f.text && f.text.length > 30)
        .filter(f => { if (seen.has(f.text)) return false; seen.add(f.text); return true; });
}

export function renderAajKaVishesh() {
    const overview = document.getElementById('overview-content');
    if (!overview) return;
    const existing = overview.querySelector('.aaj-ka-vishesh');
    if (existing) existing.remove();

    const facts = collectVisheshFacts();
    if (!facts.length) return;

    // Round-robin: pick the next index after the last shown
    const lastIdx = parseInt(localStorage.getItem(KEYS.vishesh) || '-1', 10);
    const newIdx = (lastIdx + 1) % facts.length;
    const fact = facts[newIdx];
    localStorage.setItem(KEYS.vishesh, String(newIdx));

    const card = document.createElement('div');
    card.className = 'aaj-ka-vishesh';
    card.innerHTML = `
        <div class="aaj-ka-vishesh-header">
            <div class="aaj-ka-vishesh-title">॥ आज का विशेष ॥</div>
        </div>
        <div class="aaj-ka-vishesh-text"></div>
        <div class="aaj-ka-vishesh-source"></div>
        <div class="aaj-ka-vishesh-actions">
            <button class="aaj-ka-vishesh-btn" id="vishesh-next" type="button">🔄 अगला विशेष</button>
            <button class="aaj-ka-vishesh-btn whatsapp" id="vishesh-share" type="button">📤 WhatsApp शेयर</button>
        </div>
    `;
    card.querySelector('.aaj-ka-vishesh-text').textContent = fact.text;
    card.querySelector('.aaj-ka-vishesh-source').textContent = '— स्रोत: ' + fact.source;

    // Insert at top of overview
    const firstChild = overview.firstChild;
    overview.insertBefore(card, firstChild);

    // Wire buttons
    card.querySelector('#vishesh-next').addEventListener('click', () => renderAajKaVishesh());
    card.querySelector('#vishesh-share').addEventListener('click', () => {
        const txt = `॥ आज का विशेष ॥\n\n${fact.text}\n\n— ${fact.source}\n\n— चौबीस ठाणा चर्चा (मुनि श्री प्रशान्तसागरजी महाराज)`;
        const url = 'https://wa.me/?text=' + encodeURIComponent(txt);
        window.open(url, '_blank');
    });
}

// ---------- Init ----------
export function initUX() {
    setupHeaderToggles();
    applyStoredPreferences();
    // Render the vishesh card after a tiny delay so other components have mounted
    requestAnimationFrame(() => renderAajKaVishesh());
}
