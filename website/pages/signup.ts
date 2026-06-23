/*
  Imports the `send` function from the module named "clientUtilities".

  The `send` function is used to communicate with the backend server.

  In this file, it will send the signup information to the server:
  - The action name: "Signup"
  - The username entered by the user
  - The password entered by the user
*/
import { send } from "clientUtilities";

/*
  Searches the HTML page for an element whose id is "UsernameInput".

  The # symbol means that querySelector is searching for an element by its id.

  <HTMLInputElement> tells TypeScript that this element should be an
  HTML <input> element.

  querySelector may return:
  - The matching HTMLInputElement
  - null if the element cannot be found
*/
const UsernameInput =
  document.querySelector<HTMLInputElement>("#UsernameInput");

/*
  Searches for the password input element.

  This element is expected to look similar to this in signup.html:

  <input id="PasswordInput" type="password">

  The value entered into this input can later be accessed by using:

  PasswordInput.value
*/
const PasswordInput =
  document.querySelector<HTMLInputElement>("#PasswordInput");

/*
  Searches for the input in which the user must enter the password again.

  The second password is used to confirm that the user did not make a typing
  mistake while entering the original password.
*/
const ConfirmPasswordInput =
  document.querySelector<HTMLInputElement>("#ConfirmPasswordInput");

/*
  Searches for the button that creates the new account.

  <HTMLButtonElement> tells TypeScript that this element is expected to be
  an HTML <button> element.

  This gives access to button-related properties such as:

  - disabled
  - innerText
  - onclick
*/
const CreateAccountButton =
  document.querySelector<HTMLButtonElement>("#CreateAccountButton");

/*
  Searches for the HTML element used to display validation and signup errors.

  HTMLElement is a general HTML element type.

  This means ErrorDiv may represent a <div> or another normal HTML element.

  Error messages will later be inserted into this element by changing
  ErrorDiv.innerText.
*/
const ErrorDiv =
  document.querySelector<HTMLElement>("#ErrorDiv");

/*
  Searches for the image beside the main password input.

  The image is used as a clickable eye icon.

  Clicking the image allows the user to switch between:

  - A hidden password
  - A visible password
*/
const PasswordEyeImg =
  document.querySelector<HTMLImageElement>("#PasswordEyeImg");

/*
  Searches for the eye icon beside the confirmation password input.

  This icon controls whether the confirmation password is hidden or visible.
*/
const ConfirmPasswordEyeImg =
  document.querySelector<HTMLImageElement>("#ConfirmPasswordEyeImg");

/*
  querySelector returns null when it cannot find an element.

  All seven elements are required for this signup page to work correctly.

  The || operator means "OR".

  Therefore, this condition becomes true if even one required element
  is missing.
*/
if (
  UsernameInput === null ||
  PasswordInput === null ||
  ConfirmPasswordInput === null ||
  CreateAccountButton === null ||
  ErrorDiv === null ||
  PasswordEyeImg === null ||
  ConfirmPasswordEyeImg === null
) {
  /*
    Stops the script immediately and reports a clear developer error.

    This error could happen when:

    - An element is missing from signup.html
    - An element id is spelled incorrectly
    - The TypeScript file is connected to the wrong page
    - The script runs before the HTML elements have been created

    Stopping here prevents less understandable errors later, such as trying
    to read `.value` or `.onclick` from null.
  */
  throw new Error(
    "signup.html is missing one or more required elements."
  );
}

/*
  Stores the path of the image that represents an open eye.

  This image is used when the password is currently hidden.

  It tells the user that clicking the icon will show the password.
*/
const openEyeSrc = "../images/open_eye.png";

/*
  Stores the path of the image that represents a closed eye.

  This image is used when the password is currently visible.

  It tells the user that clicking the icon will hide the password again.
*/
const closedEyeSrc = "../images/closed_eye.png";

