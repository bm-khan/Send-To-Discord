var storage = chrome.storage.sync;
const NAMESPACES = {
  webhooks: "webhooks",
  whInput: "whInput",
  chInput: "chInput",
  mode: "mode"
};

const MODES = ["WEBHOOK", "CHANNEL"];
var mode = 0;

// Html text inputs and buttons
var header = document.getElementById("header");
var whTitle = document.getElementById("whTitle");
var whUrl = document.getElementById("whUrl");
var whUser = document.getElementById("whUser");
var whAvi = document.getElementById("whAvi");

var chTitle = document.getElementById("chTitle");
var chId = document.getElementById("chId");
var chType = document.getElementById("chType");
var chBotUrl = document.getElementById("chBotUrl");

// I put the inputs in an array so I can iterate through them
var whInputs = [
  {element: whTitle, key: "whTitle"},
  {element: whUrl, key: "whUrl"},
  {element: whUser, key: "whUser"},
  {element: whAvi, key: "whAvi"},
];

var chInputs = [
  {element: chTitle, key: "chTitle"},
  {element: chId, key: "chId"},
  {element: chType, key: "chType"},
  {element: chBotUrl, key: "chBotUrl"}
];

var addButton = document.getElementById("add");
var saveButton = document.getElementById("save");
var toggleButton = document.getElementById("toggle");
var addBlock = document.getElementById("addBlock");
var editBlock = document.getElementById("editBlock");
var toggleBlock = document.getElementById("toggleBlock");

var list = document.getElementById("webhooks");


var webhooks = [];
var editingWebhook;


// Toggles between adding new channel or new webhook
function toggle() {
  if (isNaN(mode)) {mode = 0; console.log("converted");}
  mode = 1 - mode;
  storage.set({[NAMESPACES.mode]: String(mode)}, function() {});
  // Toggles which elements to display
  console.log(mode, header.innerHTML);
  header.innerHTML = !mode ? "Add new webhook:" : "Add new channel:";
  console.log(mode, header.innerHTML);
  wh = document.getElementsByClassName("wh");
  for(let i = 0; i < wh.length; i++) {
    wh[i].style.display = wh[i].style.display === 'none' ? '' : 'none';
  }

  ch = document.getElementsByClassName("ch");
  for(let i = 0; i < ch.length; i++) {
    ch[i].style.display = ch[i].style.display === 'none' ? '' : 'none';
  }
}

// The method that does the thing
// The thing being - Adding a webhook to your list of webhooks
function doThing() {
    let newItem = {mode: mode};
    if (MODES[mode] === "WEBHOOK") {
      newItem.title = whTitle.value;
      newItem.url = whUrl.value;
      newItem.username = whUser.value;
      newItem.avatar_url = whAvi.value;

      for (let i = 0; i < whInputs.length; i++) {
        whInputs[i].element.value = "";
      }
      storage.set({[NAMESPACES.whInput]: ";;;"}, function() {}); // Clear any saved text input, all inputs are stored in one string separated by semicolons, to reduce api calls
    }
    else if (MODES[mode] === "CHANNEL") {
      newItem.title = chTitle.value;
      newItem.id = chId.value;
      newItem.type = chType.value;
      newItem.url = chBotUrl.value;

      for (let i = 0; i < chInputs.length; i++) {
        chInputs[i].element.value = "";
      }
      storage.set({[NAMESPACES.chInput]: ";;;"}, function() {}); // Clear any saved text input, all inputs are stored in one string separated by semicolons, to reduce api calls
    }
    webhooks.push(newItem);
    storage.set({[NAMESPACES.webhooks]: webhooks}, function() {console.log("new webhook added")}); // Push new list of webhooks
}

// Saves the contents of text inputs when popup loses focus
function saveText() {
    console.log("Mode: ", mode, MODES[mode])

    let storedInput = "";
    if (MODES[mode] === "WEBHOOK") {
      for (let i = 0; i < whInputs.length; i++) {
        storedInput += (whInputs[i].element.value + ";");
      }
      console.log("to save: ", storedInput);
      storage.set({[NAMESPACES.whInput]: storedInput}, function() {});

    } else if (MODES[mode] === "CHANNEL") {
      for (let i = 0; i < chInputs.length; i++) {
        storedInput += (chInputs[i].element.value + ";");
      }
      storage.set({[NAMESPACES.chInput]: storedInput}, function() {});
    }
}

// Sets popup to edit a webhook when you click edit
function editNode(idx) {
  return function() {
    editingWebhook = webhooks[idx];
    if(mode !== editingWebhook.mode) {
      toggle();
    }
    toggleButton.style.display = "none";
    header.innerHTML = "Edit item:";
    editBlock.style.display = "block";
    addBlock.style.display = "none";
    if (MODES[editingWebhook.mode] === "WEBHOOK") {
      whTitle.value = editingWebhook.title; // Set current values of webhook into text inputs
      whUrl.value = editingWebhook.url;
      whUser.value = editingWebhook.username;
      whAvi.value = editingWebhook.avatar_url;
    } else if (MODES[editingWebhook.mode] === "CHANNEL") {
      chTitle.value = editingWebhook.title;
      chId.value = editingWebhook.id;
      chType.value = editingWebhook.type;
      chBotUrl.value = editingWebhook.url;
    }
  }
}

