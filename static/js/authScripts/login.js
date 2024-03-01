const myForm = document.getElementById("myForm");
const usernameInput = document.getElementById("textInput");
const passwordInput = document.getElementById("passwordInput");
const errorPassword = document.getElementById("error-passwordInput");
const errorUsername = document.getElementById("error-textInput");
const submitButton = document.getElementById("submit");
const resultsDiv = document.getElementById("results");
const username = window.username;

submitButton.addEventListener("click", submitForm);
myForm.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        await submitForm();
    }
});

async function submitForm() {
    let userValue = "";
    if (!username) {
        const usernameValue = usernameInput.value.trim();
        if (!usernameValue) {
            errorUsername.textContent = "This field is required";
            usernameInput.value = "";
            return;
        }
        userValue = usernameValue;
    }

    const passwordValue = passwordInput.value.trim();
    if (!passwordValue) {
        errorPassword.textContent = "This field is required";
        passwordInput.value = "";
    }
    errorPassword.textContent = "";

    const data = {
        username: username || userValue,
        password: passwordValue
    };

    const response = await fetch('/auth/post/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
    const result = await response.json();

    if (!response.ok) {
        errorPassword.textContent = result.message === 'Invalid password' ? result.message : '';
        resultsDiv.innerHTML = `
            <p>${result.message}</p>
            <button onclick="window.location.href='/auth/register'">Try Register</button>
        `;
    } else {
        window.location.href = '/';
    }
}