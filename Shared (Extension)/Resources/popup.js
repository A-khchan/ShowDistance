//console.log("Hello World!", browser);

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("popup Received request: ", request);
    if (request.isActive === "true") {
        document.getElementById("activateCheckbox").checked = true;
    } else {
        document.getElementById("activateCheckbox").checked = false;
    }
    
});


function sendToggleMsg() {
    //Send message to content.js
    sendMessageToContent({"pop": "toggle"});
}


function sendMessageToContent(message) {
    browser.tabs.query({ active: true }).then(function (currentTabs) {
        if (currentTabs[0].id >= 0) {
            browser.tabs.sendMessage(currentTabs[0].id, message);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    sendMessageToContent({"messageFromPop": "checkIfActive"});
    
    document.getElementById("activateCheckbox").addEventListener("change", sendToggleMsg);
    
});
