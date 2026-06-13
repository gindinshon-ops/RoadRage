import { send } from "clientUtilities";
import type { User } from "types";

var welcomeMessage1 = document.querySelector<HTMLElement>("#welcomeMessage")!;
var ldbBtn= document.querySelector<HTMLButtonElement>("#ldbBtn")!;
var loginBtn = document.querySelector<HTMLButtonElement>("#loginBtn")!;
var usertoken = localStorage.getItem("token");
var user = await send<User | null>("getUser", usertoken);

loginBtn.onclick = async function () 
{
    location.href="/website/pages/login.html";
}
ldbBtn.onclick = async function () 
{
    location.href="/website/pages/scoreboard.html";
}