const welcomeMessage = document.getElementById("welcomeMessage") as HTMLHeadingElement;
const playBtn = document.getElementById("playBtn") as HTMLAnchorElement;
const authBtn = document.getElementById("authBtn") as HTMLAnchorElement;
const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;

function checkSession(): void {
    // Reads from the active session slot managed by auth.ts
    const currentUser = sessionStorage.getItem("currentUser");

    if (currentUser) {
        // Logged-in state layout shifts
        welcomeMessage.innerText = `Welcome back, ${currentUser}!`;
        playBtn.style.display = "block";
        authBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        // Logged-out state layout shifts
        welcomeMessage.innerText = "Ready to test your reflexes?";
        playBtn.style.display = "none";
        authBtn.style.display = "block";
        logoutBtn.style.display = "none";
    }
}

// Clears tracking parameters when opting out of session manually
logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("currentUser");
    checkSession();
});

// Run layout verification routine on load
checkSession();