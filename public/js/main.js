const userPhoneNumber = document.getElementById("inputPhone");
const userMessage = document.getElementById("inputMsg");
const sendButton = document.getElementById("send_button");
const responseText = document.getElementById("res_txt");
const errText = document.getElementById("err_txt");
const chargeC = document.getElementById("chargeC");
const balanceC = document.getElementById("balanceC");
const balanceText = document.getElementById("balance");
const chargeText = document.getElementById("charge");

sendButton.addEventListener("click", send, false);
const socket = io();
socket.on("smsStatus", function(data) {
  if (typeof data.balance !== "undefined") {
    responseText.innerHTML = `SMS sent to ${data.number}`;
    balanceText.innerHTML = `${data.balance}`;
    chargeText.innerHTML = `${data.charge}`;

    sendButton.classList.add("d-none");
    responseText.classList.remove("d-none");
    balanceC.classList.remove("d-none");
    chargeC.classList.remove("d-none");
  } else {
    sendButton.classList.add("d-none");
    errText.classList.remove("d-none");
    errText.innerHTML = `${data.errortext}`;
  }
});

function send() {
  const countryCode = +91,
    number = countryCode + userPhoneNumber.value.replace(/\D/g, ""),
    msg = userMessage.value;

  fetch("/", {
    method: "post",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ number: number, msg: msg })
  })
    .then(function(res) {
      console.log(res);
    })
    .catch(function(err) {
      console.log(err);
    });
}
