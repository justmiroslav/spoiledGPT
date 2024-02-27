const ws = new WebSocket('ws://127.0.0.1:1337');
const chatContent = document.getElementById('chat-content');
const messageInput = document.getElementById('user-input');
const summarizedTitle = document.getElementById('summarized-title');
const submitButton = document.getElementById('submit-button');
const chatId = window.location.pathname.split('/')[1];
const response = await fetch(`/message/count/${chatId}`, { method: "GET" });
const countMessage = await response.json();
if (!response.ok) {
    throw new Error(countMessage.message);
}
let messageCounter = countMessage.count;
let context = [];
let FirstAnswerChunk = true;
let messageP = null;
let responsesCounter = 0;
let summaryCounter = 0;
let FirstSummaryChunk = true;
let summaryP = null;

window.onload = async function() {
    const modelSelector = document.getElementById('model-selector');
    const modelDescription = document.getElementById('model-description');
    if (modelSelector.value === 'libra') {
        modelDescription.textContent = 'AI assistant focused on providing fast and helpful responses';
    } else if (modelSelector.value === 'sparky') {
        modelDescription.textContent = 'AI assistant created for open-ended conversations on any topic';
    }

    modelSelector.addEventListener('change', function() {
        if (modelSelector.value === 'libra') {
            modelDescription.textContent = 'AI assistant focused on providing fast and helpful responses';
        } else if (modelSelector.value === 'sparky') {
            modelDescription.textContent = 'AI assistant created for open-ended conversations on any topic';
        }
    });

    const response = await fetch(`/message/get/all/${chatId}`, { method: "GET" });
    const messagesNotParsed = await response.json();
    if (!response.ok) {
        throw new Error(messagesNotParsed.message);
    }
    const messages = messagesNotParsed.messages;
    console.log(messages);
    messages.forEach(message => {
        console.log(message);
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
            editButton.addEventListener('click', async function() {
                const deleteResponse = await fetch(`/message/delete/${chatId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: message.count })});
                const deleteData = await deleteResponse.json();
                if (!deleteResponse.ok) {
                    throw new Error(deleteData.message);
                }
                const updateResponse = await fetch(`/message/update/${message._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: editInput.value })});
                const updateData = await updateResponse.json();
                if (!updateResponse.ok) {
                    throw new Error(updateData.message);
                }
                messageCounter = message.count;
                const index = context.findIndex(item => item["content"] === messageP.textContent);
                context.splice(index);
                sendToWebSocket(editInput.value, modelSelector.value, context);
            });
            cancelButton.addEventListener('click', function() {
                window.location.href = `/${chatId}`;
            });
        });
        copyIcon.addEventListener('click', function() {
            const messageP = document.getElementById(copyIcon.id);
            navigator.clipboard.writeText(messageP.textContent);
        });
        retryIcon.addEventListener('click', async function() {
            const messageNotParsed = await fetch(`/message/get/${chatId}`, { method: "GET", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: message.count - 1 })});
            const messageDb = await messageNotParsed.json();
            if (!messageNotParsed.ok) {
                throw new Error(messageDb.message);
            }
            const messageP = messageDb.findMessage;
            const response = await fetch(`/message/delete/${chatId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: message.count - 1 })});
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            messageCounter = message.count - 1;
            const index = context.findIndex(item => item["content"] === messageP);
            context.splice(index);
            sendToWebSocket(messageP, modelSelector.value, context);
        });
    });
}

function sendToWebSocket(message, model, context) {
    ws.send(JSON.stringify({
        message: message,
        model: model,
        context: context
    }));
}

async function sendMessage() {
    const messageInput = document.getElementById('user-input');
    const modelSelector = document.getElementById('model-selector');
    const userMessage = document.createElement('p');
    const editIcon = document.createElement('i');
    userMessage.className = 'user';
    userMessage.textContent = messageInput.value;
    editIcon.className = 'fas fa-pencil-alt';
    userMessage.appendChild(editIcon);
    chatContent.appendChild(userMessage);
    messageCounter++;
    const response = await fetch(`/message/add/${chatId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sender: 'user', message: userMessage.textContent, count: messageCounter })});
    const messageNotParsed = await response.json();
    if (!response.ok) {
        throw new Error(messageNotParsed.message);
    }
    const message = messageNotParsed.newMessage;
    userMessage.id = message._id;
    editIcon.id = message._id;
    sendToWebSocket(messageInput.value, modelSelector.value, context);
    messageInput.value = '';
}

submitButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', async function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        await sendMessage();
    }
});

ws.onmessage = async function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'context') {
        context = data.content;
    } else if (data.type === 'message') {
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
            const response = await fetch(`/message/add/${chatId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sender: 'assistant', message: messageP.textContent, count: messageCounter })});
            const messageNotParsed = await response.json();
            if (!response.ok) {
                throw new Error(messageNotParsed.message);
            }
            const message = messageNotParsed.newMessage;
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
            const response = await fetch(`/chat/update/${chatId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: summaryP.textContent })});
            const summaryNotParsed = await response.json();
            if (!response.ok) {
                throw new Error(summaryNotParsed.message);
            }
            summaryP = null;
            summaryCounter = 0;
            FirstSummaryChunk = true;
        }
    }
};

summarizedTitle.addEventListener('click', function() {
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
        renameButton.addEventListener('click',async function() {
            const response = await fetch(`/chat/update/${chatId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: renameInput.value })});
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            window.location.href = `/${chatId}`;
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
        deleteButton.addEventListener('click', async function() {
            const response = await fetch(`/chat/remove/${chatId}`, { method: "DELETE" });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            window.location.href = '/';
        });
        cancelButton.addEventListener('click', function() {
            window.location.href = `/${chatId}`;
        });
    });
});