const gameScreen = document.getElementById("gameScreen") as any;
const message = document.getElementById("message") as any;
const startBtn = document.getElementById("startBtn") as any;
const playAgainBtn = document.getElementById("playAgainBtn") as any;

let gameState: string = "idle";
let startTime: number = 0;
let timeoutId: any;

startBtn.addEventListener("click", (event: any) => {
    event.stopPropagation();
    startGame();
});

playAgainBtn.addEventListener("click", (event: any) => {
    event.stopPropagation();
});

gameScreen.addEventListener("click", handleScreenClick);

function startGame(): void {
    gameState = "waiting";
  
    startBtn.style.display = "none";
    playAgainBtn.style.display = "none";

    gameScreen.style.backgroundColor = "red";
    message.textContent = "Wait for Green...";

    const randomDelay: number = Math.random() * 4000 + 2000;

    timeoutId = setTimeout(() => {
        turnGreen();
    }, randomDelay);
}

function turnGreen(): void {
    gameState = "ready";

    gameScreen.style.backgroundColor = "green";
    message.textContent = "CLICK!";

    startTime = performance.now();
}

function handleScreenClick(): void {
    if (gameState === "waiting") {
        tooSoon();
        return;
    }

    if (gameState === "ready") {
        endGame();
        return;
    }
}

function tooSoon(): void {
    clearTimeout(timeoutId);

    gameState = "result";

    gameScreen.style.backgroundColor = "orange";
    message.textContent = "Too Soon!";

    playAgainBtn.style.display = "block";
}




import { getDB, saveDB } from "./db"; // <-- Add this import at the very top of Game.ts

// ... Keep all your other existing functions, variables, and click listeners exactly as they are ...

async function endGame(): Promise<void> {
    const reactionTime: number = Math.round(
        performance.now() - startTime
    );

    gameState = "result";

    gameScreen.style.backgroundColor = "lightblue";
    message.textContent = `Your reaction time: ${reactionTime} ms`;

    playAgainBtn.style.display = "block";

    // --- NEW: SAVE TO SQLITE ---
    const currentUser = sessionStorage.getItem("currentUser");

    if (currentUser) {
        const db = await getDB();
        // Insert user name and reaction time into the leaderboard
        db.run("INSERT INTO leaderboard (username, score) VALUES (?, ?)", [currentUser, reactionTime]);
        saveDB(); // Commit changes to browser local storage
    } else {
        message.textContent += " (Log in to save your score!)";
 
    }
    
}