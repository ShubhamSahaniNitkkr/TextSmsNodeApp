const userPhoneNumber = document.getElementById("inputPhone");
const userMessage = document.getElementById("inputMsg");
const sendButton = document.getElementById("send_button");
const responseText = document.getElementById("res_txt");

sendButton.addEventListener("click", send, false);

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
