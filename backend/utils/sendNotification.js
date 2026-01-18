const axios = require("axios");

async function sendNotification(pushToken, title, body) {
  if (!pushToken) return;

  await axios.post("https://exp.host/--/api/v2/push/send", {
    to: pushToken,
    sound: "default",
    title,
    body,
  });
}

module.exports = sendNotification;
