async function getAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  let tabsLRU = tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);

  if (tabsLRU.length > 5) {
    tabsLRU.splice(5);
  }

  const list = tabsLRU.map((tab, idx) => {
    // if (idx === 0) {
    //   return `<div id="__TABS_Tab" data-tabId="${tab.id}" data-title="${tab.title}" class="__TABS_Focused">${tab.title}</div>`;
    // }
    return `<div id="__TABS_Tab" data-tabId="${tab.id}" data-title="${tab.title}" ${idx === 0 ? 'class="__TABS_Focused"' : ""}>${tab.title}</div>`;
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
    console.log(sender);
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
