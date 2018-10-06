// var contexts = ["link", "image", "selection"];

// document.addEventListener('selectionchange', function (event) {
//     let context;
//     if (window.getSelection().toString()) {
//         context = "selection";
//     } else if(event.target.localName === "img") {
//         context = "image";
//     } else {
//         context = "link";
//     }
//     console.log(event);
//     // console.log(event.target.localName);

//     // gotta send a message to the bg script cause contextMenus api isnt available for content scripts heck
//     // chrome.runtime.sendMessage({context: context});
// }, true);

// document.addEventListener('contextmenu', function(event) {
//     console.log("do thing", event);
// });