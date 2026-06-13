import { send } from "clientUtilities";

const UsernameInput =
  document.querySelector<HTMLInputElement>("#UsernameInput");

const PasswordInput =
  document.querySelector<HTMLInputElement>("#PasswordInput");

const ConfirmPasswordInput =
  document.querySelector<HTMLInputElement>("#ConfirmPasswordInput");

const CreateAccountButton =
  document.querySelector<HTMLButtonElement>("#CreateAccountButton");

const ErrorDiv =
  document.querySelector<HTMLElement>("#ErrorDiv");

const PasswordEyeImg =
  document.querySelector<HTMLImageElement>("#PasswordEyeImg");

const ConfirmPasswordEyeImg =
  document.querySelector<HTMLImageElement>("#ConfirmPasswordEyeImg");

if (
  UsernameInput === null ||
  PasswordInput === null ||
  ConfirmPasswordInput === null ||
  CreateAccountButton === null ||
  ErrorDiv === null ||
  PasswordEyeImg === null ||
  ConfirmPasswordEyeImg === null
) {
  throw new Error(
    "signup.html is missing one or more required elements."
  );
}

const openEyeSrc = "../images/open_eye.png";
const closedEyeSrc = "../images/closed_eye.png";

function togglePassword(
  input: HTMLInputElement,
  image: HTMLImageElement
): void {
  if (input.type === "password") {
    input.type = "text";
    image.src = closedEyeSrc;
    image.alt = "Hide password";
  } else {
    input.type = "password";
    image.src = openEyeSrc;
    image.alt = "Show password";
  }
}

PasswordEyeImg.onclick = function (): void {
  togglePassword(PasswordInput, PasswordEyeImg);
};

ConfirmPasswordEyeImg.onclick = function (): void {
  togglePassword(
    ConfirmPasswordInput,
    ConfirmPasswordEyeImg
  );
};

CreateAccountButton.onclick =
  async function (): Promise<void> {
    const username = UsernameInput.value.trim();
    const password = PasswordInput.value;
    const confirmPassword = ConfirmPasswordInput.value;

    ErrorDiv.innerText = "";

    if (
      username.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      ErrorDiv.innerText =
        "You must fill all the text boxes.";

      return;
    }

    if (username.length < 4) {
      ErrorDiv.innerText =
        "The username must contain at least 4 characters.";

      return;
    }

    if (username.length > 11) {
      ErrorDiv.innerText =
        "The username cannot contain more than 11 characters.";

      return;
    }

    if (password !== confirmPassword) {
      ErrorDiv.innerText = "Passwords do not match.";
      return;
    }

    if (password.length < 4) {
      ErrorDiv.innerText =
        "The password must contain at least 4 characters.";

      return;
    }

    if (password.length > 12) {
      ErrorDiv.innerText =
        "The password cannot contain more than 12 characters.";

      return;
    }

    CreateAccountButton.disabled = true;
    CreateAccountButton.innerText = "Creating account...";

    try {
      const userToken = await send<string | null>(
        "Signup",
        username,
        password
      );

      if (userToken === null) {
        ErrorDiv.innerText =
          "A user with that username already exists.";

        return;
      }

      localStorage.setItem("userToken", userToken);
      localStorage.setItem("username", username);

      location.href = "login.html";
    } catch (error) {
      console.error("Signup failed:", error);

      ErrorDiv.innerText =
        "Could not connect to the server.";
    } finally {
      CreateAccountButton.disabled = false;
      CreateAccountButton.innerText = "Sign Up";
    }
  };