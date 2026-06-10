import { getDB } from "./db";

const loginForm = document.getElementById("loginForm") as HTMLFormElement;
const usernameInput = document.getElementById("username") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;

loginForm.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    try {
        const db = await getDB();

        const stmt = db.prepare("SELECT username FROM users WHERE username=:user AND password=:pass");
        const userRow = stmt.getAsObject({ ":user": username, ":pass": password });
        stmt.free();

        if (userRow && typeof userRow.username === 'string' && userRow.username.length > 0) {
            sessionStorage.setItem("currentUser", username);
            window.location.href = "game1.html"; 
        } else {
            alert("Either the password or the username are incorrect.");
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Could not connect to database. Make sure you are using a local server.");
    }
});