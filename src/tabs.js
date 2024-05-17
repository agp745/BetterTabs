// const tabList = document.querySelector(".tabList");

async function getAllTabs(tabsBodyId) {
  const body = document.querySelector(`#${tabsBodyId}`);
  const tabs = await chrome.tabs.query({ currentWindow: true });

  const list = tabs.map((tab) => {
    return `<div class="__TABS_Tab">${tab.title}</div>`;
  });

  body.innerHTML += list.join("");
}

async function getTabId() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab.id;
}

//inject script
async function tabScript() {
  const TabsBodyId = "__TABS_Body";
  const body = document.querySelector("body");
  const tabMenuContainer = `<main id="${TabsBodyId}"><div>div1</div><div>div2</div></main>`;
  // await getAllTabs(TabsBodyId);

  body.innerHTML += tabMenuContainer;
  console.log("THIS IS FROM THE SCRIPT!");
}

async function loadScript() {
  const tabId = await getTabId();

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
        })
        .then(() => console.log("script loaded"));
    },
  );
}

loadScript();
// getAllTabs();
