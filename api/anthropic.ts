import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const anthropicToolUse = async (msg: string): Promise<string | null> => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a Hebrew translation assistant. Translate the following text to Hebrew accurately: ${msg}`,
        },
      ],
      system:
        "You are a Hebrew translation assistant. Translate the given text to Hebrew accurately. After translation, use the provided tool to ensure the text is in the correct right-to-left format for WhatsApp.",

      tools: [
        {
          name: "format_hebrew_for_whatsapp",
          description: "Formats Hebrew text for correct display in WhatsApp",
          input_schema: {
            type: "object",
            properties: {
              hebrew_text: {
                type: "string",
                description: "The Hebrew text to be formatted",
              },
            },
            required: ["hebrew_text"],
          },
        },
      ],
    });

    const [_, tool] = response.content;
    const isInputAvailable = "input" in tool;
    if (isInputAvailable) {
      const { hebrew_text: hebrewText } = tool.input as { hebrew_text: string };
      if (hebrewText) {
        return hebrewText;
      } else {
        console.error(
          "Error: the hebrew_text property is missing from the tool input."
        );
        return null;
      }
    } else {
      console.error("Error: the input property is missing from the tool.");
    }

    return null;
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return null;
  }
};
