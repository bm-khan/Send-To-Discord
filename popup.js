var storage = chrome.storage.sync;
const NAMESPACES = {
  webhooks: "webhooks",
  input: "input"
};

// Html text inputs and buttons
var header = document.getElementById("header");
var titleInput = document.getElementById("newTitle");
var urlInput = document.getElementById("newUrl");
var usernameInput = document.getElementById("webhookName");
var avatarUrlInput = document.getElementById("webhookAvatar");
// I put the inputs in an array so I can iterate through them
var inputs = [
  {element: titleInput, key: "newTitle"},
  {element: urlInput, key: "newUrl"},
  {element: usernameInput, key: "newUsername"},
  {element: avatarUrlInput, key: "newAvatar"},
];

var addButton = document.getElementById("addNew");
var saveButton = document.getElementById("save");
var addBlock = document.getElementById("addBlock");
var editBlock = document.getElementById("editBlock");

var webhooks = [];
var editingWebhook;

// The method that does the thing
// The thing being - Adding a webhook to your list of webhooks
function doThing() {
    // get current webhook list, append value, set again
    let newWebhook = {
        title: titleInput.value,
        url: urlInput.value,
        username: usernameInput.value,
        avatar_url: avatarUrlInput.value,
    }
    // Clear inputs
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].element.value = "";
    }
    webhooks.push(newWebhook);
    storage.set({[NAMESPACES.input]: ";;;"}, function() {}); // Clear any saved text input, all inputs are stored in one string separated by semicolons, to reduce api calls
    storage.set({[NAMESPACES.webhooks]: webhooks}, function() {console.log("new webhook added")}); // Push new list of webhooks
}

// Saves the contents of text inputs when popup loses focus
function saveText() {
    let storedInput = "";
    for (let i = 0; i < inputs.length; i++) {
      storedInput += (inputs[i].element.value + ";");
    }
    storage.set({[NAMESPACES.input]: storedInput}, function() {});
}

// Sets popup to edit a webhook when you click edit
function editNode(idx) {
  return function() {
    document.getElementById("header").innerHTML = "Edit webhook:";
    editBlock.style.display = "block";
    addBlock.style.display = "none";
    editingWebhook = webhooks[idx];
    titleInput.value = editingWebhook.title; // Set current values of webhook into text inputs
    urlInput.value = editingWebhook.url;
    usernameInput.value = editingWebhook.username;
    avatarUrlInput.value = editingWebhook.avatar_url;
  }
}

function saveSettings() {
  addBlock.style.display = "block";
  editBlock.style.display = "none";
  editingWebhook.title = titleInput.value;
  editingWebhook.url = urlInput.value;
  editingWebhook.username = usernameInput.value;
  editingWebhook.avatar_url = avatarUrlInput.value;
  storage.set({[NAMESPACES.webhooks]: webhooks}, function() {console.log("webhook edited")});
  // Clear any inputs and saved text 
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].element.value = "";
  }
  saveText();
  document.getElementById("header").innerHTML = "Add new webhook:";
}

// delet node
function deleteNode(idx) {
  return function() {
      webhooks.splice(idx, 1);
      storage.set({[NAMESPACES.webhooks]: webhooks}, function() {console.log("webhook deleted")});
  }
}

// Generates HTML that displays list of webhooks
function displayWebhooks() {
  let webhooksList = document.getElementById("webhooks");
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

  storage.get([NAMESPACES.input], function(result) { // Grab previously saved text input
    console.log(result.input);
    // If there was no text in the name space, initialize them to an array of empty strings, otherwise, split result at the semicolons
    inputValues = (result.input === undefined ? ["", "", "", ""] : result.input.split(";"));
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].element.value = inputValues[i];
    }
  });
  editBlock.style.display = "none";
}

// Listen for changes to storage to redisplay webhooks
chrome.storage.onChanged.addListener(function(changes, namespace) {
  console.log(changes, namespace);
  storage.get([NAMESPACES.webhooks], function(result) {
    displayWebhooks();
  });
})

addButton.addEventListener('click', doThing);
saveButton.addEventListener('click', saveSettings);

// If any text input loses focues, save text
for (let i = 0; i < inputs.length; i++) {
  inputs[i].element.addEventListener('blur', saveText);
}
