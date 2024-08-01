import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const anthropicSendMessage = async (
  msg: string
): Promise<string | null> => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a Hebrew translation assistant. Translate this text to Hebrew only with no intro: ${msg}`,
        },
      ],
    });

    const [content] = response.content;
    const { text } = content as { text: string };
    if (text) return text;

    return null;
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return null;
  }
};
