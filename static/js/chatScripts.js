const ws = new WebSocket('ws://127.0.0.1:1337');
const chatContent = document.getElementById('chat-content');
const messageInput = document.getElementById('user-input');
const summarizedTitle = document.getElementById('summarized-title');
const submitButton = document.getElementById('submit-button');
const chatId = window.location.pathname.split('/')[1];
let messageCounter;
let idToCount = {};
let context = [];
let FirstAnswerChunk = true;
let messageP = null;
let responsesCounter = 0;
let summaryCounter = 0;
let FirstSummaryChunk = true;
let isOpen = false;
let summaryP = null;
const modal = document.createElement('div');
modal.id = 'edit-modal';
modal.innerHTML = `
    <div class="modal-content">
        <input type="text" id="edit-input" />
        <div>
            <button id="save-button">Save</button>
            <button id="cancel-button">Cancel</button>
        </div>
    </div>
`;
document.body.appendChild(modal);
modal.style.display = 'none';
const newModal = document.createElement('div');
newModal.id = 'summary-modal';
newModal.innerHTML = `
    <div class="modal-content">
        <button id="rename-option">Rename</button>
        <button id="delete-option">Delete</button>
    </div>
`;
document.body.appendChild(newModal);
newModal.style.display = 'none';
const editInput = document.getElementById('edit-input');
const saveButton = document.getElementById('save-button');
const cancelButton = document.getElementById('cancel-button');
const renameOption = document.getElementById('rename-option');
const deleteOption = document.getElementById('delete-option');

window.onload = async function() {
    const modelSelector = document.getElementById('model-selector');
    const modelDescription = document.getElementById('model-description');
    if (modelSelector.value === 'libra') {
        modelDescription.textContent = 'fast and helpful responses';
    } else if (modelSelector.value === 'sparky') {
        modelDescription.textContent = 'open-ended conversations on any topic';
    }
    modelSelector.addEventListener('change', function() {
        if (modelSelector.value === 'libra') {
            modelDescription.textContent = 'fast and helpful responses';
        } else if (modelSelector.value === 'sparky') {
            modelDescription.textContent = 'open-ended conversations on any topic';
        }
    });
    const response = await fetch(`/message/get/all/${chatId}`, { method: "GET"});
    const messagesNotParsed = await response.json();
    if (!response.ok) {
        throw new Error(messagesNotParsed.message);
    }
    const endpoint = window.location.pathname;
    const messages = messagesNotParsed.messages;
    messageCounter = messages.length;
    const firstMessage = localStorage.getItem(endpoint);
    if (firstMessage === null) {
        sendToWebSocket(messages[0].message, "libra", []);
        localStorage.setItem(endpoint, 'true');
    }
    for (let i = 0; i < messages.length; i++) {
        context.push({role: messages[i].sender, content: messages[i].message});
        idToCount[messages[i]._id] = messages[i].count;
    }
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
    const userMessage = document.createElement('div');
    const messageText = document.createElement('p');
    const messageButtons = document.createElement('div');
    const editIcon = document.createElement('i');
    const deleteIcon = document.createElement('i');
    messageText.className = 'user';
    messageText.textContent = messageInput.value.replace(/\n/g, '<br>');
    const text = messageText.textContent.replace(/<br>/g, '\n');
    editIcon.className = 'fas fa-pencil-alt';
    deleteIcon.className = 'fas fa-trash-alt';
    messageButtons.appendChild(editIcon);
    messageButtons.appendChild(deleteIcon);
    userMessage.appendChild(messageText);
    userMessage.appendChild(messageButtons);
    chatContent.appendChild(userMessage);
    chatContent.scrollTop = chatContent.scrollHeight;
    messageCounter++;
    const response = await fetch(`/message/add/${chatId}/${messageCounter}`,
        { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender: messageText.className, message: text }) });
    const messageNotParsed = await response.json();
    if (!response.ok) {
        throw new Error(messageNotParsed.message);
    }
    const message = messageNotParsed.newMessage;
    userMessage.id = message._id;
    userMessage.className = "message-div";
    userMessage.lastChild.firstChild.id = message._id;
    userMessage.lastChild.lastChild.id = message._id;
    idToCount[message._id] = message.count;
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
            messageP = document.createElement('div');
            const messageText = document.createElement('p');
            const messageButtons = document.createElement('div');
            const copyIcon = document.createElement('i');
            const retryIcon = document.createElement('i');
            copyIcon.className = 'fas fa-copy';
            retryIcon.className = 'fas fa-redo';
            messageText.className = 'assistant';
            messageButtons.appendChild(copyIcon);
            messageButtons.appendChild(retryIcon);
            messageP.appendChild(messageText);
            messageP.appendChild(messageButtons);
            chatContent.appendChild(messageP);
            chatContent.scrollTop = chatContent.scrollHeight;
            FirstAnswerChunk = false;
        }
        messageP.firstChild.innerHTML += data.content.replace(/\n/g, '<br>');
        chatContent.scrollTop = chatContent.scrollHeight;
        responsesCounter++;
        if (responsesCounter === messageLength) {
            messageCounter++;
            const text = messageP.firstChild.innerHTML.replace(/<br>/g, '\n');
            const response = await fetch(`/message/add/${chatId}/${messageCounter}`,
                { method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sender: messageP.firstChild.className, message: text })});
            const messageNotParsed = await response.json();
            if (!response.ok) {
                throw new Error(messageNotParsed.message);
            }
            const message = messageNotParsed.newMessage;
            messageP.className = "message-div";
            messageP.id = message._id;
            messageP.lastChild.firstChild.id = message._id;
            messageP.lastChild.lastChild.id = message._id;
            idToCount[message._id] = message.count;
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
            summarizedTitle.innerHTML = '';
            summarizedTitle.appendChild(icon);
            summarizedTitle.appendChild(summaryP);
            FirstSummaryChunk = false;
        }
        summaryP.textContent += data.content;
        summaryCounter++;
        if (summaryCounter === summaryLength) {
            await fetch(`/chat/update/${chatId}`, { method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: summaryP.textContent })});
            summaryP = null;
            summaryCounter = 0;
            FirstSummaryChunk = true;
        }
    }
};

