// State Management
const state = {
    isConnected: false,
    isRecording: false,
    messages: [],
    // Audio test state
    micStream: null,
    audioContext: null,
    analyser: null,
    micTestActive: false,
    recordedAudio: null,
    isRecordingAudio: false,
    recordStartTime: null,
    recordTimerInterval: null,
    // Voice capture state
    voiceStream: null,
    voiceAudioContext: null,
    voiceAnalyser: null,
    voiceMediaRecorder: null,
    voiceChunks: [],
    voiceVisualizerInterval: null
};

// DOM Elements
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const visualizer = document.getElementById('visualizer');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const micBtn = document.getElementById('micBtn');
const messagesContainer = document.getElementById('messages');
const clearBtn = document.getElementById('clearBtn');
const settingsToggle = document.getElementById('settingsToggle');
const settingsContent = document.getElementById('settingsContent');
const typingIndicator = document.getElementById('typingIndicator');

// Audio Test Elements
const testToggle = document.getElementById('testToggle');
const testContent = document.getElementById('testContent');
const testMicBtn = document.getElementById('testMicBtn');
const stopMicBtn = document.getElementById('stopMicBtn');
const testAudioBtn = document.getElementById('testAudioBtn');
const recordBtn = document.getElementById('recordBtn');
const playRecordBtn = document.getElementById('playRecordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const micStatus = document.getElementById('micStatus');
const audioStatus = document.getElementById('audioStatus');
const recordStatus = document.getElementById('recordStatus');
const micLevelFill = document.getElementById('micLevelFill');
const micLevelText = document.getElementById('micLevelText');
const recordTimer = document.getElementById('recordTimer');
const timerText = document.getElementById('timerText');

// Event Listeners
startBtn.addEventListener('click', startConversation);
stopBtn.addEventListener('click', stopConversation);
micBtn.addEventListener('click', toggleMicrophone);
clearBtn.addEventListener('click', clearMessages);
settingsToggle.addEventListener('click', toggleSettings);

// Audio Test Event Listeners
testToggle.addEventListener('click', () => {
    testContent.classList.toggle('open');
    testToggle.classList.toggle('open');
});

testMicBtn.addEventListener('click', startMicTest);
stopMicBtn.addEventListener('click', stopMicTest);
testAudioBtn.addEventListener('click', testAudioPlayback);
recordBtn.addEventListener('click', startRecording);
playRecordBtn.addEventListener('click', playRecording);
stopRecordBtn.addEventListener('click', stopRecordingAudio);

// Start Conversation
async function startConversation() {
    try {
        updateStatus('connecting', 'Connecting...');
        startBtn.disabled = true;

        // Simulate connection (replace with actual WebSocket/API call)
        await new Promise(resolve => setTimeout(resolve, 1000));

        state.isConnected = true;
        updateStatus('connected', 'Connected');

        startBtn.disabled = true;
        stopBtn.disabled = false;
        visualizer.classList.add('active');

        // Remove placeholder
        const placeholder = messagesContainer.querySelector('.message-placeholder');
        if (placeholder) placeholder.remove();

        // Add initial message with typing indicator
        showTypingIndicator();
        await new Promise(resolve => setTimeout(resolve, 1500));
        hideTypingIndicator();
        addMessage('assistant', 'Hello! I\'m your Pipcat AI assistant. How can I help you today?');

    } catch (error) {
        console.error('Failed to start conversation:', error);
        updateStatus('ready', 'Connection failed');
        startBtn.disabled = false;
    }
}

// Stop Conversation
function stopConversation() {
    state.isConnected = false;
    
    // Stop voice capture if active
    if (state.isRecording) {
        stopVoiceCapture();
    }
    
    // Cleanup all resources
    cleanupVoiceCapture();

    updateStatus('ready', 'Ready');
    startBtn.disabled = false;
    stopBtn.disabled = true;
    visualizer.classList.remove('active');
    micBtn.classList.remove('active');
}

// Toggle Microphone - Capture User Voice
async function toggleMicrophone() {
    if (!state.isConnected) {
        alert('Please start a conversation first');
        return;
    }

    if (!state.isRecording) {
        await startVoiceCapture();
    } else {
        await stopVoiceCapture();
    }
}

// Start capturing user voice
async function startVoiceCapture() {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100
            } 
        });
        
        state.voiceStream = stream;
        state.isRecording = true;
        
        // Create audio context for visualization
        state.voiceAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.voiceAnalyser = state.voiceAudioContext.createAnalyser();
        const source = state.voiceAudioContext.createMediaStreamSource(stream);
        
        state.voiceAnalyser.fftSize = 256;
        state.voiceAnalyser.smoothingTimeConstant = 0.8;
        source.connect(state.voiceAnalyser);
        
        // Initialize MediaRecorder for audio capture
        state.voiceMediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
        });
        state.voiceChunks = [];
        
        state.voiceMediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                state.voiceChunks.push(event.data);
            }
        };
        
        state.voiceMediaRecorder.onstop = () => {
            // Process captured audio
            processCapturedAudio();
        };
        
        // Start recording
        state.voiceMediaRecorder.start();
        
        // Update UI
        micBtn.classList.add('active');
        updateStatus('connected', 'Listening...');
        visualizer.classList.add('active');
        
        // Start visualizer animation
        startVoiceVisualizer();
        
        console.log('Voice capture started');
        
    } catch (error) {
        console.error('Voice capture error:', error);
        state.isRecording = false;
        
        if (error.name === 'NotAllowedError') {
            alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
            alert('No microphone found. Please connect a microphone and try again.');
        } else {
            alert('Failed to access microphone: ' + error.message);
        }
    }
}

