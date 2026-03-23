// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const tipBtn = document.getElementById('tipBtn');
const languageSelect = document.getElementById('language');

// Initialize
let isLoading = false;

// Add message to chat
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(text);
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// Format message text (convert line breaks to <br>)
function formatMessage(text) {
    return text.replace(/\n/g, '<br>');
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    
    typingDiv.appendChild(indicator);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Send message to API
async function sendMessage(message, type = 'response') {
    if (isLoading) return;
    
    if (!message.trim()) {
        alert('Please enter a message');
        return;
    }
    
    isLoading = true;
    sendBtn.disabled = true;
    tipBtn.disabled = true;
    userInput.disabled = true;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                language: languageSelect.value,
                type: type
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get response');
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response
        let responseText = '';
        if (type === 'tip') {
            responseText = `💡 <strong>Health Tip:</strong><br>${data.response}`;
        } else {
            responseText = `💊 <strong>My Suggestion:</strong><br>${data.response}`;
        }
        
        addMessage(responseText, false);
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessage('❌ Sorry, I encountered an error. Please try again or check if the server is running.', false);
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        tipBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// Event Listeners
sendBtn.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
        sendMessage(message, 'response');
    }
});

tipBtn.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
        sendMessage(message, 'tip');
    }
});

// Allow Enter key to send message
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            sendMessage(message, 'response');
        }
    }
});

// Focus input on load
window.addEventListener('load', () => {
    userInput.focus();
});

// Check API connection on load
async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/languages`);
        if (!response.ok) {
            throw new Error('API not available');
        }
    } catch (error) {
        addMessage('⚠️ <strong>Warning:</strong> Unable to connect to the server. Please make sure the Flask backend is running on port 5000.', false);
    }
}

// Check connection when page loads
checkConnection();

