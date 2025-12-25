// Database reference
const db = firebase.database().ref('messages');

// App state
let state = {
    messages: [],
    username: '',
    isUsernameSet: false,
    input: '',
    showSettings: false,
    ttsEnabled: true,
    selectedVoice: '',
    voices: [],
    speed: 1,
    pitch: 1,
    volume: 1,
    mediaPreview: null,
    mediaType: null,
    copiedId: null
};

// Speech queue
let speechQueue = [];
let isSpeaking = false;

// ============================================
// TTS Functions
// ============================================

function loadVoices() {
    state.voices = speechSynthesis.getVoices();
    if (state.voices.length > 0 && !state.selectedVoice) {
        state.selectedVoice = state.voices[0].name;
    }
    render();
}

function speak(text, user) {
    if (!state.ttsEnabled || !text.trim()) return;
    speechQueue.push({ text, user });
    if (!isSpeaking) processQueue();
}

function processQueue() {
    if (speechQueue.length === 0) {
        isSpeaking = false;
        return;
    }
    
    isSpeaking = true;
    const { text, user } = speechQueue.shift();
    
    const utterance = new SpeechSynthesisUtterance(`${user} says: ${text}`);
    const voice = state.voices.find(v => v.name === state.selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = state.speed;
    utterance.pitch = state.pitch;
    utterance.volume = state.volume;
    utterance.onend = () => processQueue();
    
    speechSynthesis.speak(utterance);
}

// ============================================
// Firebase Listener
// ============================================

db.limitToLast(50).on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const msgs = Object.entries(data).map(([key, val]) => ({
            id: key,
            ...val
        }));
        
        // Check for new messages to speak
        if (state.messages.length > 0 && msgs.length > state.messages.length) {
            const newMsg = msgs[msgs.length - 1];
            if (newMsg.username !== state.username && newMsg.text) {
                speak(newMsg.text, newMsg.username);
            }
        }
        
        state.messages = msgs;
        render();
        scrollToBottom();
    }
});

// ============================================
// Helper Functions
// ============================================

function scrollToBottom() {
    setTimeout(() => {
        const container = document.getElementById('messages-container');
        if (container) container.scrollTop = container.scrollHeight;
    }, 100);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// User Actions
// ============================================

function setUsername() {
    if (state.username.trim()) {
        state.isUsernameSet = true;
        render();
    }
}

function sendMessage() {
    if (!state.input.trim() && !state.mediaPreview) return;
    
    db.push({
        username: state.username,
        text: state.input.trim(),
        timestamp: Date.now(),
        media: state.mediaPreview,
        mediaType: state.mediaType
    });
    
    state.input = '';
    state.mediaPreview = null;
    state.mediaType = null;
    render();
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const result = event.target.result;
        if (file.type.startsWith('image/')) {
            state.mediaType = 'image';
            state.mediaPreview = result;
        } else if (file.type.startsWith('video/')) {
            state.mediaType = 'video';
            state.mediaPreview = result;
        }
        render();
    };
    reader.readAsDataURL(file);
}

function copyCode(code, id) {
    navigator.clipboard.writeText(code);
    state.copiedId = id;
    render();
    setTimeout(() => {
        state.copiedId = null;
        render();
    }, 2000);
}

function toggleSettings() {
    state.showSettings = !state.showSettings;
    render();
}

// ============================================
// Render Functions
// ============================================

