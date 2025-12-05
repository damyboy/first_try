// Storage key
const STORAGE_KEY = 'callTranscripts';

// Common stop words to filter out
const STOP_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
    'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
    'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
    'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
    'most', 'us', 'is', 'are', 'was', 'were', 'been', 'being', 'has', 'had',
    'does', 'did', 'doing', 'said', 'says', 'got', 'getting', 'went', 'going',
    'came', 'coming', 'made', 'making', 'took', 'taking', 'saw', 'seeing'
]);

// Theme management
const THEME_STORAGE_KEY = 'preferredTheme';

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();

    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('call-date').value = today;

    // Load and display existing calls
    loadCalls();
    updateInsights();

    // Event listeners
    document.getElementById('save-btn').addEventListener('click', saveTranscript);
    document.getElementById('transcript').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            saveTranscript();
        }
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });
});

// Save transcript
function saveTranscript() {
    const date = document.getElementById('call-date').value;
    const company = document.getElementById('company-name').value.trim();
    const transcript = document.getElementById('transcript').value.trim();

    if (!date || !company || !transcript) {
        showMessage('Please fill in date, company, and transcript', false);
        return;
    }

    // Get existing calls
    const calls = getCalls();

    // Add new call
    calls.push({
        date: date,
        company: company,
        transcript: transcript
    });

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));

    // Clear form
    document.getElementById('company-name').value = '';
    document.getElementById('transcript').value = '';

    // Show success message
    showMessage('Transcript saved successfully!', true);

    // Update display
    loadCalls();
    updateInsights();
}

// Get all calls from localStorage
function getCalls() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Load and display calls
function loadCalls() {
    const calls = getCalls();
    const callsList = document.getElementById('calls-list');

    if (calls.length === 0) {
        callsList.innerHTML = '<p class="empty-state">No calls saved yet. Add your first transcript above!</p>';
        return;
    }

    // Group calls by company (handle backward compatibility for calls without company field)
    const callsByCompany = {};
    calls.forEach(call => {
        const company = (call.company && call.company.trim()) || 'Unknown Company';
        if (!callsByCompany[company]) {
            callsByCompany[company] = [];
        }
        callsByCompany[company].push(call);
    });

    // Sort companies alphabetically
    const sortedCompanies = Object.keys(callsByCompany).sort();

    // Build HTML with grouped calls
    let html = '';
    sortedCompanies.forEach(company => {
        const companyCalls = callsByCompany[company];
        // Sort calls by date (newest first) within each company
        companyCalls.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        html += `
            <div class="company-group">
                <div class="company-header">
                    <h3 class="company-name">${escapeHtml(company)}</h3>
                    <span class="company-count">${companyCalls.length} call${companyCalls.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="company-calls">
        `;

        companyCalls.forEach((call) => {
            // Find the index in the sorted array (by company then date)
            const allCalls = getCalls();
            allCalls.sort((a, b) => {
                if (a.company !== b.company) {
                    return (a.company || 'Unknown Company').localeCompare(b.company || 'Unknown Company');
                }
                return new Date(b.date) - new Date(a.date);
            });
            const originalIndex = allCalls.findIndex(c => 
                c.date === call.date && 
                c.company === call.company && 
                c.transcript === call.transcript
            );

            const dateObj = new Date(call.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const preview = call.transcript.substring(0, 100) + (call.transcript.length > 100 ? '...' : '');

            html += `
                <div class="call-card" onclick="showFullTranscript(${originalIndex})">
                    <div class="call-date">${formattedDate}</div>
                    <div class="call-preview">${escapeHtml(preview)}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    callsList.innerHTML = html;
}

// Show full transcript in modal
function showFullTranscript(index) {
    const calls = getCalls();
    // Sort same way as display
    calls.sort((a, b) => {
        // First sort by company, then by date
        if (a.company !== b.company) {
            return (a.company || 'Unknown Company').localeCompare(b.company || 'Unknown Company');
        }
        return new Date(b.date) - new Date(a.date);
    });
    
    const call = calls[index];
    const dateObj = new Date(call.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const modalDate = document.getElementById('modal-date');
    modalDate.innerHTML = `
        <div>${formattedDate}</div>
        <div style="font-size: 14px; color: #787774; margin-top: 4px; font-weight: normal;">${escapeHtml(call.company || 'Unknown Company')}</div>
    `;
    document.getElementById('modal-transcript').textContent = call.transcript;
    document.getElementById('modal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Update insights
function updateInsights() {
    const calls = getCalls();

    // Update total calls
    document.getElementById('total-calls').textContent = calls.length;

    // Extract and display keywords
    if (calls.length === 0) {
        document.getElementById('keywords-list').textContent = 'No calls yet';
        return;
    }

    const keywords = extractKeywords(calls);
    const keywordsList = document.getElementById('keywords-list');
    
    if (keywords.length === 0) {
        keywordsList.textContent = 'No keywords found';
        return;
    }

    keywordsList.innerHTML = keywords.map(keyword => 
        `<span class="keyword-tag">${escapeHtml(keyword.word)} (${keyword.count})</span>`
    ).join('');
}

// Extract top keywords from all transcripts
function extractKeywords(calls) {
    const wordCount = {};

    // Combine all transcripts
    const allText = calls.map(call => call.transcript.toLowerCase()).join(' ');

    // Extract words (simple word boundary split)
    const words = allText.match(/\b[a-z]{3,}\b/g) || [];

    // Count words (excluding stop words)
    words.forEach(word => {
        if (!STOP_WORDS.has(word)) {
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
    });

    // Convert to array and sort by count
    const keywords = Object.entries(wordCount)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10

    return keywords;
}

// Show message
function showMessage(message, isSuccess) {
    const messageEl = document.getElementById('save-message');
    messageEl.textContent = message;
    messageEl.className = isSuccess ? 'save-message success' : 'save-message';
    
    setTimeout(() => {
        messageEl.className = 'save-message';
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

