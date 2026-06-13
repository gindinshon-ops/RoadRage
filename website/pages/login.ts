import { send } from "clientUtilities";

const UsernameInput =
  document.querySelector<HTMLInputElement>("#UsernameInput");

const PasswordInput =
  document.querySelector<HTMLInputElement>("#PasswordInput");

const LoginSubmitButton =
  document.querySelector<HTMLButtonElement>("#LoginSubmitButton");

const ErrorMessage =
  document.querySelector<HTMLParagraphElement>("#ErrorMessage");

if (
  UsernameInput === null ||
  PasswordInput === null ||
  LoginSubmitButton === null ||
  ErrorMessage === null
) {
  throw new Error(
    "login.html is missing one or more required elements."
  );
}

LoginSubmitButton.onclick =
  async function (): Promise<void> {
    const username = UsernameInput.value.trim();
    const password = PasswordInput.value;

    ErrorMessage.style.visibility = "hidden";
    ErrorMessage.innerText = "";

    if (username.length === 0 || password.length === 0) {
      ErrorMessage.innerText =
        "You must enter a username and password.";

      ErrorMessage.style.visibility = "visible";
      return;
    }

    LoginSubmitButton.disabled = true;
    LoginSubmitButton.innerText = "Logging in...";

    try {
      const userToken = await send<string | null>(
        "Login",
        username,
        password
      );

      if (userToken === null) {
        ErrorMessage.innerText =
          "Wrong username or password.";

        ErrorMessage.style.visibility = "visible";
        return;
      }

      localStorage.setItem("userToken", userToken);
      localStorage.setItem("username", username);

      location.href = "main1.html";
    } catch (error) {
      console.error("Login failed:", error);

      ErrorMessage.innerText =
        "Could not connect to the server.";

      ErrorMessage.style.visibility = "visible";
    } finally {
      LoginSubmitButton.disabled = false;
      LoginSubmitButton.innerText = "Login";
    }
  };

PasswordInput.addEventListener(
  "keydown",
  function (event: KeyboardEvent): void {
    if (event.key === "Enter") {
      LoginSubmitButton.click();
    }
  }
);