function renderMessage(msg) {
    const isCode = msg.text?.startsWith('```') && msg.text?.endsWith('```');
    
    if (isCode) {
        const codeContent = msg.text.slice(3, -3).trim();
        const codeLines = codeContent.split('\n');
        const language = escapeHtml(codeLines[0]?.trim() || 'text');
        const code = escapeHtml(codeLines.slice(1).join('\n'));
        
        return `
            <div class="message">
                <div class="message-header">
                    <div class="message-avatar">${msg.username[0].toUpperCase()}</div>
                    <span class="message-username">${escapeHtml(msg.username)}</span>
                    <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                
                ${msg.media && msg.mediaType === 'image' ? 
                    `<img src="${msg.media}" alt="uploaded" class="message-media-image">` : ''}
                
                ${msg.media && msg.mediaType === 'video' ? 
                    `<video src="${msg.media}" controls class="message-media-video"></video>` : ''}
                
                <div class="code-block">
                    <div class="code-header">
                        <span class="code-language">${language}</span>
                        <button class="copy-button" onclick="copyCode(\`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${msg.id}')">
                            ${state.copiedId === msg.id ? '✓ Copied!' : '📋 Copy'}
                        </button>
                    </div>
                    <div class="code-content">
                        <pre><code>${code}</code></pre>
                    </div>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="message">
            <div class="message-header">
                <div class="message-avatar">${msg.username[0].toUpperCase()}</div>
                <span class="message-username">${escapeHtml(msg.username)}</span>
                <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            
            ${msg.media && msg.mediaType === 'image' ? 
                `<img src="${msg.media}" alt="uploaded" class="message-media-image">` : ''}
            
            ${msg.media && msg.mediaType === 'video' ? 
                `<video src="${msg.media}" controls class="message-media-video"></video>` : ''}
            
            ${msg.text ? `<p class="message-text">${escapeHtml(msg.text)}</p>` : ''}
        </div>
    `;
}

function renderLoginScreen() {
    return `
        <div class="login-screen">
            <div class="login-card">
                <h1 class="login-title">Welcome to TTS Chat</h1>
                <input
                    id="username-input"
                    type="text"
                    placeholder="Enter your username"
                    class="login-input"
                />
                <button onclick="setUsername()" class="login-button">
                    Join Chat
                </button>
            </div>
        </div>
    `;
}

function renderChatScreen() {
    return `
        <div class="app-container">
            <!-- Header -->
            <div class="header">
                <div class="header-content">
                    <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <h1 class="header-title">TTS Chat</h1>
                </div>
                <button class="settings-button" onclick="toggleSettings()">
                    <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 1v6m0 6v6"></path>
                        <path d="M21 12h-6m-6 0H3"></path>
                    </svg>
                </button>
            </div>

            <!-- Settings -->
            ${state.showSettings ? `
                <div class="settings-panel">
                    <h3 class="settings-title">TTS Settings</h3>
                    <div class="settings-grid">
                        <div class="setting-group">
                            <label class="setting-label">Voice</label>
                            <select id="voice-select" class="setting-select">
                                ${state.voices.map(v => 
                                    `<option value="${v.name}" ${v.name === state.selectedVoice ? 'selected' : ''}>
                                        ${v.name} (${v.lang})
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Speed: ${state.speed.toFixed(1)}x</label>
                            <input id="speed-slider" type="range" min="0.5" max="2" step="0.1" 
                                   value="${state.speed}" class="setting-range">
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Pitch: ${state.pitch.toFixed(1)}</label>
                            <input id="pitch-slider" type="range" min="0.5" max="2" step="0.1" 
                                   value="${state.pitch}" class="setting-range">
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Volume: ${(state.volume * 100).toFixed(0)}%</label>
                            <input id="volume-slider" type="range" min="0" max="1" step="0.1" 
                                   value="${state.volume}" class="setting-range">
                        </div>
                    </div>
                    <div class="setting-checkbox-wrapper">
                        <input type="checkbox" id="tts-enabled" class="setting-checkbox" 
                               ${state.ttsEnabled ? 'checked' : ''}>
                        <label for="tts-enabled" class="setting-checkbox-label">Enable Text-to-Speech</label>
                    </div>
                </div>
            ` : ''}

            <!-- Messages -->
            <div id="messages-container" class="messages-container">
                <div class="messages-wrapper">
                    ${state.messages.map(msg => renderMessage(msg)).join('')}
                </div>
            </div>

            <!-- Media Preview -->
            ${state.mediaPreview ? `
                <div class="media-preview">
                    <div class="media-preview-content">
                        ${state.mediaType === 'image' ? 
                            `<img src="${state.mediaPreview}" alt="preview" class="media-preview-image">` : ''}
                        ${state.mediaType === 'video' ? 
                            `<video src="${state.mediaPreview}" class="media-preview-video"></video>` : ''}
                        <button class="media-remove-button" onclick="state.mediaPreview = null; state.mediaType = null; render();">
                            Remove
                        </button>
                    </div>
                </div>
            ` : ''}

            <!-- Input -->
            <div class="input-area">
                <div class="input-wrapper">
                    <input type="file" id="file-input" class="file-input" accept="image/*,video/*">
                    
                    <button class="upload-button" onclick="document.getElementById('file-input').click();" title="Upload media">
                        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </button>

                    <input
                        id="message-input"
                        type="text"
                        placeholder="Type a message... (Use \`\`\`language for code blocks)"
                        class="message-input"
                    />

                    <button class="send-button" onclick="sendMessage()">
                        <svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function render() {
    const app = document.getElementById('app');
    
    if (!state.isUsernameSet) {
        app.innerHTML = renderLoginScreen();
        
        const usernameInput = document.getElementById('username-input');
        usernameInput.focus();
        usernameInput.oninput = (e) => {
            state.username = e.target.value;
        };
        usernameInput.onkeypress = (e) => {
            if (e.key === 'Enter') setUsername();
        };
        return;
    }

    app.innerHTML = renderChatScreen();

    // Attach event listeners
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.value = state.input;
        messageInput.oninput = (e) => {
            state.input = e.target.value;
        };
        messageInput.onkeypress = (e) => {
            if (e.key === 'Enter') sendMessage();
        };
    }

    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.onchange = handleFileUpload;
    }

    // Settings event listeners
    if (state.showSettings) {
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            voiceSelect.onchange = (e) => {
                state.selectedVoice = e.target.value;
            };
        }

        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            speedSlider.oninput = (e) => {
                state.speed = parseFloat(e.target.value);
                render();
            };
        }

        const pitchSlider = document.getElementById('pitch-slider');
        if (pitchSlider) {
            pitchSlider.oninput = (e) => {
                state.pitch = parseFloat(e.target.value);
                render();
            };
        }

        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.oninput = (e) => {
                state.volume = parseFloat(e.target.value);
                render();
            };
        }

        const ttsCheckbox = document.getElementById('tts-enabled');
        if (ttsCheckbox) {
            ttsCheckbox.onchange = (e) => {
                state.ttsEnabled = e.target.checked;
            };
        }
    }
}

// ============================================
// Initialize
// ============================================

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();
render();