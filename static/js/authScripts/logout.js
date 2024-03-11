const myForm = document.getElementById("myForm");
const passwordInput = document.getElementById("passwordInput");
const errorPassword = document.getElementById("error-passwordInput");
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
    const passwordValue = passwordInput.value.trim();
    if (!passwordValue) {
        errorPassword.textContent = "This field is required";
        passwordInput.value = "";
    }
    errorPassword.textContent = "";

    const data = {
        username: username,
        password: passwordValue
    };

    const response = await fetch('/auth/post/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
    const result = await response.json();

    if (!response.ok) {
        if (result.message === 'Invalid password') {
            errorPassword.textContent = result.message;
        } else {
            resultsDiv.innerHTML = `
            <p style="color: #ff0000">${result.message}</p>
            <button style="display: flex" onclick="window.location.href='/auth/register'">Try Register</button>
        `;
        }
    } else {
        window.location.href = '/';
    }
}