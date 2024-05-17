//inject script
async function tabScript(tabList) {
  const body = document.querySelector("body");
  const tabMenuContainer = `
<main id="__TABS_Body">
  <section id="__TABS_List">${tabList}</section>
</main>`;

  body.innerHTML += tabMenuContainer;
}

async function loadScript() {
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
        .then(() => console.log("script loaded"));
    },
  );
}

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

loadScript();
