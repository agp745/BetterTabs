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
  if (e.ctrlKey && e.key === "n") {
    loadScript();
  }
  if (e.key === "n") {
    console.log("NEXT");
  }
  if (e.key === "b") {
    console.log("BACK");
  }
  if (e.key === "Escape") {
    removeScript();
  }

  console.log(e);
});

// currently just removes BUT NEEDS TO SELECT
body.addEventListener("keyup", (e) => {
  if (e.key === "Control") {
    removeScript();
  }
});
