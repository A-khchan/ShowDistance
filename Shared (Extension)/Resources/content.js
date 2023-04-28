var extIsActive = true;
var lastText = "";

browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
    console.log("Content: Received response: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);
    if (request.pop === "toggle") {
        extIsActive = !extIsActive
    } else if (request.messageFromPop === "checkIfActive") {
        if (extIsActive) {
            var isActiveMsg = "true";
        } else {
            isActiveMsg = "false";
        }
        
        browser.runtime.sendMessage({ isActive: isActiveMsg }).then((response) => {
            console.log("Content: Received response: ", response);
        });
    }
    
});

document.addEventListener("mouseup", textToDistance);
document.addEventListener("touchend", textToDistance);


function textToDistance(event) {
    //event.preventDefault();
    
    var selectedText = window.getSelection().toString();
    
  if (selectedText.length > 0 && extIsActive && selectedText != lastText) {
      lastText = selectedText;
      console.log("Content: selected Text length > 0");
      
      //The below one can only be used in background.js
      //browser.runtime.sendNativeMessage("testing of send native");
      
      /* The following code works. It changes the selected text to yellow background
      var selection = window.getSelection();
      var range = selection.getRangeAt(0);
      var newNode = document.createElement("span");
      newNode.setAttribute("style", "background-color: yellow;");
      range.surroundContents(newNode);
      */
      
      var selection = window.getSelection();
      var range = selection.getRangeAt(0);
      range.collapse(false);
      
      //selection.removeAllRanges();
      //selection.empty();
      
      var newNode = document.createElement("span");
      newNode.setAttribute("style", "background-color: yellow;");
    
      //Try getting current location
      if (navigator.geolocation) {
          console.log("before calling getCurrentPosition");
        navigator.geolocation.getCurrentPosition(showDistance, showError);
      } else {
          console.log("Geolocation is not supported by this browser.");
          showToast("Geolocation is not supported by this browser.");
      }

      function showDistance(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          
          //Send message to background.js
          browser.runtime.sendMessage({ name: "getDistance" , address: selectedText, latitude: String(position.coords.latitude), longitude: String(position.coords.longitude) }).then((response) => {
              console.log("Content: Response of getDistance: ", response);
          
              var textNode = ""
              if (response.result === "error") {
                  //textNode = document.createTextNode("(Unable to find distance)");
                  showToast('Invalid address');
              } else {
                  const textNodeSpace = document.createTextNode(" ( ");
                  newNode.appendChild(textNodeSpace);
                  
                  imgNode = document.createElement("img");
                  imgNode.classList.add('circle');
                  
                  imgNode.src = browser.runtime.getURL("images/location.north.circle@3x.png");
                  imgNode.style.width = '18px';
                  imgNode.style.height = '18px';
                  
                  //imgNode.style.height = '100%';
                  //imgNode.style.width = '100%';
                  
                  //Padding makes the img invisible in some webpages.
                  //imgNode.style.paddingTop = "0px";
                  //imgNode.style.paddingRight = "10px";
                  //imgNode.style.paddingBottom = "0px";
                  //imgNode.style.paddingLeft = "10px";
                  
                  //imgNode.style.transform = 'rotate(20deg)';
                  //imgNode.style.transform = 'translate(9%, -10%) rotate(' + response.bearing + 'deg)';  /* order of transform is from right to left*/
                  imgNode.style.verticalAlign = "middle";
                  
                  console.log("bearing: " + response.bearing);
                  
                  console.log("imgNode.src: " + imgNode.src);
                  
                  newNode.appendChild(imgNode);
                  
                  textNode = document.createTextNode(" " + response.distance + ")");
              
                  newNode.appendChild(textNode);
                  
                  range.insertNode(newNode);
                  
                  setTimeout(() => {
                      //This inline style overrides css
                      imgNode.style.transform = 'translate(9%, -10%) rotate(' + response.bearing + 'deg)';  /* order of transform is from right to left*/
                      
                  }, 100);
              }

          });
          
      }
      
      function showError(error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
                showToast("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
                showToast("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.log("The request to get user location timed out.");
                showToast("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
                showToast("The request to get user location timed out.");
            break;
        }
      }
      //Try getting current location end.
      
  }
}


// Create a function to show a toast notification
function showToast(message) {
    // Create a div element for the toast
    const toast = document.createElement('div');
    toast.classList.add('my-toast');
        
    // Add the message to the toast
    const text = document.createTextNode(message);

    toast.appendChild(text);

    // Add the toast to the DOM
    document.body.appendChild(toast);
    
    /* setTimeout is required, without this, animation will not show. It may due to the original object has not been shown, it has no chance to "transit" it. */
    setTimeout(() => {
        toast.classList.toggle('my-toast-appear');
    }, 10);
    
    setTimeout(() => {
       toast.classList.toggle('my-toast-fading');
    }, 4000);
    
}

