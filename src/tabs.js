const body = document.querySelector("body");

let ctrlHeld = false;
let isScriptLoaded = false;

function loadScript() {
  curr = 1;
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

// direction: "next" | "back"
let curr = 1;
function navigateTabs(direction) {
  const tabList = document.querySelectorAll("#__TABS_Tab");
  tabList[curr].classList.remove("__TABS_Focused");

  switch (direction) {
    case "next":
      if (curr === tabList.length - 1) {
        curr = 0;
        tabList[curr].classList.add("__TABS_Focused");
        return;
      }
      curr += 1;
      tabList[curr].classList.add("__TABS_Focused");
      break;
    case "back":
      if (curr === 0) {
        curr = tabList.length - 1;
        tabList[curr].classList.add("__TABS_Focused");
        return;
      }
      curr -= 1;
      tabList[curr].classList.add("__TABS_Focused");
      break;
    default:
      console.error("unexpected direction input");
  }
}

function selectTab() {
  const focusedDiv = document.querySelector(".__TABS_Focused");
  console.log(focusedDiv.dataset);

  chrome.runtime.sendMessage(
    { action: "navigate", payload: Number(focusedDiv.dataset.tabid) },
    (response) => {
      if (!response.success) {
        console.error(response.error);
        return;
      }
      console.log(`navigated to ${focusedDiv.dataset.tabid}`);
    },
  );
}

body.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    ctrlHeld = true;
  }

  if (ctrlHeld && e.key === "n") {
    if (!isScriptLoaded) {
      loadScript();
    } else {
      navigateTabs("next");
    }
  }
  if (ctrlHeld && e.key === "b" && isScriptLoaded) {
    navigateTabs("back");
  }
  if (ctrlHeld && e.key === "Escape" && isScriptLoaded) {
    console.log("escaped");
    removeScript();
  }
});

body.addEventListener("keyup", (e) => {
  if (e.key === "Control") {
    ctrlHeld = false;
    selectTab();
    removeScript();
  }
});
