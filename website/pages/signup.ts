import { send } from "clientUtilities";

console.log("signup.ts loaded");

const UserNameInput = document.querySelector<HTMLInputElement>("#UsernameInput")!;
const PasswordInput = document.querySelector<HTMLInputElement>("#PasswordInput")!;
const ConfirmPasswordInput = document.querySelector<HTMLInputElement>("#ConfirmPasswordInput")!;
const CreateAccountButton = document.querySelector<HTMLButtonElement>("#CreateAccountButton")!;
const ErrorDiv = document.querySelector<HTMLElement>("#ErrorDiv")!;
const PasswordEyeImg = document.querySelector<HTMLImageElement>("#PasswordEyeImg")!;
const ConfirmPasswordEyeImg = document.querySelector<HTMLImageElement>("#ConfirmPasswordEyeImg")!;

const openEyeSrc = "../images/open_eye.png";
const closedEyeSrc = "../images/closed_eye.png";

function togglePassword(input: HTMLInputElement, image: HTMLImageElement): void {
  if (input.type === "password") {
    input.type = "text";
    image.src = closedEyeSrc;
  } else {
    input.type = "password";
    image.src = openEyeSrc;
  }
}

PasswordEyeImg.onclick = function (): void {
  togglePassword(PasswordInput, PasswordEyeImg);
};

ConfirmPasswordEyeImg.onclick = function (): void {
  togglePassword(ConfirmPasswordInput, ConfirmPasswordEyeImg);
};

CreateAccountButton.onclick = async function (): Promise<void> {
  console.log("signup button clicked");

  const username = UserNameInput.value.trim();
  const password = PasswordInput.value;
  const confirmPassword = ConfirmPasswordInput.value;

  if (username.length === 0 || password.length === 0 || confirmPassword.length === 0) {
    ErrorDiv.innerText = "You must fill all the text boxes.";
    return;
  }

  if (username.length <= 3) {
    ErrorDiv.innerText = "The username is too short.";
    return;
  }

  if (username.length >= 12) {
    ErrorDiv.innerText = "The username is too long.";
    return;
  }

  if (password !== confirmPassword) {
    ErrorDiv.innerText = "Passwords do not match.";
    return;
  }

  if (password.length < 4) {
    ErrorDiv.innerText = "The password is too short.";
    return;
  }

  if (password.length > 12) {
    ErrorDiv.innerText = "The password is too long.";
    return;
  }

  try {
    console.log("sending signup request");

    const userToken = await send<string | null>("Signup", username, password);

    console.log("server returned:", userToken);

    if (userToken === null) {
      ErrorDiv.innerText = "A user with that username already exists.";
      return;
    }

    localStorage.setItem("userToken", userToken);
    location.href = "index.html";
  } catch (error) {
    console.error(error);
    ErrorDiv.innerText = "Could not connect to the server.";
  }
};