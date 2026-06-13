// import { send } from "clientUtilities";
// import type { User } from "types";
// const usertoken = localStorage.getItem("token");

// const user = await send<User | null>("GetUser", usertoken);

// if (user != null) {
//     location.href = "/website/pages/mainW.html";
// }
// else {
//     localStorage.removeItem("token");
// }

const LogoutBtn = document.getElementById("LogoutBtn") as HTMLButtonElement;

LogoutBtn.onclick = async function(): Promise<void> 
{
localStorage.removeItem("token");
location.href = "mainW.html";
}