// Stop capturing user voice
async function stopVoiceCapture() {
    try {
        state.isRecording = false;
        
        // Stop MediaRecorder
        if (state.voiceMediaRecorder && state.voiceMediaRecorder.state !== 'inactive') {
            state.voiceMediaRecorder.stop();
        }
        
        // Stop visualizer
        stopVoiceVisualizer();
        
        // Update UI
        micBtn.classList.remove('active');
        updateStatus('connected', 'Processing...');
        visualizer.classList.remove('active');
        
        // Stop audio stream (will be stopped after processing)
        console.log('Voice capture stopped');
        
    } catch (error) {
        console.error('Error stopping voice capture:', error);
        cleanupVoiceCapture();
    }
}

// Process captured audio
function processCapturedAudio() {
    if (state.voiceChunks.length === 0) {
        console.warn('No audio data captured');
        cleanupVoiceCapture();
        updateStatus('connected', 'Connected');
        return;
    }
    
    // Create audio blob
    const audioBlob = new Blob(state.voiceChunks, { type: 'audio/webm;codecs=opus' });
    
    // Here you would send the audio to your backend/STT service
    // For now, we'll simulate processing
    console.log('Audio captured:', audioBlob.size, 'bytes');
    
    // Simulate sending to backend
    sendAudioToBackend(audioBlob);
    
    // Cleanup
    cleanupVoiceCapture();
}

// Send audio to backend for processing
async function sendAudioToBackend(audioBlob) {
    try {
        // Create FormData to send audio file
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-recording.webm');
        formData.append('format', 'webm');
        
        // Send to backend API
        const response = await fetch('/api/message', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to process audio');
        }
        
        const data = await response.json();
        
        // Display user message (transcribed text)
        if (data.transcript) {
            addMessage('user', data.transcript);
        } else {
            addMessage('user', '[Voice message]');
        }
        
        // Display AI response
        if (data.reply) {
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                addMessage('assistant', data.reply);
                updateStatus('connected', 'Connected');
            }, 1000);
        } else {
            updateStatus('connected', 'Connected');
        }
        
    } catch (error) {
        console.error('Error sending audio to backend:', error);
        
        // Fallback: show a message that audio was captured
        addMessage('user', '[Voice message captured]');
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addMessage('assistant', 'I received your voice message. Audio processing is being set up.');
            updateStatus('connected', 'Connected');
        }, 1000);
    }
}

