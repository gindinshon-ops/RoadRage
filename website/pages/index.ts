const buttons =
  document.querySelectorAll<HTMLButtonElement>(
    ".menu-container button"
  );

const finger =
  document.querySelector<HTMLDivElement>(
    "#finger-pointer"
  );

const menuContainer =
  document.querySelector<HTMLDivElement>(
    ".menu-container"
  );

const lvl1btn =
  document.querySelector<HTMLButtonElement>(
    "#lvl1btn"
  );

const lvl2btn =
  document.querySelector<HTMLButtonElement>(
    "#lvl2btn"
  );

const lvl3btn =
  document.querySelector<HTMLButtonElement>(
    "#lvl3btn"
  );

if (
  finger === null ||
  menuContainer === null ||
  lvl1btn === null ||
  lvl2btn === null ||
  lvl3btn === null
) {
  throw new Error(
    "index.html is missing one or more required elements."
  );
}

lvl1btn.onclick = function (): void {
  location.href = "1.html";
};

lvl2btn.onclick = function (): void {
  location.href = "2.html";
};

lvl3btn.onclick = function (): void {
  location.href = "3.html";
};

buttons.forEach(function (
  button: HTMLButtonElement
): void {
  button.addEventListener(
    "mouseenter",
    function (): void {
      finger.style.opacity = "1";

      const buttonTop = button.offsetTop;
      const buttonHeight = button.offsetHeight;
      const fingerHeight = finger.offsetHeight;

      const fingerTop =
        buttonTop +
        buttonHeight / 2 -
        fingerHeight / 2;

      finger.style.top = `${fingerTop}px`;
    }
  );
});

menuContainer.addEventListener(
  "mouseleave",
  function (): void {
    finger.style.opacity = "0";
  }
);