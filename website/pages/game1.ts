import { send } from "clientUtilities";

const returnBtn = 
document.querySelector<HTMLButtonElement>(
  "#returnBtn"
)!;


const gameScreen =
  document.querySelector<HTMLDivElement>(
    "#gameScreen"
  )!;

const message =
  document.querySelector<HTMLElement>(
    "#message"
  )!;

const startBtn =
  document.querySelector<HTMLButtonElement>(
    "#startBtn"
  )!;

const playAgainBtn =
  document.querySelector<HTMLButtonElement>(
    "#playAgainBtn"
  )!;

if (
  gameScreen === null ||
  message === null ||
  startBtn === null ||
  playAgainBtn === null ||
  returnBtn === null
  
) {
  throw new Error(
    "The game HTML is missing one or more required elements."
  );
}

type GameState =
  | "idle"
  | "waiting"
  | "ready"
  | "result";

let gameState: GameState = "idle";
let startTime = 0;

let timeoutId:
  ReturnType<typeof setTimeout> | null = null;

startBtn.onclick =
  function (event: MouseEvent): void {
    event.stopPropagation();
    startGame();
  };

  returnBtn.onclick = 
  function (): void {
    location.href="1.html";
  }

playAgainBtn.onclick =
  function (event: MouseEvent): void {
    event.stopPropagation();
    resetGame();
  };

gameScreen.onclick = function (): void {
  handleScreenClick();
};

function startGame(): void {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  gameState = "waiting";
   
  startBtn.style.display = "none";
  playAgainBtn.style.display = "none";
  returnBtn.style.display = "none";
  gameScreen.style.backgroundColor = "red";
  message.innerText = "Wait for Green...";

  const randomDelay =
    Math.random() * 4000 + 2000;

  timeoutId = setTimeout(
    function (): void {
      timeoutId = null;
      turnGreen();
    },
    randomDelay
  );
}

function turnGreen(): void {
  if (gameState !== "waiting") {
    return;
  }

  gameState = "ready";

  gameScreen.style.backgroundColor = "green";
  message.innerText = "CLICK!";

  startTime = performance.now();
}

function handleScreenClick(): void {
  if (gameState === "waiting") {
    tooSoon();
    return;
  }

  if (gameState === "ready") {
    void endGame();
  }
}

function tooSoon(): void {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  gameState = "result";

  gameScreen.style.backgroundColor = "orange";
  message.innerText = "Too Soon!";
  returnBtn.style.display = "block";
  playAgainBtn.style.display = "block";
}

async function endGame(): Promise<void> {
  const reactionTime = Math.round(
    performance.now() - startTime
  );

  gameState = "result";

  gameScreen.style.backgroundColor =
    "lightblue";

  message.innerText =
    `Your reaction time: ${reactionTime} ms`;

  playAgainBtn.style.display = "block";
returnBtn.style.display = "block";
  await saveScore(reactionTime);
}

async function saveScore(
  reactionTime: number
): Promise<void> {
  const userToken =
    localStorage.getItem("userToken");

  if (userToken === null) {
    message.innerText +=
      "\nLog in to save your score.";

    return;
  }

  try {
    const scoreWasSaved =
      await send<boolean>(
        "SubmitRecord",
        userToken,
        reactionTime
      );

    if (scoreWasSaved) {
      message.innerText += "\nScore saved!";
    } else {
      message.innerText +=
        "\nThe score was not saved.";
    }
  } catch (error) {
    console.error(
      "Could not save score:",
      error
    );

    message.innerText +=
      "\nCould not save score to the server.";
  }
}

function resetGame(): void {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  gameState = "idle";
  startTime = 0;

  gameScreen.style.backgroundColor = "";
  message.innerText =
    "Click Start when you are ready.";

  startBtn.style.display = "block";
  playAgainBtn.style.display = "none";
}