// Start voice visualizer animation
function startVoiceVisualizer() {
    if (state.voiceVisualizerInterval) {
        clearInterval(state.voiceVisualizerInterval);
    }
    
    const waveBars = visualizer.querySelectorAll('.wave-bar');
    
    state.voiceVisualizerInterval = setInterval(() => {
        if (!state.isRecording || !state.voiceAnalyser) {
            stopVoiceVisualizer();
            return;
        }
        
        const dataArray = new Uint8Array(state.voiceAnalyser.frequencyBinCount);
        state.voiceAnalyser.getByteFrequencyData(dataArray);
        
        // Update wave bars based on audio levels
        waveBars.forEach((bar, index) => {
            const frequencyIndex = Math.floor((index / waveBars.length) * dataArray.length);
            const value = dataArray[frequencyIndex] || 0;
            const height = 20 + (value / 255) * 60; // Scale from 20px to 80px
            bar.style.height = height + 'px';
        });
    }, 100);
}

// Stop voice visualizer animation
function stopVoiceVisualizer() {
    if (state.voiceVisualizerInterval) {
        clearInterval(state.voiceVisualizerInterval);
        state.voiceVisualizerInterval = null;
    }
    
    // Reset wave bars
    const waveBars = visualizer.querySelectorAll('.wave-bar');
    waveBars.forEach(bar => {
        bar.style.height = '20px';
    });
}

// Cleanup voice capture resources
function cleanupVoiceCapture() {
    // Stop audio stream
    if (state.voiceStream) {
        state.voiceStream.getTracks().forEach(track => track.stop());
        state.voiceStream = null;
    }
    
    // Close audio context
    if (state.voiceAudioContext) {
        state.voiceAudioContext.close();
        state.voiceAudioContext = null;
        state.voiceAnalyser = null;
    }
    
    // Reset MediaRecorder
    state.voiceMediaRecorder = null;
    state.voiceChunks = [];
    
    // Stop visualizer
    stopVoiceVisualizer();
}

// Update Status Badge
function updateStatus(status, text) {
    statusBadge.className = 'status-indicator ' + status;
    statusText.textContent = text;
}

// Show/Hide Typing Indicator
function showTypingIndicator() {
    typingIndicator.classList.add('show');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.classList.remove('show');
}

