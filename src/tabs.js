const body = document.querySelector("body");

function loadScript() {
  chrome.runtime.sendMessage({ action: "loadScript" }, (response) => {
    if (!response.success) {
      console.log(response.error);
      return;
    }
    console.log("script loaded successfully");
  });
}

function removeScript() {
  chrome.runtime.sendMessage({ action: "removeScript" }, (response) => {
    if (response && !response.success) {
      console.log(response.error);
      return;
    }

    console.log("removed script successfully");
  });
}

body.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "n") {
    loadScript();
  }
  if (e.key === "Escape") {
    removeScript();
  }

  console.log(e);
});
