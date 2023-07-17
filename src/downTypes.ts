import * as JSZip from "jszip";

export  interface DownTypes {
    zipFile:  JSZip,
    authorName: string,
    repoName: string,
    folderName: string,

    initUrl: string,
    branch : string
}

export interface DownMessage {
    action:  string,
    dataUrl: string,
    filename: string
}