// Add Message
function addMessage(role, content) {
    const message = {
        role,
        content,
        timestamp: new Date()
    };

    state.messages.push(message);

    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : 'AI';

    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.textContent = content;

    messageEl.appendChild(avatar);
    messageEl.appendChild(contentEl);

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Clear Messages
function clearMessages() {
    state.messages = [];
    messagesContainer.innerHTML = `
        <div class="message-placeholder">
            <div class="placeholder-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <h3 class="placeholder-title">Start Your Conversation</h3>
            <p class="placeholder-text">Click "Start" to begin chatting with your AI assistant</p>
        </div>
    `;
}

// Toggle Settings
function toggleSettings() {
    settingsContent.classList.toggle('open');
}

// ============================================
// Audio Test Functions
// ============================================

// Microphone Test
async function startMicTest() {
    try {
        micStatus.textContent = 'Requesting...';
        micStatus.className = 'test-status';
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.micStream = stream;
        state.micTestActive = true;
        
        // Create audio context and analyser
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.analyser = state.audioContext.createAnalyser();
        const source = state.audioContext.createMediaStreamSource(stream);
        
        state.analyser.fftSize = 256;
        state.analyser.smoothingTimeConstant = 0.8;
        source.connect(state.analyser);
        
        micStatus.textContent = 'Active';
        micStatus.className = 'test-status active';
        testMicBtn.style.display = 'none';
        stopMicBtn.style.display = 'flex';
        testMicBtn.classList.remove('active');
        stopMicBtn.classList.add('active');
        
        // Start monitoring audio levels
        monitorMicLevel();
        
    } catch (error) {
        console.error('Microphone access error:', error);
        micStatus.textContent = 'Error';
        micStatus.className = 'test-status error';
        
        if (error.name === 'NotAllowedError') {
            alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
            alert('No microphone found. Please connect a microphone and try again.');
        } else {
            alert('Failed to access microphone: ' + error.message);
        }
    }
}

function stopMicTest() {
    if (state.micStream) {
        state.micStream.getTracks().forEach(track => track.stop());
        state.micStream = null;
    }
    
    if (state.audioContext) {
        state.audioContext.close();
        state.audioContext = null;
        state.analyser = null;
    }
    
    state.micTestActive = false;
    micStatus.textContent = 'Stopped';
    micStatus.className = 'test-status';
    testMicBtn.style.display = 'flex';
    stopMicBtn.style.display = 'none';
    testMicBtn.classList.remove('active');
    stopMicBtn.classList.remove('active');
    
    // Reset level indicator
    micLevelFill.style.width = '0%';
    micLevelText.textContent = '0%';
}

function monitorMicLevel() {
    if (!state.micTestActive || !state.analyser) return;
    
    const dataArray = new Uint8Array(state.analyser.frequencyBinCount);
    state.analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const percentage = Math.min(100, Math.round((average / 255) * 100));
    
    // Update UI
    micLevelFill.style.width = percentage + '%';
    micLevelText.textContent = percentage + '%';
    
    // Continue monitoring
    requestAnimationFrame(monitorMicLevel);
}

// Audio Playback Test
function testAudioPlayback() {
    try {
        audioStatus.textContent = 'Testing...';
        audioStatus.className = 'test-status';
        testAudioBtn.disabled = true;
        
        // Create a test tone using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440; // A4 note
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        audioStatus.textContent = 'Success';
        audioStatus.className = 'test-status active';
        
        setTimeout(() => {
            audioStatus.textContent = 'Not tested';
            audioStatus.className = 'test-status';
            testAudioBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Audio playback error:', error);
        audioStatus.textContent = 'Error';
        audioStatus.className = 'test-status error';
        testAudioBtn.disabled = false;
        alert('Failed to test audio playback: ' + error.message);
    }
}

// Record & Playback
let mediaRecorder = null;
let recordedChunks = [];

async function startRecording() {
    try {
        recordStatus.textContent = 'Starting...';
        recordStatus.className = 'test-status';
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            state.recordedAudio = URL.createObjectURL(blob);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            
            recordStatus.textContent = 'Ready';
            recordStatus.className = 'test-status';
            recordBtn.style.display = 'none';
            playRecordBtn.style.display = 'flex';
            stopRecordBtn.style.display = 'none';
            recordTimer.style.display = 'none';
            
            if (state.recordTimerInterval) {
                clearInterval(state.recordTimerInterval);
                state.recordTimerInterval = null;
            }
        };
        
        mediaRecorder.start();
        state.isRecordingAudio = true;
        state.recordStartTime = Date.now();
        
        recordStatus.textContent = 'Recording';
        recordStatus.className = 'test-status active';
        recordBtn.style.display = 'none';
        stopRecordBtn.style.display = 'flex';
        recordTimer.style.display = 'block';
        
        // Start timer
        state.recordTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - state.recordStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            timerText.textContent = `${minutes}:${seconds}`;
        }, 100);
        
    } catch (error) {
        console.error('Recording error:', error);
        recordStatus.textContent = 'Error';
        recordStatus.className = 'test-status error';
        
        if (error.name === 'NotAllowedError') {
            alert('Microphone access denied. Please allow microphone access.');
        } else {
            alert('Failed to start recording: ' + error.message);
        }
    }
}

function stopRecordingAudio() {
    if (mediaRecorder && state.isRecordingAudio) {
        mediaRecorder.stop();
        state.isRecordingAudio = false;
    }
}

function playRecording() {
    if (!state.recordedAudio) {
        alert('No recording available. Please record audio first.');
        return;
    }
    
    const audio = new Audio(state.recordedAudio);
    audio.play();
    
    recordStatus.textContent = 'Playing';
    recordStatus.className = 'test-status active';
    playRecordBtn.disabled = true;
    
    audio.onended = () => {
        recordStatus.textContent = 'Ready';
        recordStatus.className = 'test-status';
        playRecordBtn.disabled = false;
    };
    
    audio.onerror = () => {
        recordStatus.textContent = 'Playback error';
        recordStatus.className = 'test-status error';
        playRecordBtn.disabled = false;
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pipcat Web Interface initialized');
    
    // Verify Audio Test section exists
    const audioTestSection = document.querySelector('.audio-test-section');
    if (audioTestSection) {
        console.log('Audio Test section found:', audioTestSection);
        audioTestSection.style.display = 'block'; // Force display
    } else {
        console.error('Audio Test section NOT found!');
    }
    
    // Add entrance animation
    const elements = document.querySelectorAll('.sidebar, .main-content');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