/*
  Defines a reusable function for showing or hiding a password.

  This function accepts two parameters:

  input:
  The password input whose type should be changed.

  image:
  The eye image whose source and alternative text should be changed.

  The function can be reused for both the main password input and the
  confirmation password input.

  `: void` means that the function performs an action but does not return
  a value.
*/
function togglePassword(
  /*
    This parameter must contain an HTML input element.
  */
  input: HTMLInputElement,

  /*
    This parameter must contain an HTML image element.
  */
  image: HTMLImageElement
): void {
  /*
    Checks whether the input is currently using type="password".

    An input with type="password" hides its characters, usually by displaying
    dots or asterisks instead of the real text.
  */
  if (input.type === "password") {
    /*
      Changes the input type from "password" to "text".

      This makes the actual password characters visible to the user.
    */
    input.type = "text";

    /*
      Changes the eye icon to the closed-eye image.

      The closed-eye image indicates that clicking the icon again will hide
      the password.
    */
    image.src = closedEyeSrc;

    /*
      Changes the image's alternative text.

      The alt text is useful for accessibility tools such as screen readers.

      Because the password is currently visible, the action available to the
      user is now "Hide password".
    */
    image.alt = "Hide password";
  } else {
    /*
      This else block runs when the input type is not currently "password".

      In normal use, that means the input type is currently "text" and the
      password is visible.
    */

    /*
      Changes the input type back to "password".

      This hides the password characters again.
    */
    input.type = "password";

    /*
      Changes the icon back to the open-eye image.

      This indicates that clicking the icon can show the password.
    */
    image.src = openEyeSrc;

    /*
      Updates the accessible description of the image.

      The available action is now to show the hidden password.
    */
    image.alt = "Show password";
  }
}

/*
  Assigns a function to the onclick property of the main password eye icon.

  This function runs whenever the user clicks PasswordEyeImg.

  `: void` means that the click function does not return a value.
*/
PasswordEyeImg.onclick = function (): void {
  /*
    Calls the reusable togglePassword function.

    PasswordInput:
    The input that should be shown or hidden.

    PasswordEyeImg:
    The image that should change between open-eye and closed-eye.
  */
  togglePassword(PasswordInput, PasswordEyeImg);
};

/*
  Assigns a click function to the confirmation password eye icon.

  This allows the confirmation password to be shown or hidden independently
  from the original password.
*/
ConfirmPasswordEyeImg.onclick = function (): void {
  /*
    Calls togglePassword using the confirmation password input and its own
    eye icon.
  */
  togglePassword(
    ConfirmPasswordInput,
    ConfirmPasswordEyeImg
  );
};

