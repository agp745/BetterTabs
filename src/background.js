async function getAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  const list = tabs.map((tab) => {
    return `<div id="__TABS_Tab">${tab.title}</div>`;
  });

  return list.join("");
}

async function getTabId() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab.id;
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
  if (request.action === "loadScript") {
    loadScript(sender, sendResponse);
  }
  if (request.action === "removeScript") {
    console.log("yerr");
  } else {
    sendResponse({ success: false, error: "unknown message type" });
  }
  return true;
});

async function loadScript(sender, sendResponse) {
  try {
    const tabId = await getTabId();
    const tabList = await getAllTabs();

    // JS + CSS injection
    chrome.scripting.insertCSS(
      {
        target: {
          tabId: tabId,
        },
        files: ["assets/styles.css"],
      },
      () => {
        chrome.scripting
          .executeScript({
            target: { tabId: tabId },
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
