
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("background: Received request: ", request);
    //console.log("background: sender is : ", sender);
    
    if (request.greeting === "hello") {
        console.log("background: hello received");
        
        sendResponse({ farewell: "goodbye" });
        return true;
    } else if (request.name === "getDistance") {
        console.log("background: request of getDistance received in background");
        
        //safari object can be found in background.js, but not in content.js
        //safari.extension.dispatchMessage("selectedText", { text: "test" });
        
        const message = {
            "address": request.address,
            "latitude": request.latitude,
            "longitude": request.longitude
        };
        
        //Send message to SafariWebExtensionHandler and get response
        //The first parameter below will be ignored, so, passing anything to it works
        browser.runtime.sendNativeMessage("whatever", message)
                .then(response => {
                    console.log("Response from native app:", response);
                    
                    if (response.result === "error") {
                        console.log("Error replied from native app");
                        sendResponse({ distance: response.distance, "result": "error"});
                    } else {
                        sendResponse({ distance: response.distance, "result": "success", "bearing": response.bearing});
                    }
                })
                .catch(error => {
                    console.error("Error sending message to native app:", error);
                    sendResponse({ distance: "error finding distance", "result": "error"} );
                });
        
        //The below return true is necessary to enable content.js to get response
        return true;
        
    }
    
    //The below line is not needed. But it still works if this line is added.
    //return true;
});



