document.addEventListener("DOMContentLoaded",()=>{
    let openTabButton = document.getElementById("openPage")
    openTabButton.addEventListener("click",() =>{
        chrome.tabs.create({url:"https://github.com/the-runtime/gitdirDown"})
    })
})