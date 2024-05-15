const tabList = document.querySelector(".tabList");

async function getAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  console.log(tabs);

  const list = tabs.map((tab) => {
    return `<div class="tab">${tab.title}</div>`;
  });

  tabList.innerHTML += list.join("");
}

getAllTabs();