chatContent.addEventListener('click', async function(event) {
    if (event.target.tagName === 'I') {
        const messageId = event.target.id;
        const response = await fetch(`/message/get/id/${messageId}`, { method: "GET" });
        const messageNotParsed = await response.json();
        if (!response.ok) {
            throw new Error(messageNotParsed.message);
        }
        const message = messageNotParsed.messageId;
        const messageDiv = document.getElementById(message._id);
        const messageP = messageDiv.firstChild;
        const modelSelector = document.getElementById('model-selector');
        if (event.target.classList.contains('fa-pencil-alt')) {
            editInput.value = messageP.textContent;
            modal.style.display = 'block';
            saveButton.onclick = async function () {
                const index = context.findIndex(item => item["content"] === messageP.textContent);
                context.splice(index);
                messageP.textContent = editInput.value;
                modal.style.display = 'none';
                messageCounter = message.count;
                await fetch(`/message/delete/${chatId}/${message.count}`, {method: "DELETE"});
                await fetch(`/message/update/${messageId}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({message: messageP.textContent})
                });
                Array.from(chatContent.children).forEach(child => {
                    const childCount = idToCount[child.id];
                    if (childCount > messageCounter) {
                        chatContent.removeChild(child);
                    }
                });
                for (let id in idToCount) {
                    if (idToCount[id] >= message.count) {
                        delete idToCount[id];
                    }
                }
                sendToWebSocket(messageP.textContent, modelSelector.value, context);
            };
            cancelButton.onclick = function () {
                modal.style.display = 'none';
            };
            window.onkeydown = function (event) {
                if (event.key === 'Enter') {
                    saveButton.click();
                } else if (event.key === 'Escape') {
                    cancelButton.click();
                }
            };
        } else if (event.target.classList.contains('fa-trash-alt')) {
            const messageCount = message.count;
            const nextMessageCount = messageCount + 1;
            await fetch(`/message/delete/one/${chatId}/${messageCount}`, { method: "DELETE" });
            await fetch(`/message/delete/one/${chatId}/${nextMessageCount}`, { method: "DELETE" });
            Array.from(chatContent.children).forEach(child => {
                const childCount = idToCount[child.id];
                if (childCount === messageCount || childCount === nextMessageCount) {
                    chatContent.removeChild(child);
                }
            });
            const index = context.findIndex(item => item["content"] === messageP.textContent);
            context.splice(index, 2);
            for (let id in idToCount) {
                if (idToCount[id] === messageCount || idToCount[id] === nextMessageCount) {
                    delete idToCount[id];
                }
                if (idToCount[id] > nextMessageCount) {
                    idToCount[id] -= 2;
                    await fetch(`/message/update/count/${id}/${idToCount[id]}`, { method: "PATCH" });
                }
            }
        } else if (event.target.classList.contains('fa-copy')) {
            await navigator.clipboard.writeText(messageP.innerHTML.replace(/<br>/g, '\n'));
        } else if (event.target.classList.contains('fa-redo')) {
            const previousMessage = await fetch(`/message/get/prev/${chatId}/${message._id}`, { method: "GET" });
            const previousMessageNotParsed = await previousMessage.json();
            if (!previousMessage.ok) {
                throw new Error(previousMessageNotParsed.message);
            }
            const previous = previousMessageNotParsed.previousMessage;
            messageCounter = previous.count;
            await fetch(`/message/delete/${chatId}/${messageCounter}`, { method: "DELETE" });
            const index = context.findIndex(item => item["content"] === previous.message);
            context.splice(index);
            Array.from(chatContent.children).forEach(child => {
                const childCount = idToCount[child.id];
                if (childCount > messageCounter) {
                    chatContent.removeChild(child);
                }
            });
            for (let id in idToCount) {
                if (idToCount[id] >= previous.count) {
                    delete idToCount[id];
                }
            }
            sendToWebSocket(previous.message, modelSelector.value, context);
        }
    }
});

summarizedTitle.addEventListener('click', function() {
    newModal.style.display = 'block';
    isOpen = true;
    document.addEventListener('click', handleDocumentClick);
    renameOption.addEventListener('click', function() {
        editInput.value = summarizedTitle.lastChild.textContent;
        modal.style.display = 'block';
        saveButton.onclick = async function() {
            summarizedTitle.lastChild.textContent = editInput.value;
            await fetch(`/chat/update/${chatId}`, { method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: summarizedTitle.lastChild.textContent })});
            modal.style.display = 'none';
        };
        cancelButton.onclick = function() {
            modal.style.display = 'none';
        };
        window.onkeydown = function(event) {
            if (event.key === 'Enter') {
                saveButton.click();
            } else if (event.key === 'Escape') {
                cancelButton.click();
            }
        };
        newModal.style.display = 'none';
    });
    deleteOption.addEventListener('click', function() {
        editInput.replaceWith(document.createTextNode('Are you sure you want to delete this chat?'));
        saveButton.textContent = 'Delete';
        saveButton.style.backgroundColor = '#f44336';
        modal.style.display = 'block';
        saveButton.onclick = async function() {
            modal.style.display = 'none';
            await fetch(`/message/delete/all/${chatId}`, { method: "DELETE" });
            await fetch(`/chat/remove/${chatId}`, { method: "DELETE" });
            window.location.href = '/';
        };
        cancelButton.onclick = function() {
            modal.style.display = 'none';
        };
        window.onkeydown = function(event) {
            if (event.key === 'Enter') {
                saveButton.click();
            } else if (event.key === 'Escape') {
                cancelButton.click();
            }
        };
        newModal.style.display = 'none';
    });
    window.onkeydown = function(event) {
        if (event.key === 'Escape') {
            newModal.style.display = 'none';
        }
    };
});

function handleDocumentClick(event) {
    if (isOpen && !newModal.contains(event.target) && !summarizedTitle.contains(event.target)) {
        newModal.style.display = 'none';
        isOpen = false;
        document.removeEventListener('click', handleDocumentClick);
    }
}