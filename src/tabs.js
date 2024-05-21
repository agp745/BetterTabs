const body = document.querySelector("body");

let ctrlHeld = false;
let isScriptLoaded = false;

function loadScript() {
  isScriptLoaded = true;
  chrome.runtime.sendMessage({ action: "loadScript" }, (response) => {
    if (!response.success) {
      console.log(response.error);
      return;
    }
    console.log("script loaded successfully");
  });
}

function removeScript() {
  isScriptLoaded = false;
  const tabsBody = document.querySelector("#__TABS_Body");

  if (tabsBody) {
    tabsBody.remove();
  } else {
    console.error("__TABS_Body is not found");
  }

  chrome.runtime.sendMessage({ action: "removeScript" }, (response) => {
    if (!response.success) {
      console.log(response.error);
      return;
    }
  });
}

body.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    ctrlHeld = true;
  }

  if (ctrlHeld && e.key === "n") {
    if (!isScriptLoaded) {
      loadScript();
    } else {
      console.log("NEXT");
    }
  }
  if (ctrlHeld && e.key === "b" && isScriptLoaded) {
    console.log("BACK");
  }
  if (ctrlHeld && e.key === "Escape" && isScriptLoaded) {
    console.log("escaped");
    removeScript();
  }
});

// currently just removes BUT NEEDS TO SELECT
body.addEventListener("keyup", (e) => {
  if (e.key === "Control") {
    ctrlHeld = false;
    console.log("SELECTED");
    removeScript();
  }
});
