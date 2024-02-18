const ws = new WebSocket('ws://127.0.0.1:1337');
const chatbot = document.getElementById('chatbot');
const messageInput = document.getElementById('user-input');
const summarizedTitle = document.getElementById('summarized-title');
const submitButton = document.getElementById('submit-button');
let FirstAnswerChunk = true;
let messageP = null;
let FirstSummaryChunk = true;
let summaryP = null;

function sendMessage() {
    const messageInput = document.getElementById('user-input');
    const userMessage = document.createElement('p');
    userMessage.className = 'user';
    userMessage.textContent = messageInput.value;
    chatbot.appendChild(userMessage);
    ws.send(messageInput.value);
    messageInput.value = '';
}

submitButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        console.log("blalvbbbbableblab");
        event.preventDefault();
        sendMessage();
    }
});

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'message') {
        if (FirstAnswerChunk) {
            messageP = document.createElement('p');
            messageP.className = 'assistant';
            chatbot.appendChild(messageP);
            FirstAnswerChunk = false;
        }
        messageP.textContent += data.content;
    } else if (data.type === 'summary') {
        if (FirstSummaryChunk) {
            const icon = document.createElement('i');
            summaryP = document.createElement('p');
            icon.className = 'fas fa-chevron-down';
            summarizedTitle.appendChild(icon);
            summarizedTitle.appendChild(summaryP);
            FirstSummaryChunk = false;
        }
        summaryP.textContent += data.content;
    }
};
