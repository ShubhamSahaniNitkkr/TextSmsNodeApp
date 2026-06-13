const form = document.getElementById("sms-form");
const userPhoneNumber = document.getElementById("inputPhone");
const countryCode = document.getElementById("countryCode");
const userMessage = document.getElementById("inputMsg");
const charCount = document.getElementById("charCount");
const sendButton = document.getElementById("send_button");
const resetButton = document.getElementById("reset_button");
const successPanel = document.getElementById("success_panel");
const errorPanel = document.getElementById("error_panel");
const successTitle = document.getElementById("success_title");
const successMeta = document.getElementById("success_meta");
const errorText = document.getElementById("error_text");
const balanceText = document.getElementById("balance");
const chargeText = document.getElementById("charge");

const socket = io();

function hidePanels() {
  successPanel.classList.remove("show");
  errorPanel.classList.remove("show");
}

function showError(message) {
  hidePanels();
  errorText.textContent = message || "Something went wrong. Please try again.";
  errorPanel.classList.add("show");
  sendButton.disabled = false;
  sendButton.textContent = "Send SMS";
}

function showSuccess(data) {
  hidePanels();
  successTitle.textContent = data.demoMode
    ? "Demo SMS simulated"
    : "SMS sent successfully";
  successMeta.textContent = data.demoMode
    ? `Demo delivery to ${data.number}. No real message was sent. Add Twilio keys and set DEMO_MODE=false for live SMS.`
    : `Delivered to ${data.number}`;
  chargeText.textContent = data.charge || "—";
  balanceText.textContent = data.balance || "—";
  successPanel.classList.add("show");
  sendButton.classList.add("hidden");
  resetButton.classList.remove("hidden");
}

function setLoading(isLoading) {
  sendButton.disabled = isLoading;
  sendButton.textContent = isLoading ? "Sending..." : "Send SMS";
}

function resetForm() {
  hidePanels();
  userPhoneNumber.value = "";
  userMessage.value = "";
  charCount.textContent = "0";
  sendButton.classList.remove("hidden");
  resetButton.classList.add("hidden");
  sendButton.disabled = false;
  sendButton.textContent = "Send SMS";
  userPhoneNumber.focus();
}

socket.on("smsStatus", function (data) {
  if (data.errortext) {
    showError(data.errortext);
    return;
  }
  showSuccess(data);
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  hidePanels();

  const phone = userPhoneNumber.value.trim();
  const msg = userMessage.value.trim();

  if (!phone) {
    showError("Please enter a phone number.");
    return;
  }

  if (!/^\d{7,15}$/.test(phone.replace(/\D/g, ""))) {
    showError("Enter a valid phone number (7–15 digits).");
    return;
  }

  if (!msg) {
    showError("Please enter a message.");
    return;
  }

  setLoading(true);

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      number: phone,
      countryCode: countryCode.value,
      msg: msg
    })
  })
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          throw new Error(data.error || "Failed to send SMS");
        }
        return data;
      });
    })
    .then(function (data) {
      if (data.data) {
        showSuccess(data.data);
      }
      setLoading(false);
    })
    .catch(function (err) {
      setLoading(false);
      showError(err.message);
    });
});

resetButton.addEventListener("click", resetForm);

userMessage.addEventListener("input", function () {
  charCount.textContent = String(userMessage.value.length);
});
