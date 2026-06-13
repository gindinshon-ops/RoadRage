import { send } from "clientUtilities";

interface ScoreboardEntry {
  username: string;
  bestTime: number;
}
const backBtn =
 document.querySelector<HTMLButtonElement>(
    "#backBtn"
)!;

const gameBtn =
 document.querySelector<HTMLButtonElement>(
    "#gameBtn"
)!;

const ScoreboardBody =
  document.querySelector<HTMLTableSectionElement>(
    "#ScoreboardBody"
  )!;

const ScoreboardTable =
  document.querySelector<HTMLTableElement>(
    "#ScoreboardTable"
  )!;

const ScoreboardMessage =
  document.querySelector<HTMLParagraphElement>(
    "#ScoreboardMessage"
  )!;

if (
  ScoreboardBody === null ||
  ScoreboardTable === null ||
  ScoreboardMessage === null
) {
  throw new Error(
    "scoreboard.html is missing one or more required elements."
  );
}

backBtn.onclick = 
  function (): void {
    location.href="main1.html";
  }
  gameBtn.onclick = 
  function (): void {
    location.href="1.html";
  }

async function loadScoreboard(): Promise<void> {
  ScoreboardBody.innerHTML = "";

  ScoreboardMessage.innerText =
    "Loading scores...";

  ScoreboardTable.style.display = "none";

  try {
    const records =
      await send<ScoreboardEntry[]>(
        "GetRecords"
      );

    if (records.length === 0) {
      ScoreboardMessage.innerText =
        "No scores have been saved yet.";

      return;
    }

    records.forEach(
      function (
        record: ScoreboardEntry,
        index: number
      ): void {
        addScoreboardRow(
          index + 1,
          record
        );
      }
    );

    ScoreboardMessage.innerText = "";
    ScoreboardTable.style.display = "table";
  } catch (error) {
    console.error(
      "Could not load scoreboard:",
      error
    );

    ScoreboardMessage.innerText =
      "Could not load the scoreboard.";
  }
}

function addScoreboardRow(
  place: number,
  record: ScoreboardEntry
): void {
  const row =
    document.createElement("tr");

  const placeCell =
    document.createElement("td");

  const usernameCell =
    document.createElement("td");

  const bestTimeCell =
    document.createElement("td");

  placeCell.innerText =
    getPlaceText(place);

  usernameCell.innerText =
    record.username;

  bestTimeCell.innerText =
    `${record.bestTime} ms`;

  row.appendChild(placeCell);
  row.appendChild(usernameCell);
  row.appendChild(bestTimeCell);

  ScoreboardBody!.appendChild(row);
}

function getPlaceText(
  place: number
): string {
  if (place === 1) {
    return "🥇 1";
  }

  if (place === 2) {
    return "🥈 2";
  }

  if (place === 3) {
    return "🥉 3";
  }

  return place.toString();
}

void loadScoreboard();