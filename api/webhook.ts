import { sendWhatsAppMessage } from "./whatsapp";
import { anthropicSendMessage } from "./anthropic";
import { Request, Response } from "express";
import { handleError } from "./utils";

// Types
type WebhookData = {
  sender: string;
  message: string;
};

// Validation functions
const isValidWebhook = (body: any): boolean =>
  body.object === "whatsapp_business_account";

const hasValidMessageStructure = (body: any): boolean =>
  body.entry?.[0]?.changes?.[0]?.value?.messages?.[0] !== undefined;

// Data extraction
const extractWebhookData = (body: any): WebhookData | null => {
  if (!hasValidMessageStructure(body)) return null;

  const messageData = body.entry[0].changes[0].value.messages[0];
  return {
    sender: messageData.from,
    message: messageData.text.body,
  };
};

// Service functions
const translateText = async (text: string): Promise<string | null> => {
  try {
    return await anthropicSendMessage(text);
  } catch (error) {
    console.error("Translation error:", error);
    return null;
  }
};

const sendMessage = async (to: string, message: string): Promise<void> => {
  try {
    await sendWhatsAppMessage(to, message);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isValidWebhook(req.body)) {
    res.sendStatus(400);
    return;
  }

  const webhookData = extractWebhookData(req.body);
  if (!webhookData) {
    res.sendStatus(400);
    return;
  }

  try {
    const translatedText = await translateText(webhookData.message);
    if (!translatedText) {
      throw new Error("No text was received from the translation service");
    }

    await sendMessage(webhookData.sender, translatedText);
    res.sendStatus(200);
  } catch (error) {
    handleError(error as Error);
    res.sendStatus(500);
  }
};
