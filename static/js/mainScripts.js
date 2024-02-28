const ws = new WebSocket('ws://127.0.0.1:1337');
const submitButton = document.getElementById('main-start-button');
const userInput = document.getElementById('main-user-input');
const deleteAllButton = document.getElementById('delete-all');

function sendToWebSocket(message, model, context) {
    ws.send(JSON.stringify({
        message: message,
        model: model,
        context: context
    }));
}

async function sendMessage() {
    const userInput = document.getElementById('main-user-input');
    const response = await fetch("/chat/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `Untitled Chat` })});
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message);
    }
    const newChat = data.newChat;
    await fetch(`/message/add/${newChat._id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sender: 'user', message: userInput.value, count: 1 }) });
    sendToWebSocket(userInput.value, 'libra', []);
    userInput.value = '';
    window.location.href = `/${newChat._id}`;
}

submitButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', async function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        await sendMessage();
    }
});

deleteAllButton.addEventListener('click', function() {
    const deletePanel = document.createElement('div');
    const question = document.createElement('p');
    question.textContent = 'Are you sure you want to delete all chats?';
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    deletePanel.appendChild(question);
    deletePanel.appendChild(deleteButton);
    deletePanel.appendChild(cancelButton);
    document.body.appendChild(deletePanel);
    deleteButton.addEventListener('click', async function() {
        await fetch('/chat/removeAll', { method: "DELETE" });
        window.location.href = '/';
    });
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(deletePanel);
    });
});