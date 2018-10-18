var menus = chrome.contextMenus;
var storage = chrome.storage.sync;
const CONTEXTS = ["link", "image", "selection", "video", "page"];
const NAMESPACES = {
  webhooks: "webhooks",
  input: "input"
};
const METHOD = "POST"
const FIELDS = {
  contents: "content", // I wanted to call this 'content' instead of 'contents' but it literally just didnt work
  username: "username",
  avatar_url: "avatar_url"
};

        // console.log("Status: ", xhr.getResponseHeader("status"));

// Returns the function called when a context menu item is clicked
function sendReqToWebhookWrap(webhooks) {
  // info and tab come from onclick method of context menu item
  return function(info, tab) {
    // Determine what to send to webhook
    // Since a right click can register as multiple different contexts (Ex. right cicking an image can be considered 'image', 'link', or 'page')
    // Send the first thing in hierarchy that exists: srcUrl, linkUrl, selectionText, pageUrl
    // If none exist, undefined is sent -> Should never happen, as any click should have a pageUrl, otherwise context menu would not appear
    let content = info.srcUrl || info.linkUrl || info.selectionText || info.pageUrl;
    // Iterate through webhooks selected, send XHRs to all
    for (let i = 0; i < webhooks.length; i++) {
      console.log("Sending to webhook: " + webhooks[i].title);
      let url = webhooks[i].url;
      let username = webhooks[i].username;
      let avatarUrl = webhooks[i].avatar_url;
      let xhr = new XMLHttpRequest();
      xhr.open(METHOD, url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = () => {
        console.log("Response Headers");
        console.log(xhr.getAllResponseHeaders());
      }
      xhr.send(JSON.stringify({
        [FIELDS.contents]: content, 
        [FIELDS.username]: username, 
        [FIELDS.avatar_url]: avatarUrl
      }));
    }
  }
}

function buildContextMenus(webhooks) {
  console.log(webhooks);
  // Clear out all context menus before readding
  // Yeah, I'm too lazy to just add new menus when new webhooks are added, so I just clear them all and re-add all
  menus.removeAll(function() {console.log("clearing")});
  // Main context menu item
  menus.create({ 
    "title": "Send to Discord",
    "contexts": CONTEXTS,
    "id": "parent"
  });
  // Menu item to send to all webhooks
  menus.create({
    "title": "Send to all webhooks",
    "contexts": CONTEXTS,
    "parentId": "parent",
    "id": "all",
    "onclick": sendReqToWebhookWrap(webhooks)
  });
  // Iterating through webhooks, creating context menu for each
  for (let i = 0; i < webhooks.length; i++) {
    console.log("creating menu: " + webhooks[i].url);
    menus.create({
      "title": "Send to " + webhooks[i].title,
      "contexts": CONTEXTS,
      "parentId": "parent",
      "id": webhooks[i].url,
      "onclick": sendReqToWebhookWrap([webhooks[i]])
    });
  }
}

// Grab webhooks from storage on and builds context menus on load
storage.get([NAMESPACES.webhooks], function(result) {
  if (result.webhooks) {
    buildContextMenus(result.webhooks);
  }
});

// If changes occur in storage (from popup menu) context menus are rebuilt
chrome.storage.onChanged.addListener(function(changes, namespace) {
  console.log(changes, namespace);
  storage.get([NAMESPACES.webhooks], function(result) {
    buildContextMenus(result.webhooks);
  });
});
