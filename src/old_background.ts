import OnClickData = chrome.contextMenus.OnClickData;
import {GitTypes} from "./content/gitTypes"
import {DownMessage, DownTypes} from "./content/downTypes";
import * as JSZip from "jszip";


async function getGitInfo(url: string ){
    console.log(url)
    let data = await fetch(url)
    return await data.json()
}
async function downGitFile(url: string ){
    console.log("download" , url)
    let data = await fetch(url)
    return await data.arrayBuffer()
}


async function processGit(downFile: DownTypes,data: GitTypes[], folderName: string) {

    await Promise.all(data.map(async (item) => {
        if (item.type === "dir"){
            const temdata: GitTypes[] = await getGitInfo(item.url)
            await processGit(downFile,temdata,folderName+"/"+item.name) // need some changes

        }else if (item.type==="file") {
            // let tempFile
            const temfile = await downGitFile(item.download_url ?? "")
            downFile.zipFile.file(folderName+"/"+item.name, temfile)

        }

    })
    )
}


//at time of installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "gitdl_id",
        title: "gitdirDown - Download Github folder",
        enabled: true,
        contexts:["link"]
    })
    // chrome.contextMenus.onClicked.addListener(clicked)
})


//enable this at startup of the profile
chrome.runtime.onStartup.addListener(() => {
    chrome.contextMenus.create({
        id: "gitdl_id",
        title: "Download folder",
        enabled: true,
        contexts:["link"]
    })
    // chrome.contextMenus.onClicked.addListener(clicked)
})

chrome.contextMenus.onClicked.addListener(clicked)


async function clicked (info:OnClickData) {
    if (info.pageUrl.slice(0,18) == "https://github.com") {
        if (info.linkUrl == undefined) {
            return
        }

        let urlInfoList = info.linkUrl.split("/")



        let  downfile: DownTypes =  {
            zipFile: new JSZip(),
            authorName: urlInfoList[3],
            repoName: urlInfoList[4],
            branch: urlInfoList[6],
            folderName: urlInfoList.pop() ?? "",
            initUrl:info.linkUrl ?? ""
        }
        let  folderName: string = downfile.folderName
        let forFirstUrl = info.linkUrl.split(downfile.branch)
        let firstUrl: string = "https://api.github.com/repos/"+downfile.authorName+"/"+downfile.repoName+"/contents"+forFirstUrl.pop()+"?ref="+downfile.branch
        console.log(firstUrl)

        getGitInfo(firstUrl).then(async  (data:GitTypes[]) => {

                //debug
                // console.log(data)
                let tab_id : number
                chrome.tabs.create({url: chrome.runtime.getURL("download.html")},async (tab)=>{
                    tab_id = tab.id ?? 0
                })

                await processGit(downfile,data,folderName )
                const content = await downfile.zipFile.generateAsync({type: 'blob'})
                const zipFile = new Blob([content], {type: 'application/zip'})


                const reader = new FileReader();
                reader.onloadend =  () => {
                    const tempdataUrl = reader.result
                    if (!(typeof (tempdataUrl) === "string")) {
                        console.log("some error type is ", typeof (tempdataUrl))
                        return
                    }
                    // console.log(dataUrl)
                    let message: DownMessage = {
                        action: 'download', dataUrl: tempdataUrl, filename: folderName + ".zip"
                    }
                    chrome.tabs.sendMessage(tab_id, message, () => {
                        console.log("hellp world")
                    })
                }

                reader.readAsDataURL(zipFile)


        })

    }

}




