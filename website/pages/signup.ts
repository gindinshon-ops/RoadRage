import { getDB, saveDB } from "./db";

const signupForm = document.getElementById("signupForm") as HTMLFormElement;
const usernameInput = document.getElementById("username") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;

signupForm.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    try {
        const db = await getDB();


        const checkStmt = db.prepare("SELECT username FROM users WHERE username=:user");
        const existingUser = checkStmt.getAsObject({ ":user": username });
        checkStmt.free();

        if (existingUser && existingUser.username) {
            alert("Username already exists! Please choose another one.");
            return; 
        }

        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
        
        await saveDB();
        
        alert("Account created successfully! Redirecting to login page.");
        window.location.href = "login.html";

    } catch (err) {
        console.error("Registration Error:", err);
        alert("An error occurred during registration. Please try again.");
    }
});