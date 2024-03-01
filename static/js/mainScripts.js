const userInitial = document.getElementById('user-initial');
const submitButton = document.getElementById('main-start-button');
const userInput = document.getElementById('main-user-input');
const deleteAllButton = document.getElementById('delete-all');
const aiIcon = document.getElementById('ai-icon');
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
newModal.id = 'logout-modal';
newModal.innerHTML = `
    <div class="modal-content">
        <button id="logout-option">Log out</button>
    </div>
`;
document.body.appendChild(newModal);
newModal.style.display = 'none';
let isOpen = false;
const editInput = document.getElementById('edit-input');
const saveButton = document.getElementById('save-button');
const cancelButton = document.getElementById('cancel-button');
const logoutOption = document.getElementById('logout-option');

async function sendMessage() {
    const userInput = document.getElementById('main-user-input');
    const response = await fetch("/chat/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `Untitled Chat` })});
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message);
    }
    const newChat = data.newChat;
    await fetch(`/message/add/${newChat._id}/${1}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sender: 'user', message: userInput.value }) });
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

userInitial.addEventListener('click', function() {
    newModal.style.display = 'block';
    isOpen = true;
    document.addEventListener('click', handleDocumentClick);
    logoutOption.addEventListener('click', function() {
        window.location.href = '/auth/logout';
    });
    window.onkeydown = function(event) {
        if (event.key === 'Escape') {
            newModal.style.display = 'none';
        }
    };
});

function handleDocumentClick(event) {
    if (isOpen && !newModal.contains(event.target) && !userInitial.contains(event.target)) {
        newModal.style.display = 'none';
        isOpen = false;
        document.removeEventListener('click', handleDocumentClick);
    }
}

aiIcon.addEventListener('click', function() {
    alert("Life's too short for bland conversations - let's spice things up and spoil you with insights beyond your imagination.")
});

deleteAllButton.addEventListener('click', function() {
    editInput.replaceWith(document.createTextNode('Are you sure you want to delete all chats?'));
    saveButton.textContent = 'Delete';
    saveButton.style.backgroundColor = '#f44336';
    modal.style.display = 'block';
    saveButton.addEventListener('click', async function() {
        await fetch('/chat/remove/all', { method: "DELETE" });
        await fetch('/message/remove/all', { method: "DELETE" });
        window.location.href = '/';
    });
    cancelButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    window.onkeydown = function(event) {
        if (event.key === 'Enter') {
            saveButton.click();
        } else if (event.key === 'Escape') {
            cancelButton.click();
        }
    };
});