import { getDB } from "./db";

var scoreTable = document.querySelector<HTMLTableElement>("#scoreTable")!;

async function loadLeaderboard() {
    const db = await getDB();
    
    // Select scores ordered from lowest (fastest reaction) to highest, limit to top 10
    const res = db.exec("SELECT username, score FROM leaderboard ORDER BY score ASC LIMIT 10");
    
    // Clear existing dynamic rows if any (keeping the header)
    while (scoreTable.rows.length > 1) {
        scoreTable.deleteRow(1);
    }

    if (res.length > 0) {
        const rows = res[0].values; 
        
        for (var row of rows) {
          var tr = document.createElement("tr");
          scoreTable.append(tr);
        
          var nameTd = document.createElement("td");
          nameTd.innerText = String(row[0]); // Player Name
          tr.append(nameTd);
        
          var scoreTd = document.createElement("td");
          scoreTd.className = "scoreTd";
          scoreTd.innerText = `${row[1]} ms`; // Player Score
          tr.append(scoreTd);
        }
    }
}

// Execute the load
loadLeaderboard();