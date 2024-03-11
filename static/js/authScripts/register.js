const myForm = document.getElementById("myForm");
const textInput = document.getElementById("textInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const errorText = document.getElementById("error-textInput");
const errorEmail = document.getElementById("error-emailInput");
const errorPassword = document.getElementById("error-passwordInput");
const errorConfirmPassword = document.getElementById("error-confirmPasswordInput");
const uppercaseReq = document.getElementById("uppercaseReq");
const lowercaseReq = document.getElementById("lowercaseReq");
const numberReq = document.getElementById("numberReq");
const specialCharReq = document.getElementById("specialCharReq");
const lengthReq = document.getElementById("lengthReq");
const passwordStatus = document.getElementById("passwordStatus");
const submitButton = document.getElementById("submit");
const resultsDiv = document.getElementById("results");

const passwordStrength = {
    1: { text: "Trash", color: "red" },
    2: { text: "Weak", color: "orange" },
    3: { text: "Moderate", color: "yellow" },
    4: { text: "Strong", color: "lime" },
    5: { text: "Amazing", color: "green" },
};

passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    let requirementsSatisfied = 0;

    if (/(?=.*\d)/.test(password)) {
        requirementsSatisfied++;
        numberReq.style.color = "green";
    } else {
        numberReq.style.color = "initial";
    }

    if (/(?=.*[\p{S}\p{P}])/u.test(password)) {
        requirementsSatisfied++;
        specialCharReq.style.color = "green";
    } else {
        specialCharReq.style.color = "initial";
    }

    if (password.length >= 8) {
        requirementsSatisfied++;
        lengthReq.style.color = "green";
    } else {
        lengthReq.style.color = "initial";
    }

    const hasUppercase = [...password].some((char) => /\p{Lu}/u.test(char));
    if (hasUppercase) {
        requirementsSatisfied++;
        uppercaseReq.style.color = "green";
    } else {
        uppercaseReq.style.color = "initial";
    }

    const hasLowercase = [...password].some((char) => /\p{Ll}/u.test(char));
    if (hasLowercase) {
        requirementsSatisfied++;
        lowercaseReq.style.color = "green";
    } else {
        lowercaseReq.style.color = "initial";
    }

    const strengthInfo = passwordStrength[requirementsSatisfied];

    if (requirementsSatisfied === 0) {
        passwordStatus.innerHTML = "";
    } else {
        passwordStatus.innerHTML = `Password Status: <span style="color:${strengthInfo.color};">${strengthInfo.text}</span>`;
    }
});

submitButton.addEventListener("click", submitForm);
myForm.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        await submitForm();
    }
});

async function submitForm() {
    let hasError = false;

    if (textInput.value.trim() === "") {
        errorText.textContent = "This field is required";
        hasError = true;
    } else {
        errorText.textContent = "";
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(emailInput.value)) {
        errorEmail.textContent = "Enter a valid email address";
        hasError = true;
    } else {
        errorEmail.textContent = "";
    }

    if (passwordInput.value.trim() === "") {
        errorPassword.textContent = "This field is required";
        hasError = true;
    } else {
        errorPassword.textContent = "";
    }

    if (confirmPasswordInput.value !== passwordInput.value) {
        errorConfirmPassword.textContent = "Passwords do not match";
        hasError = true;
    } else {
        errorConfirmPassword.textContent = "";
    }

    if (hasError) {
        return;
    }

    const data = {
        username: textInput.value,
        email: emailInput.value,
        password: passwordInput.value,
    };

    textInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    confirmPasswordInput.value = "";
    passwordStatus.textContent = "";
    uppercaseReq.style.color = "initial";
    lowercaseReq.style.color = "initial";
    numberReq.style.color = "initial";
    specialCharReq.style.color = "initial";
    lengthReq.style.color = "initial";

    const response = await fetch('/auth/post/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
    const result = await response.json();
    if (!response.ok) {
        if (result.message === 'User with this username already exists') {
            errorText.textContent = result.message;
        } else {
            errorEmail.textContent = result.message;
        }
        resultsDiv.innerHTML = `
            <p style="color: #ff0000">Invalid data</p>
            <button style="display: flex" onclick="window.location.href='/auth/login'">Try Login</button>
        `;
    } else {
        window.location.href = '/';
    }
}