/*
  Defines what happens when the user clicks the create-account button.

  The function is marked async because it will send a request to the server
  and wait for the server's response.

  Promise<void> means:

  - The function performs asynchronous work
  - It does not return a useful result when it finishes
*/
CreateAccountButton.onclick =
  async function (): Promise<void> {
    /*
      Reads the username entered by the user.

      `.value` gets the current text inside the input.

      `.trim()` removes spaces from the beginning and end.

      For example:

      "   Nick   "

      becomes:

      "Nick"

      A value containing only spaces becomes an empty string.
    */
    const username = UsernameInput.value.trim();

    /*
      Reads the password exactly as the user entered it.

      trim() is not used because spaces may be valid characters in a password.
    */
    const password = PasswordInput.value;

    /*
      Reads the confirmation password exactly as entered by the user.

      This value will be compared with the original password.
    */
    const confirmPassword = ConfirmPasswordInput.value;

    /*
      Clears any error message left from an earlier signup attempt.

      This ensures that the validation process starts with an empty error area.
    */
    ErrorDiv.innerText = "";

    /*
      Checks whether any required text box is empty.

      username.length === 0:
      The username is empty after removing surrounding spaces.

      password.length === 0:
      The original password is empty.

      confirmPassword.length === 0:
      The confirmation password is empty.

      Because the conditions use ||, the validation fails when at least one
      field is empty.
    */
    if (
      username.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      /*
        Displays an error explaining that all fields are required.
      */
      ErrorDiv.innerText =
        "You must fill all the text boxes.";

      /*
        Stops the signup function here.

        No additional validation is performed, and nothing is sent to
        the server.
      */
      return;
    }

    /*
      Checks whether the username contains fewer than four characters.
    */
    if (username.length < 4) {
      /*
        Displays the minimum username-length requirement.
      */
      ErrorDiv.innerText =
        "The username must contain at least 4 characters.";

      /*
        Stops the signup process because the username is too short.
      */
      return;
    }

    /*
      Checks whether the username contains more than eleven characters.
    */
    if (username.length > 11) {
      /*
        Displays the maximum username-length requirement.
      */
      ErrorDiv.innerText =
        "The username cannot contain more than 11 characters.";

      /*
        Stops the signup process because the username is too long.
      */
      return;
    }

    /*
      Compares the original password with the confirmation password.

      !== means "not strictly equal".

      The condition becomes true when the two strings do not contain exactly
      the same characters in exactly the same order.

      Password comparison is case-sensitive.

      For example:

      "Password" and "password"

      are considered different.
    */
    if (password !== confirmPassword) {
      /*
        Tells the user that the two entered passwords are different.
      */
      ErrorDiv.innerText = "Passwords do not match.";

      /*
        Stops the signup process until the two passwords match.
      */
      return;
    }

    /*
      Checks whether the password contains fewer than four characters.
    */
    if (password.length < 4) {
      /*
        Displays the minimum password-length requirement.
      */
      ErrorDiv.innerText =
        "The password must contain at least 4 characters.";

      /*
        Stops the signup process because the password is too short.
      */
      return;
    }

    /*
      Checks whether the password contains more than twelve characters.
    */
    if (password.length > 12) {
      /*
        Displays the maximum password-length requirement.
      */
      ErrorDiv.innerText =
        "The password cannot contain more than 12 characters.";

      /*
        Stops the signup process because the password is too long.
      */
      return;
    }

    /*
      Disables the signup button before contacting the server.

      This prevents the user from clicking it several times and creating
      multiple signup requests at the same time.
    */
    CreateAccountButton.disabled = true;

    /*
      Changes the text displayed on the button.

      This gives the user visual feedback that the account creation request
      is being processed.
    */
    CreateAccountButton.innerText = "Creating account...";

    /*
      Begins a try/catch/finally structure.

      try:
      Contains the code that attempts to contact the server.

      catch:
      Handles errors thrown while contacting or processing the server response.

      finally:
      Runs at the end whether the request succeeded or failed.
    */
    try {
      /*
        Sends the signup request to the backend server.

        <string | null> tells TypeScript that send is expected to return:

        - A string containing a user token when signup succeeds
        - null when the username already exists

        "Signup":
        Tells the backend which action should be performed.

        username:
        Sends the username entered by the user.

        password:
        Sends the password entered by the user.

        await pauses this async function until the server sends a response.

        It does not freeze the entire webpage. It only pauses this particular
        asynchronous function.
      */
      const userToken = await send<string | null>(
        "Signup",
        username,
        password
      );

      /*
        Checks whether the server returned null.

        In this code, null means that an account with the requested username
        already exists and the new account could not be created.
      */
      if (userToken === null) {
        /*
          Displays an error telling the user to choose another username.
        */
        ErrorDiv.innerText =
          "A user with that username already exists.";

        /*
          Stops the successful-signup section from running.

          Even though return is used here, the finally block will still run.
        */
        return;
      }

      /*
        Saves the token returned by the server in localStorage.

        "userToken" is the key used to identify the saved value.

        Other pages can read it using:

        localStorage.getItem("userToken")

        localStorage data usually remains available after refreshing the page
        or closing and reopening the browser.
      */
      localStorage.setItem("userToken", userToken);

      /*
        Stores the username in localStorage.

        This may later be used to display the user's name in the interface.

        The stored username should not be treated as secure proof of identity.
        Protected server operations should validate the user token.
      */
      localStorage.setItem("username", username);

      /*
        Redirects the browser to login.html.

        Assigning a new value to location.href causes the browser to navigate
        to that page.
      */
      location.href = "login.html";
    } catch (error) {
      /*
        This block runs if an error is thrown inside the try block.

        Possible causes include:

        - The server is unavailable
        - The network connection fails
        - The server returns an unexpected response
        - The send function throws an error
      */

      /*
        Writes the technical error to the browser's developer console.

        This helps the developer diagnose the issue without showing technical
        details directly to the user.
      */
      console.error("Signup failed:", error);

      /*
        Displays a simple connection error to the user.
      */
      ErrorDiv.innerText =
        "Could not connect to the server.";
    } finally {
      /*
        The finally block runs after the try and catch blocks.

        It runs whether:

        - Signup succeeds
        - The username already exists
        - The connection fails
        - The try block returns early

        This re-enables the signup button so that another attempt can be made.
      */
      CreateAccountButton.disabled = false;

      /*
        Restores the button's original visible text.

        After successful navigation, this change may only exist very briefly
        before login.html loads.
      */
      CreateAccountButton.innerText = "Sign Up";
    }
  };
