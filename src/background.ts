import OnClickData = chrome.contextMenus.OnClickData;

chrome.runtime.onStartup.addListener(() => {
    chrome.contextMenus.create( {
        id: "gitdl_id",
        title: "gitdirDown - Download Github folder",
        enabled: true,
        contexts:["link"]
    })
})
chrome.runtime.onInstalled.addListener(() => {
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
            setTimeout( function () {
                console.log("after 2 secs")
                chrome.tabs.sendMessage(tab.id ?? 0 ,info.linkUrl)
            }, 500)

        })
    }
})