chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({url: "popup.html"})
})

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({url: "popup.html"})
    }
})
