/*
 * Import the send function from the clientUtilities module.
 *
 * The send function is responsible for communicating with the backend server.
 * In this file, it will be used to send the username and password to the
 * server's "Login" endpoint.
 *
 * This import assumes that the project is configured so TypeScript can resolve
 * the module name "clientUtilities". Depending on the project configuration,
 * this may refer to:
 *
 * - A path alias configured in tsconfig.json
 * - A module available through node_modules
 * - A project-specific module resolver
 *
 * If clientUtilities.ts is simply another file in the same directory,
 * the import may instead need to be:
 *
 *     import { send } from "./clientUtilities";
 */
import { send } from "clientUtilities";

/*
 * Search the HTML document for the element whose ID is "UsernameInput".
 *
 * document.querySelector() searches the current page using a CSS selector.
 * The "#" symbol means that we are searching by element ID.
 *
 * The generic type:
 *
 *     <HTMLInputElement>
 *
 * tells TypeScript that the expected element is an <input> element. This gives
 * us access to input-specific properties such as:
 *
 *     UsernameInput.value
 *
 * querySelector() can return either:
 *
 * - HTMLInputElement: if the element was found
 * - null: if no matching element exists
 *
 * TypeScript therefore infers the variable's type as:
 *
 *     HTMLInputElement | null
 */
const UsernameInput =
  document.querySelector<HTMLInputElement>("#UsernameInput");

/*
 * Find the password input in login.html.
 *
 * This expects an HTML element similar to:
 *
 *     <input id="PasswordInput" type="password">
 *
 * Setting type="password" in the HTML hides the entered characters visually,
 * but the actual password is still available in JavaScript through .value.
 */
const PasswordInput =
  document.querySelector<HTMLInputElement>("#PasswordInput");

/*
 * Find the button that submits the login request.
 *
 * The generic type HTMLButtonElement gives TypeScript knowledge of
 * button-specific properties, including:
 *
 * - disabled
 * - innerText
 * - onclick
 * - click()
 *
 * This expects an HTML element similar to:
 *
 *     <button id="LoginSubmitButton">Login</button>
 */
const LoginSubmitButton =
  document.querySelector<HTMLButtonElement>("#LoginSubmitButton");

/*
 * Find the paragraph used to display validation and login error messages.
 *
 * This expects an element similar to:
 *
 *     <p id="ErrorMessage"></p>
 *
 * The paragraph will be hidden when there is no error and made visible when
 * the user enters invalid information or when login fails.
 */
const ErrorMessage =
  document.querySelector<HTMLParagraphElement>("#ErrorMessage");

/*
 * Verify that all required HTML elements were successfully found.
 *
 * Because querySelector() may return null, we must check the result before
 * using properties such as .value, .disabled, or .innerText.
 *
 * The logical OR operator || means that this condition becomes true when
 * at least one of the four variables is null.
 */
if (
  UsernameInput === null ||
  PasswordInput === null ||
  LoginSubmitButton === null ||
  ErrorMessage === null
) {
  /*
   * Stop the script immediately and create a clear developer-facing error.
   *
   * This error usually means one of the following:
   *
   * 1. An element is missing from login.html.
   * 2. An element's ID is spelled differently in HTML and TypeScript.
   * 3. The script ran before the HTML elements were created.
   * 4. The wrong TypeScript/JavaScript file was loaded by the page.
   *
   * Throwing an error here is better than allowing the program to continue,
   * because continuing would cause a less understandable error such as:
   *
   *     Cannot read properties of null
   *
   * After this check succeeds, TypeScript understands that all four variables
   * contain real HTML elements rather than null.
   */
  throw new Error(
    "login.html is missing one or more required elements."
  );
}

/*
 * Assign a function to the button's onclick property.
 *
 * This function runs whenever the user clicks the login button.
 *
 * The function is marked async because it uses await while waiting for
 * the server's login response.
 *
 * Promise<void> means:
 *
 * - The function works asynchronously and therefore returns a Promise.
 * - The completed function does not produce a useful return value.
 */
