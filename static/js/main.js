import chatDatabaseController from '/controllers/chatDatabaseController';
import messageController from '/controllers/messageController';
const submitButton = document.getElementById('main-start-button');
const userInput = document.getElementById('main-user-input');
import sendToWebSocket from '/updateChat';

function sendMessage() {
    const userInput = document.getElementById('main-user-input');
    const newChat = chatDatabaseController.addChat("Untitled chat");
    console.log(newChat._id);
    messageController.createMessage(newChat._id, 'user', userInput.value, 1);
    sendToWebSocket(userInput.value, 'libra');
    userInput.value = '';
    window.location.href = `/${newChat._id}`;
}

submitButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

document.getElementById('existing-chats').addEventListener('click', function(event) {
    if (event.target.tagName === 'BUTTON') {
        window.location.href = event.target.parentElement.href;
    }
});

document.getElementById('delete-all').addEventListener('click', function() {
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
    deleteButton.addEventListener('click', function() {
        chatDatabaseController.removeAllChats().then(() => {window.location.href = '/';});
    });
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(deletePanel);
    });
});