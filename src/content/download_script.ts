// function recieveMessage(message, sender, sendResponse)  {
//     console.log("message recieved")
//     if (message.action === 'download') {
//         const anchor = document.createElement('a');
//         anchor.href = message.dataUrl;
//         anchor.download = message.filename;
//         anchor.click();
//         sendResponse({success:true})
//
//         setTimeout(function() {
//             window.close()
//         }, 5000);
//
//     } else {
//     sendResponse({success: false})}
//
//
// }
//
// document.addEventListener('DOMContentLoaded', function() {
//     chrome.runtime.onMessage.addListener(recieveMessage)
//
// });

import OnClickData = chrome.contextMenus.OnClickData;
import {GitTypes} from "./gitTypes";
import * as JSZip from "jszip";
import {DownTypes} from "./downTypes";
import MessageSender = chrome.runtime.MessageSender;
import {type} from "os";


async function downGitFile(url: string){
    console.log("download", url)
    let data = await fetch(url)
    return await data.arrayBuffer()
}

async function getGitInfo(url: string) {
    console.log(url)
    let data = await fetch(url)
    return await data.json()
}

async function processGit(downFile: DownTypes, data:GitTypes[], folderName: string) {

    await Promise.all(data.map(async (item: GitTypes) => {
        if (item.type === "dir") {
            const temdata: GitTypes[] = await getGitInfo(item.url)
            await processGit(downFile, temdata, folderName + "/" + item.name)

        } else if (item.type === "file") {
            const tempFile =await downGitFile(item.download_url ?? "")
            downFile.zipFile.file(folderName+"/"+item.name, tempFile)
        }
    })
    )

}

// to recieve message() from background page

function recieveMessage(linkurl : string, sender: MessageSender){
    let urlInfoList = linkurl.split("/")

    let downfile: DownTypes = {
        zipFile: new JSZip(),
        authorName: urlInfoList[3],
        repoName: urlInfoList[4],
        branch: urlInfoList[6],
        folderName: urlInfoList.pop() ?? "",
        initUrl: linkurl ?? ""
    }

    let folderName: string = downfile.folderName
    let forFirstUrl = linkurl.split(downfile.branch)
    let firstUrl = 'https://api.github.com/repos/'+downfile.authorName+'/'+downfile.repoName+'/contents'+forFirstUrl.pop()+'?ref='+downfile.branch
    console.log(firstUrl)

    getGitInfo(firstUrl).then(async(data:GitTypes[]) => {
        await processGit(downfile, data, folderName)
        const content = await downfile.zipFile.generateAsync({type: 'blob'})
        const zipFile = new Blob([content], {type: 'application/zip'})

        const reader = new FileReader();
        reader.onloadend = () => {
            const tempdataurl = reader.result
            if( !(typeof (tempdataurl) === "string")) {
                console.log("Some error occured, type is ", typeof (tempdataurl))
                return
            }
            const anchor = document.createElement('a');
            anchor.href = tempdataurl
            anchor.download = folderName
            anchor.click()

            setTimeout(function () {
                window.close()
            }, 3000)

        }
    })
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.onMessage.addListener(recieveMessage)
})