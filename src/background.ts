import OnClickData = chrome.contextMenus.OnClickData;

chrome.runtime.onStartup.addListener(() => {
    chrome.contextMenus.create( {
        id: "gitdl_id",
        title: "gitdirDown - Download Github folder",
        enabled: true,
        contexts:["link"]
    })
})

chrome.contextMenus.onClicked.addListener((info: OnClickData) => {
    if (info.pageUrl.slice(0, 18) == "https://github.com") {
        if (info.linkUrl == undefined) {
            return
        }

        chrome.tabs.create({url: chrome.runtime.getURL("content/download.html")}, (tab) => {
            if (typeof(tab.id) != "number"){
                console.log("Problem creating new tab with download page")
                return
            }
            chrome.tabs.sendMessage(tab.id,info.linkUrl)
        })
    }
})