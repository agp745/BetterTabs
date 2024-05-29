const body = document.querySelector("body");

let isCtrlHeld = false;
let isScriptLoaded = false;
let isSearchBarLoaded = false;

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
    isCtrlHeld = true;
  }

  if (isCtrlHeld && e.key === "n") {
    if (!isScriptLoaded) {
      loadScript();
    } else {
      navigateTabs("next");
    }
  }
  if (isCtrlHeld && e.key === "b" && isScriptLoaded) {
    navigateTabs("back");
  }
  if (isCtrlHeld && e.key === "Escape" && isScriptLoaded) {
    console.log("escaped");
    removeScript();
  }
});

body.addEventListener("keyup", (e) => {
  if (e.key === "Control" && isScriptLoaded) {
    isCtrlHeld = false;
    selectTab();
    removeScript();
  }
});

chrome.runtime.sendMessage({ action: "captureImage" }, (response) => {
  if (!response.success) {
    console.error(response.error);
    return;
  }
  console.log("tab image captured");
});

//------------ New Tab Search Functionality

function search(value) {
  chrome.runtime.sendMessage(
    { action: "search", payload: value },
    (response) => {
      if (!response.success) {
        console.error(response.error);
        return;
      }
      removeScript();
      console.log("search api hit");
    },
  );
}

function showSearchBar() {
  chrome.runtime.sendMessage({ action: "showSearchBar" }, (response) => {
    if (!response.success) {
      console.log(response.error);
      return;
    }
    isSearchBarLoaded = true;
    isCtrlHeld = false;
  });
}

body.addEventListener("keydown", (e) => {
  if (!isSearchBarLoaded) {
    if (e.ctrlKey && e.key === "t") {
      showSearchBar();
    }
  }
  if (e.key === "Escape") {
    isSearchBarLoaded = false;
    removeScript();
  }
});

// Observer is used because I have to capture the input from
// the "client" and send it to the "server"/background for
// query to properly work. Therefore, I have to observe
// the DOM to check when the searchbar is mounted.
const observer = new MutationObserver((_, obs) => {
  if (isSearchBarLoaded) {
    const searchBarInput = document.querySelector("#__TABS_SearchBar");
    searchBarInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        console.log(searchBarInput.value);
        search(searchBarInput.value);
      }
    });
    obs.disconnect();
  }

  // IS THIS WORKING?!?!?!
  // if (isScriptLoaded) {
  //   chrome.runtime.sendMessage({ action: "captureImage" }, (response) => {
  //     if (!response.success) {
  //       console.error(response.error);
  //       return;
  //     }
  //     console.log("tab image captured on script activation");
  //   });
  //   obs.disconnect();
  // }
});

observer.observe(document, {
  childList: true,
  subtree: true,
});