LoginSubmitButton.onclick =
  async function (): Promise<void> {
    /*
     * Read the current text from the username input.
     *
     * .value always returns a string.
     *
     * .trim() removes whitespace from the beginning and end of the username.
     *
     * Examples:
     *
     *     "  Nick  " becomes "Nick"
     *     "       " becomes ""
     *
     * This prevents a username made only of spaces from passing validation.
     */
    const username = UsernameInput.value.trim();

    /*
     * Read the password exactly as the user entered it.
     *
     * We intentionally do not call .trim() on the password. Spaces may be
     * valid password characters, especially at the beginning or end.
     *
     * For example, these passwords may intentionally be different:
     *
     *     "secret"
     *     " secret"
     *     "secret "
     */
    const password = PasswordInput.value;

    /*
     * Clear any error left over from an earlier login attempt.
     *
     * Setting visibility to "hidden" makes the paragraph invisible while
     * preserving its place in the page layout.
     *
     * This differs from:
     *
     *     display: none
     *
     * which would remove the element's occupied layout space.
     */
    ErrorMessage.style.visibility = "hidden";

    /*
     * Remove the previous error message's text.
     *
     * innerText represents the visible text contained inside the paragraph.
     */
    ErrorMessage.innerText = "";

    /*
     * Perform client-side validation before contacting the server.
     *
     * username.length === 0 means that the username is empty after trim().
     *
     * password.length === 0 means that no password characters were entered.
     *
     * The logical OR operator || means that the error is shown when either
     * the username or password is empty.
     *
     * Client-side validation improves the user experience, but the server must
     * still perform its own validation because browser-side code can be
     * modified or bypassed.
     */
    if (username.length === 0 || password.length === 0) {
      /*
       * Set the validation message that will be shown to the user.
       */
      ErrorMessage.innerText =
        "You must enter a username and password.";

      /*
       * Make the error paragraph visible.
       */
      ErrorMessage.style.visibility = "visible";

      /*
       * Stop the login function here.
       *
       * Because the validation failed, no request is sent to the server.
       */
      return;
    }

    /*
     * Disable the login button before sending the request.
     *
     * This prevents the user from clicking the button repeatedly and creating
     * several login requests at the same time.
     */
    LoginSubmitButton.disabled = true;

    /*
     * Change the button text so the user knows that the login request is being
     * processed.
     */
    LoginSubmitButton.innerText = "Logging in...";

    /*
     * Start a try/catch/finally block.
     *
     * try:
     *     Contains operations that may fail, especially the server request.
     *
     * catch:
     *     Runs if an exception occurs inside the try block.
     *
     * finally:
     *     Runs after try/catch completes, whether the request succeeded,
     *     failed, or returned early.
     */
    try {
      /*
       * Send the login request to the server.
       *
       * The first argument, "Login", identifies the backend action or endpoint.
       *
       * The second and third arguments contain the login credentials:
       *
       *     username
       *     password
       *
       * await pauses this async function until the server responds. It does
       * not freeze the browser; the browser can continue processing other UI
       * activity while waiting.
       *
       * The generic type:
       *
       *     <string | null>
       *
       * tells TypeScript that we expect send() to return either:
       *
       * - string: a valid login token
       * - null: the login credentials were rejected
       *
       * The exact meaning depends on the backend implementation.
       */
      const userToken = await send<string | null>(
        "Login",
        username,
        password
      );

      /*
       * Check whether the server rejected the username/password combination.
       *
       * This code assumes that the backend returns null when the login details
       * are incorrect.
       *
       * A strict comparison with === is used so that only the actual null
       * value matches this condition.
       */
      if (userToken === null) {
        /*
         * Tell the user that the credentials were not accepted.
         *
         * This deliberately does not reveal whether the username or password
         * was wrong. That is safer because it does not help an attacker discover
         * which usernames exist.
         */
        ErrorMessage.innerText =
          "Wrong username or password.";

        /*
         * Display the error message.
         */
        ErrorMessage.style.visibility = "visible";

        /*
         * Stop processing this login attempt.
         *
         * Although this return is inside the try block, the finally block below
         * will still run before the function finishes.
         */
        return;
      }

      /*
       * Store the login token in the browser's localStorage.
       *
       * localStorage stores string-based key/value data for the current website.
       * Its data normally remains available after:
       *
       * - Reloading the page
       * - Closing and reopening the browser
       * - Navigating to another page on the same website
       *
       * The key is "userToken", and its value is the token returned by the
       * backend.
       *
       * Other protected pages can read it with:
       *
       *     localStorage.getItem("userToken")
       *
       * Important security note:
       *
       * localStorage can be accessed by JavaScript running on the same origin.
       * Therefore, an XSS vulnerability could expose the token. A production
       * application may instead use a Secure, HttpOnly, SameSite cookie,
       * depending on the application's authentication design.
       */
      localStorage.setItem("userToken", userToken);

      /*
       * Store the username separately.
       *
       * This may be used by other pages to display something such as:
       *
       *     Welcome, Nick
       *
       * This username value is only browser-side display data. It should not be
       * treated as proof of identity. The server must use and validate the token
       * for protected operations.
       */
      localStorage.setItem("username", username);

      /*
       * Redirect the browser to main1.html after successful login.
       *
       * Assigning a new value to location.href starts navigation to that page.
       *
       * This creates a normal browser-history entry, meaning the user may be
       * able to press the Back button and return to login.html.
       */
      location.href = "main1.html";
    } catch (error) {
      /*
       * This block runs when an exception is thrown inside the try block.
       *
       * Possible causes include:
       *
       * - The backend server is unavailable
       * - A network request failed
       * - The server returned an unexpected response
       * - The send() function threw an error while processing the response
       * - A browser or application-level error occurred
       */

      /*
       * Write the complete technical error to the browser's developer console.
       *
       * This helps developers diagnose the real problem without exposing
       * technical details to the normal user interface.
       */
      console.error("Login failed:", error);

      /*
       * Show the user a simple, understandable error message.
       *
       * We avoid displaying the raw error object because it may be confusing
       * and could expose internal implementation details.
       */
      ErrorMessage.innerText =
        "Could not connect to the server.";

      /*
       * Make the connection error visible.
       */
      ErrorMessage.style.visibility = "visible";
    } finally {
      /*
       * Re-enable the login button after the login attempt completes.
       *
       * The finally block runs in all of these situations:
       *
       * - The login succeeds
       * - The server returns null
       * - The request throws an exception
       * - The function executes return inside the try block
       *
       * After a successful login, navigation to main1.html has already started,
       * so this reset may only be visible very briefly.
       */
      LoginSubmitButton.disabled = false;

      /*
       * Restore the button's original text.
       */
      LoginSubmitButton.innerText = "Login";
    }
  };

/*
 * Add a keyboard event listener to the password input.
 *
 * This allows the user to press Enter after typing the password instead of
 * having to click the Login button manually.
 *
 * addEventListener is used here rather than assigning to onkeydown.
 * addEventListener allows multiple independent keydown listeners to coexist.
 */
PasswordInput.addEventListener(
  /*
   * "keydown" fires when the user presses a keyboard key down.
   *
   * It occurs before the corresponding "keyup" event.
   */
  "keydown",

  /*
   * This callback receives a KeyboardEvent object containing information about
   * the pressed key.
   *
   * The function returns void because it performs an action but does not return
   * a meaningful result.
   */
  function (event: KeyboardEvent): void {
    /*
     * Check whether the pressed key was Enter.
     *
     * event.key contains the logical name of the key, such as:
     *
     * - "Enter"
     * - "Escape"
     * - "ArrowUp"
     * - "a"
     */
    if (event.key === "Enter") {
      /*
       * Programmatically click the login button.
       *
       * This executes the same onclick function defined above, ensuring that
       * mouse login and keyboard login use exactly the same validation and
       * server-request logic.
       *
       * If the button is disabled while another login request is running,
       * calling click() does not trigger another normal button click.
       */
      LoginSubmitButton.click();
    }
  }
);