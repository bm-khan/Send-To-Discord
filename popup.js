var titleInput = document.getElementById("newTitle");
var urlInput = document.getElementById("newUrl");
var usernameInput = document.getElementById("webhookName");
var avatarUrlInput = document.getElementById("webhookAvatar");
var inputs = [
  {element: titleInput, key: "newTitle"},
  {element: urlInput, key: "newUrl"},
  {element: usernameInput, key: "newUsername"},
  {element: avatarUrlInput, key: "newAvatar"},
];

var addButton = document.getElementById("addNew");

var webhooks;

function clearWebhooks() {
    console.log("clearing webhooks");
    webhooks = [];
    chrome.storage.sync.set({"webhooks": []}, function () {console.log("webhooks cleared")});
}

function doThing() {
    // get current webhook list, append value, set again
    let newWebhook = {
        title: titleInput.value,
        url: urlInput.value,
    }
    if(usernameInput.value) {
        newWebhook.username = usernameInput.value;
    }
    if (avatarUrlInput.value) {
        newWebhook.avatar_url = avatarUrlInput.value;
    }

    for (let i = 0; i < inputs.length; i++) {
      inputs[i].element.value = "";
    }
    ////////
    webhooks.push(newWebhook);
    chrome.storage.local.set({"input": ";;;"}, function() {});
    chrome.storage.sync.set({"webhooks": webhooks}, function() {console.log("new webhook added")});
}

function printAll() {
    console.log("local: ", webhooks);
    chrome.storage.sync.get(["webhooks"], function(result) {
        console.log("external: ", result);
    });
}

function saveText() {
    let storedInput = "";
    for (let i = 0; i < inputs.length; i++) {
      storedInput += (inputs[i].element.value + ";");
    }
    chrome.storage.local.set({"input": storedInput}, function() {});
}

function deleteNode(url) {
  return function() {
      for (let i = 0; i < webhooks.length; i++) {
          if (webhooks[i].url === url) {
              webhooks.splice(i, 1);
              break;
          }
      }
      chrome.storage.sync.set({"webhooks": webhooks}, function() {console.log("webhook deleted")});

  }
}

function displayWebhooks() {
  let webhooksList = document.getElementById("webhooks");
  webhooksList.innerHTML = "";

  for (let i = 0; i < webhooks.length; i++) {
    let listItem = document.createElement("DIV");
    listItem.className = "listItem";
    webhooksList.appendChild(listItem);

    let name = document.createElement("P");
    name.className = "name";
    let text = document.createTextNode(webhooks[i].title);
    name.appendChild(text);
    listItem.appendChild(name);

    let deleteButton = document.createElement("Button");
    deleteButton.className = "delete";
    let delText = document.createTextNode("Delete");
    deleteButton.appendChild(delText);
    deleteButton.onclick = deleteNode(webhooks[i].url);
    listItem.appendChild(deleteButton);
  }
}

window.onload = function() {
    console.log(inputs);
    console.log("Loading Webhooks")
    chrome.storage.sync.get(["webhooks"], function(result) {
        console.log("result: ", result);
        webhooks = result.webhooks;

        if(webhooks === undefined) {
            chrome.storage.sync.set({"webhooks": []}, function() {
                console.log("webhooks array initialized")
            });
        } else {
            console.log("webhooks loaded: ");
            console.log(webhooks);
        }
      displayWebhooks();
    });

    chrome.storage.local.get(["input"], function(result) {
      console.log(result.input);
      inputValues = (result.input === undefined ? ["", "", "", ""] : result.input.split(";"));
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].element.value = inputValues[i];
      }
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  console.log(changes, namespace);
  chrome.storage.sync.get(["webhooks"], function(result) {
    displayWebhooks();
  });
})

addButton.addEventListener('click', doThing);
// clearButton.addEventListener('click', clearWebhooks);
// printButton.addEventListener('click', printAll);
// saveButton.addEventListener('click', saveSettings);

for (let i = 0; i < inputs.length; i++) {
  inputs[i].element.addEventListener('blur', saveText);
}
