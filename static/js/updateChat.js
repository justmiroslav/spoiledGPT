const ws = new WebSocket('ws://127.0.0.1:1337');
import chatDatabaseController from '/controllers/chatDatabaseController';
import messageController from '/controllers/messageController';
const chatContent = document.getElementById('chat-content');
const messageInput = document.getElementById('user-input');
const summarizedTitle = document.getElementById('summarized-title');
const submitButton = document.getElementById('submit-button');
const summary = document.getElementById('summary');
import chatController from '/controllers/chatController';
const chatId = chatDatabaseController.getChatIdByTitle("Untitled chat");
let context = chatController.context;
let messageCounter = messageController.returnMessagesCount(chatId);
let FirstAnswerChunk = true;
let messageP = null;
let responsesCounter = 0;
let summaryCounter = 0;
let FirstSummaryChunk = true;
let summaryP = null;

window.onload = function() {
    const modelSelector = document.getElementById('model-selector');
    const modelDescription = document.getElementById('model-description');
    const messages = messageController.getMessages(chatId);
    messages.forEach(message => {
        const editIcon = document.getElementById(message._id);
        const copyIcon = document.getElementById(message._id);
        const retryIcon = document.getElementById(message._id);
        editIcon.addEventListener('click', function() {
            const messageP = document.getElementById(editIcon.id);
            const editInput = document.createElement('input');
            const editButton = document.createElement('button');
            const cancelButton = document.createElement('button');
            editInput.value = messageP.textContent;
            editButton.textContent = 'Edit';
            cancelButton.textContent = 'Cancel';
            chatContent.appendChild(editInput);
            chatContent.appendChild(editButton);
            chatContent.appendChild(cancelButton);
            editButton.addEventListener('click', function() {
                messageController.deleteSelectedMessage(chatId, message.count);
                messageController.updateMessage(message._id, editInput.value);
                messageCounter = message.count;
                const index = context.findIndex(item => item["content"] === messageP.textContent);
                context.splice(index);
                sendToWebSocket(editInput.value, modelSelector.value);
            });
            cancelButton.addEventListener('click', function() {
                window.location.href = `/${chatId}`;
            });
        });
        copyIcon.addEventListener('click', function() {
            const messageP = document.getElementById(copyIcon.id);
            navigator.clipboard.writeText(messageP.textContent);
        });
        retryIcon.addEventListener('click', function() {
            const messageDb = messageController.getMessage(chatId, message.count - 1);
            const messageP = messageDb.message;
            messageController.deleteSelectedMessage(chatId, message.count - 1);
            messageCounter = message.count - 1;
            const index = context.findIndex(item => item["content"] === messageP);
            context.splice(index);
            sendToWebSocket(messageP, modelSelector.value);
        });
    });

    modelSelector.addEventListener('change', function() {
        if (modelSelector.value === 'libra') {
            modelDescription.textContent = 'AI assistant focused on providing fast and helpful responses';
        } else if (modelSelector.value === 'sparky') {
            modelDescription.textContent = 'AI assistant created for open-ended conversations on any topic';
        }
    });

    if (modelSelector.value === 'libra') {
        modelDescription.textContent = 'AI assistant focused on providing fast and helpful responses';
    } else if (modelSelector.value === 'sparky') {
        modelDescription.textContent = 'AI assistant created for open-ended conversations on any topic';
    }
}

function sendToWebSocket(message, model) {
    ws.send(JSON.stringify({
        message: message,
        model: model
    }));
}

function sendMessage() {
    const messageInput = document.getElementById('user-input');
    const modelSelector = document.getElementById('model-selector');
    const userMessage = document.createElement('p');
    const editIcon = document.createElement('i');
    const editText = document.createTextNode(' edit');
    userMessage.className = 'user';
    userMessage.textContent = messageInput.value;
    editIcon.className = 'fas fa-pencil-alt';
    userMessage.appendChild(editIcon);
    userMessage.appendChild(editText);
    chatContent.appendChild(userMessage);
    messageCounter++;
    const message = messageController.createMessage(chatId, userMessage.className, userMessage.textContent, messageCounter);
    userMessage.id = message._id;
    editIcon.id = message._id;
    sendToWebSocket(messageInput.value, modelSelector.value);
    messageInput.value = '';
}

submitButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'message') {
        let messageLength = data.length;
        if (FirstAnswerChunk) {
            messageP = document.createElement('p');
            messageP.className = 'assistant';
            chatContent.appendChild(messageP);
            FirstAnswerChunk = false;
        }
        messageP.textContent += data.content;
        responsesCounter++;
        if (responsesCounter === messageLength) {
            const copyIcon = document.createElement('i');
            const copyText = document.createTextNode(' copy');
            const retryIcon = document.createElement('i');
            const retryText = document.createTextNode(' retry');
            copyIcon.className = 'fas fa-copy';
            retryIcon.className = 'fas fa-redo';
            messageP.appendChild(copyIcon);
            messageP.appendChild(copyText);
            messageP.appendChild(retryIcon);
            messageP.appendChild(retryText);
            messageCounter++;
            const message = messageController.createMessage(chatId, messageP.className, messageP.textContent, messageCounter);
            messageP.id = message._id;
            copyIcon.id = message._id;
            retryIcon.id = message._id;
            messageP = null;
            responsesCounter = 0;
            FirstAnswerChunk = true;
        }
    } else if (data.type === 'summary') {
        let summaryLength = data.length;
        if (FirstSummaryChunk) {
            const icon = document.createElement('i');
            summaryP = document.createElement('p');
            icon.className = 'fas fa-chevron-down';
            summarizedTitle.appendChild(icon);
            summarizedTitle.appendChild(summaryP);
            FirstSummaryChunk = false;
        }
        summaryP.textContent += data.content;
        summaryCounter++;
        if (summaryCounter === summaryLength) {
            chatDatabaseController.updateChat(chatId, summaryP.textContent);
            summaryP = null;
            summaryCounter = 0;
            FirstSummaryChunk = true;
        }
    }
};

summary.addEventListener('click', function() {
    summary.icon.className = 'fas fa-chevron-up';
    const renameOption = document.createElement('button');
    renameOption.textContent = 'Rename chat';
    const deleteOption = document.createElement('button');
    deleteOption.textContent = 'Delete chat';
    document.body.appendChild(renameOption);
    document.body.appendChild(deleteOption);
    renameOption.addEventListener('click', function() {
        const renamePanel = document.createElement('div');
        const renameInput = document.createElement('input');
        renameInput.value = summary.title;
        const renameButton = document.createElement('button');
        renameButton.textContent = 'Rename';
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        renamePanel.appendChild(renameInput);
        renamePanel.appendChild(renameButton);
        renamePanel.appendChild(cancelButton);
        document.body.appendChild(renamePanel);
        renameButton.addEventListener('click', function() {
            chatDatabaseController.updateChat(chatId, renameInput.value).then(() => {window.location.href = `/${chatId}`;});
        });
        cancelButton.addEventListener('click', function() {
            window.location.href = `/${chatId}`;
        });
    });
    deleteOption.addEventListener('click', function() {
        const deletePanel = document.createElement('div');
        const question = document.createElement('p');
        question.textContent = 'Are you sure you want to delete this chat?';
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        deletePanel.appendChild(question);
        deletePanel.appendChild(deleteButton);
        deletePanel.appendChild(cancelButton);
        document.body.appendChild(deletePanel);
        deleteButton.addEventListener('click', function() {
            chatDatabaseController.removeChat(chatId).then(() => {window.location.href = '/';});
        });
        cancelButton.addEventListener('click', function() {
            window.location.href = `/${chatId}`;
        });
    });
});

module.exports = sendToWebSocket;
