import { send } from "clientUtilities";

console.log("login.ts loaded");

const UsernameInput = document.querySelector<HTMLInputElement>("#UsernameInput");
const PasswordInput = document.querySelector<HTMLInputElement>("#PasswordInput");
const LoginSubmitButton = document.querySelector<HTMLButtonElement>("#LoginSubmitButton");
const ErrorMessage = document.querySelector<HTMLParagraphElement>("#ErrorMessage");

if (
  UsernameInput === null ||
  PasswordInput === null ||
  LoginSubmitButton === null ||
  ErrorMessage === null
) {
  throw new Error("Login page HTML is missing one or more required elements.");
}

// Do not auto-redirect while testing.
// Otherwise old localStorage token can skip the login page immediately.

// const existingToken = localStorage.getItem("userToken");
// if (existingToken !== null) {
//   location.href = "/website/pages/Lobby.html";
// }

LoginSubmitButton.onclick = async function (): Promise<void> {
  console.log("login button clicked");

  const username = UsernameInput.value.trim();
  const password = PasswordInput.value;

  if (username.length === 0 || password.length === 0) {
    ErrorMessage.innerText = "You must enter username and password.";
    ErrorMessage.style.visibility = "visible";
    return;
  }

  try {
    console.log("sending login request");

    const userToken = await send<string | null>("Login", username, password);

    console.log("server returned:", userToken);

    if (userToken !== null) {
      ErrorMessage.style.visibility = "hidden";
      localStorage.setItem("userToken", userToken);
      location.href = "index.html";
    } else {
      ErrorMessage.innerText = "Wrong username or password.";
      ErrorMessage.style.visibility = "visible";
    }
  } catch (error) {
    console.error(error);
    ErrorMessage.innerText = "Could not connect to the server.";
    ErrorMessage.style.visibility = "visible";
  }
};