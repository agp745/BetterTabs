async function getAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  let tabsLRU = tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);

  if (tabsLRU.length > 5) {
    tabsLRU.splice(5);
  }

  const list = tabsLRU.map((tab, idx) => {
    return `<div id="__TABS_Tab" data-tabId="${tab.id}" data-title="${tab.title}" ${idx === 1 ? 'class="__TABS_Focused"' : ""}>${tab.title}</div>`;
  });

  return list.join("");
}

//Generates HTML
async function tabScript(tabList) {
  const body = document.querySelector("body");
  const tabMenuContainer = `
<main id="__TABS_Body">
  <section id="__TABS_List">${tabList}</section>
</main>`;

  body.innerHTML += tabMenuContainer;
}

// API -> listens for message to send down HTML
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "loadScript":
      injectScript(sender, sendResponse);
      break;
    case "removeScript":
      removeScript(sender, sendResponse);
      break;
    case "navigate":
      console.log("API HIT");
      navigateToTab(sendResponse, request.payload);
      break;
    case "showSearchBar":
      console.log("search bar active");
      injectSearchBar(sender, sendResponse);
      break;
    case "search":
      searchQuery(sendResponse, request.payload);
      break;
    default:
      sendResponse({ success: false, error: "unknown message type" });
  }

  return true;
});

async function injectScript(sender, sendResponse) {
  try {
    const tabList = await getAllTabs();

    // JS + CSS injection
    chrome.scripting.insertCSS(
      {
        target: {
          tabId: sender.tab.id,
        },
        files: ["assets/styles.css"],
      },
      () => {
        chrome.scripting
          .executeScript({
            target: { tabId: sender.tab.id },
            func: tabScript,
            args: [tabList],
          })
          .then(() => console.log("script loaded successfully\n", sender));
      },
    );
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function removeScript(sender, sendResponse) {
  try {
    chrome.scripting.removeCSS(
      {
        target: {
          tabId: sender.tab.id,
        },
        files: ["assets/styles.css"],
      },
      () => console.log("CSS Removed"),
    );
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

function navigateToTab(sendResponse, tabId) {
  try {
    chrome.tabs.update(tabId, { active: true }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
        return;
      }
      sendResponse({ success: true });
    });
  } catch (error) {
    console.error(error);
  }
}

// --------------- Search Functionality

function searchBar() {
  const body = document.querySelector("body");
  const searchBar = `
   <div id="__TABS_Body">
     <input type="search" id="__TABS_SearchBar" placeholder="Search or Enter URL..."/>
   </div>`;
  body.innerHTML += searchBar;

  const searchBarInput = document.querySelector("#__TABS_SearchBar");
  searchBarInput.focus();
}

function searchQuery(sendResponse, value) {
  chrome.search.query(
    {
      disposition: "NEW_TAB",
      text: value,
    },
    () => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
        return;
      }
      sendResponse({ success: true });
    },
  );
}

function injectSearchBar(sender, sendResponse) {
  try {
    chrome.scripting.insertCSS(
      {
        target: { tabId: sender.tab.id },
        files: ["assets/styles.css"],
      },
      () => {
        chrome.scripting
          .executeScript({
            target: { tabId: sender.tab.id },
            func: searchBar,
          })
          .then(() => console.log("search bar injected successfully"));
      },
    );
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function removeSearchBar(sender, sendResponse) {
  try {
    chrome.scripting.removeCSS(
      {
        target: {
          tabId: sender.tab.id,
        },
        files: ["assets/styles.css"],
      },
      () => console.log("CSS Removed"),
    );
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}
