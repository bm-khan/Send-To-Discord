var webhooksFile = "webhooks.json"
var contexts = ["link", "image", "selection", "video", "page"];

function sendReqToWebhookWrap(webhooks) {
  return function(info, tab) {
    console.log(info);
    console.log(info.srcUrl, info.linkUrl, info.selectionText, info.pageUrl);
    let data;
    if (info.srcUrl) {
      data = info.srcUrl;
    } else if(info.linkUrl) {
      data = info.linkUrl;
    } else if(info.selectionText) {
      data = info.selectionText;
    } else if(info.pageUrl) {
      data = info.pageUrl;
    } else {
      data = undefined;
    }

      for (let i = 0; i < webhooks.length; i++) {
        console.log(webhooks[i]);
        let url = webhooks[i].url;
        let username = webhooks[i].username;
        let avatarUrl = webhooks[i].avatar_url;
        console.log("url", url);
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
          console.log("Status: ", xhr.getResponseHeader("status"));
          console.log("Requests remaining", xhr.getResponseHeader("x-ratelimit-remaining"));
        }
        xhr.send(JSON.stringify({"content": data, "username": username, "avatar_url": avatarUrl}));
      }
  }
}

function buildContextMenus(webhooks) {
  console.log(webhooks);

  chrome.contextMenus.removeAll(function(){ console.log("clearing")});
  let title = "Send to Discord";
  console.log("Creating menu: parent");
  chrome.contextMenus.create({
    "title": title,
    "contexts": contexts,
    "id": "parent"
  });
  console.log("creating menu: all");
  chrome.contextMenus.create({
    "title": "Send to all webhooks",
    "contexts": contexts,
    "parentId": "parent",
    "id": "all",
    "onclick": sendReqToWebhookWrap(webhooks)
  })
  for (let i = 0; i < webhooks.length; i++) {
    console.log("creating menu: " + webhooks[i].url);
    chrome.contextMenus.create({
      "title": "Send to " + webhooks[i].title,
      "contexts": contexts,
      "parentId": "parent",
      "id": webhooks[i].url,
      "onclick": sendReqToWebhookWrap([webhooks[i]])
    })
  }
}

function sendCopiedText(info, tab) { }

chrome.storage.sync.get(["webhooks"], function(result) {
  if (result.webhooks) {
    buildContextMenus(result.webhooks);
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  console.log(changes, namespace);
  chrome.storage.sync.get(["webhooks"], function(result) {
    buildContextMenus(result.webhooks);
  });
});

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log("message received from: ", sender, request.context);
//     enableContextMenu(request.context);
//   }
// );
