const jwt = require("jsonwebtoken");
const axios = require("axios");

//Use the ApiKey and APISecret from config.js
const payload = {
  iss: process.env.API_ZOOM_KEY,
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, process.env.API_ZOOM_SECRET);

const createMeeting = async (email, topic, startDate) => {
  try {
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${email}/meetings`,
      {
        topic: topic,
        type: 2,
        start_time: startDate,
        settings: {
          // alternative_hosts: emailOfUser,
          host_video: "true",
          participant_video: "true",
          join_before_host: "false",
        },
      },
      {
        headers: {
          "User-Agent": "Zoom-api-Jwt-Request",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

module.exports = { createMeeting };
