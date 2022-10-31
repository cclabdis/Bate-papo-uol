const messageBox = document.getElementById("messageBox");
const caseoverley = document.getElementById("overlay");
const loadingPage = document.getElementById("loading");
const inputMsg = document.getElementById("inputMessage");
const inputLogin = document.getElementById("inputLogin");
const objectUsername = {};

let init = false;


function getUsername() {
    objectUsername.name = inputLogin.value;
    const getName = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", objectUsername);
    getName.then(() => {
    inputLogin.value = "";
    loadingPage.classList.remove("hidden");
    init = true;
    requestMessage();
    setTimeout(() => {
        caseoverley.classList.add("hidden");
        loadingPage.classList.add("hidden");
    }, 3000);
    });
    getName.catch((error) => {
        if (error.response.status === 400) {
            inputLogin.value = "";
            inputLogin.placeholder = "That name is already in use";
        }
    });
}

let lastTime = undefined;

function requestMessage() {
  const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
  promise.then(getMessage);
}

function getMessage(message) {
  const lastMessageTime = message.data[message.data.length - 1].time;
  if (lastTime === lastMessageTime) return false;

  messageBox.innerHTML = "";
  for (let i = 0; i < message.data.length; i++) {
    if (message.data[i].type === "status") {
      messageBox.innerHTML += `
            <li class="entry">
            <p><span class="hours">${message.data[i].time}</span>&nbsp <strong>${message.data[i].from}</strong> 
            para <strong>${message.data[i].to}</strong>:&nbsp ${message.data[i].text}</p>
            </li>`;
    } else if (message.data[i].type === "message") {
      messageBox.innerHTML += `
            <li>
            <p><span class="hours">${message.data[i].time}</span>&nbsp <strong>${message.data[i].from}</strong> 
            para <strong>${message.data[i].to}</strong>:&nbsp ${message.data[i].text}</p>
            </li>`;
    } else if (
      message.data[i].type === "private_message" &&
      (message.data[i].to === objectUsername.name || message.data[i].from === objectUsername)
    ) {
      messageBox.innerHTML += `
            <li class="outmain">
            <p><span class="hours">${message.data[i].time}</span>&nbsp <strong>${message.data[i].from}</strong> 
            para <strong>${message.data[i].to}</strong>:&nbsp ${message.data[i].text}</p>
            </li>`;
    }
  }
  lastTime = messageBox.lastElementChild.textContent.slice(7, 15);
  messageBox.lastElementChild.scrollIntoView();
}

function sendMessage() {
    const objectMessage = {
        from: objectUsername.name,
        to: "Todos",
        text: inputMsg.value,
        type: "message"
    };

    const promiseSendMessage = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", objectMessage);
    promiseSendMessage.then(requestMessage);
    promiseSendMessage.catch(() => {alert("Sorry, you've been disconnected"), window.location.reload();});
    inputMsg.value = "";
    messageBox.lastElementChild.scrollIntoView();
}

setInterval(() => {
  if (init === true) {
    requestMessage();
  }
}, 3000);
setInterval(() => {
  if (init === true) {
    axios.post("https://mock-api.driven.com.br/api/v6/uol/status", objectUsername);
  }
}, 5000);