function saveSettings() {
  addBlock.style.display = "block";
  editBlock.style.display = "none";
  toggleButton.style.display = "";
  if (MODES[mode] === "WEBHOOK") {
    editingWebhook.title = whTitle.value;
    editingWebhook.url = whUrl.value;
    editingWebhook.username = whUser.value;
    editingWebhook.avatar_url = whAvi.value;
    // Clear any inputs and saved text
    for (let i = 0; i < whInputs.length; i++) {
      whInputs[i].element.value = "";
    }
  } else if (MODES[mode] === "CHANNEL") {
    editingWebhook.title = chTitle.value;
    editingWebhook.id = chId.value;
    editingWebhook.type = chType.value;
    editingWebhook.url = chBotUrl.value;
    // Clear any inputs and saved text
    for (let i = 0; i < chInputs.length; i++) {
      chInputs[i].element.value = "";
    }
  }
  storage.set({[NAMESPACES.webhooks]: webhooks}, function() {console.log("webhook edited")});
  saveText();
  header.innerHTML = !mode ? "Add new webhook:" : "Add new channel:";
}

// delet node
function deleteNode(idx) {
  return function() {
      if (webhooks[idx] === editingWebhook) {
        saveSettings();
      }
      webhooks.splice(idx, 1);
      storage.set({[NAMESPACES.webhooks]: webhooks}, function() {console.log("webhook deleted")});
  }
}

// Generates HTML that displays list of webhooks
function displayWebhooks() {
  let webhooksList = list;
  // Yeah i just clear the whole thing and redraw them all every time I go to diplay them, again, im too lazy to just add the new ones
  webhooksList.innerHTML = "";

  // If theres no webhooks, display message
  if (webhooks === undefined || webhooks.length === 0) {
    let noWebhooks = document.createElement("H"); // Webhook name
    let text = document.createTextNode("You have no webhooks!");
    noWebhooks.appendChild(text);
    webhooksList.appendChild(noWebhooks);
  }

  // For each webhook theres a buncha html I gotta add
  for (let i = 0; i < webhooks.length; i++) {
    let listItem = document.createElement("DIV"); // Container
    listItem.className = "listItem";
    webhooksList.appendChild(listItem);

    let name = document.createElement("P"); // Webhook name
    name.className = "name";
    let text = document.createTextNode("- " +webhooks[i].title);
    name.appendChild(text);
    listItem.appendChild(name);

    let editButton = document.createElement("Button"); // Edit button
    editButton.className = "option edit";
    let editText = document.createTextNode("Edit");
    editButton.appendChild(editText);
    editButton.onclick = editNode(i);
    listItem.appendChild(editButton);

    let deleteButton = document.createElement("Button"); // Delete button
    deleteButton.className = "option delete";
    let delText = document.createTextNode("Delete");
    deleteButton.appendChild(delText);
    deleteButton.onclick = deleteNode(i);
    listItem.appendChild(deleteButton);
  }
}

window.onload = function() {
  console.log("Loading Webhooks");
  storage.get([NAMESPACES.webhooks], function(result) { // Grab webhooks from storage on startup
      webhooks = result.webhooks;
      if(webhooks === undefined) { // If you had nothing stored unde rthe webhooks namespace, and empty list is stored
          storage.set({[NAMESPACES.webhooks]: []}, function() {
              console.log("webhooks array initialized")
          });
      } else {
          console.log("webhooks loaded: ");
          console.log(webhooks);
      }
    displayWebhooks();
  });

  storage.get([NAMESPACES.mode], function(result) {
    console.log("LOADED MODED", result.mode);
    mode = +result.mode;
    console.log("MODE ON LOAD: ", mode);

    storage.get([NAMESPACES.whInput, NAMESPACES.chInput], function(result) { // Grab previously saved text input
      console.log(result.whInput, result.chInput);

      // If there was no text in the name space, initialize them to an array of empty strings, otherwise, split result at the semicolons
      whInputValues = (result.whInput === undefined ? ["", "", "", ""] : result.whInput.split(";"));
      chInputValues = (result.chInput === undefined ? ["", "", "", ""] : result.chInput.split(";"));

      for (let i = 0; i < whInputs.length; i++) {
        whInputs[i].element.value = whInputValues[i];
      }
      for (let i = 0; i < chInputs.length; i++) {
        chInputs[i].element.value = chInputValues[i];
      }


    });
    console.log("PRE", mode);

    let hideClass = mode ? "wh" : "ch";
    console.log("hiding: ", hideClass)
    let elements = document.getElementsByClassName(hideClass);
    for(let i = 0; i < elements.length; i++) {
      elements[i].style.display = "none";
    }
    editBlock.style.display = "none";
    header.innerHTML = !mode ? "Add new webhook:" : "Add new channel:";

  });
};

// Listen for changes to storage to redisplay webhooks
chrome.storage.onChanged.addListener(function(changes, namespace) {
  console.log(changes, namespace);
  storage.get([NAMESPACES.webhooks], function(result) {
    displayWebhooks();
  });
})

addButton.addEventListener('click', doThing);
saveButton.addEventListener('click', saveSettings);
toggleButton.addEventListener('click', toggle);

// If any text input loses focues, save text
for (let i = 0; i < whInputs.length; i++) {
  whInputs[i].element.addEventListener('blur', saveText);
}
for (let i = 0; i < chInputs.length; i++) {
  chInputs[i].element.addEventListener('blur', saveText);
}
