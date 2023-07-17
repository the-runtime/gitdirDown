function recieveMessage(message, sender, sendResponse)  {
    console.log("message recieved")
    if (message.action === 'download') {
        const anchor = document.createElement('a');
        anchor.href = message.dataUrl;
        anchor.download = message.filename;
        anchor.click();
        sendResponse({success:true})

        setTimeout(function() {
            window.close()
        }, 5000);

    } else {
    sendResponse({success: false})}


}

document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.onMessage.addListener(recieveMessage)

});
