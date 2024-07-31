import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";

import { anthropicToolUse } from "./anthropic";
import { sendWhatsAppMessage } from "./whatsapp";

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      const from = req.body.entry[0].changes[0].value.messages[0].from;
      const msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;

      try {
        const translatedText = await anthropicToolUse(msg_body);
        if (translatedText) {
          await sendWhatsAppMessage(from, translatedText);
        } else {
          throw new Error("No text was received from the API");
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
