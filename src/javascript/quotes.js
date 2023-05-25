require("dotenv").config();
const openaiAPI = require("./openai_api");
//const { Configuration, OpenAIApi } = require("openai");

//* ===== Config defaults =====
// Fastest and cheapest model tuned for chat prompts
const DEFAULT_AI_MODEL = "gpt-3.5-turbo";

// A little bit of variation so the first quote isn't always the same one
const DEFAULT_TEMPERATURE = 1.85;
const DEFAULT_TOP_P = 0;

// The prompts for the AI
const INITIAL_PROMPT =
  "I want a short (around 15 words) inspirational quote. " +
  "It should be motivational, positive and life affirming. " +
  "It would be helpful if the quote is related to recovery, but not necessary. " +
  "It could be from a famous poet, author, actor, athlete, philosopher or anonymous. " +
  "The quote should be 20 words or less in length." +
  "The response should include the quote and the author but nothing else";
const initialPromptMessages = [
  { role: "system", content: "You are a helpful assistant." },
  {
    role: "user",
    content: INITIAL_PROMPT,
  },
];

// High-level interface to get quotes. We grab several quotes at a time so we're not
// waiting for the AI to respond when folks are on the site.
class OpenAIQuoteGenerator {
  constructor() {
    this._openaiAPI = openaiAPI;
  }

  async generateQuoteWithPrompt(userPrompt) {
    var generatedQuote = "Life is for living. Not for thinking.";

    var request = {
      messages: initialPromptMessages,
      model: DEFAULT_AI_MODEL,
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: 1000,
      top_p: DEFAULT_TOP_P,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["'''"],
    };

    // Add the user prompt if any
    if (userPrompt && userPrompt.length > 0) {
      request.messages = [...request.messages];
      request.messages.push({
        role: "user",
        content: `The quote should also be about: ${userPrompt}`,
      });
    }
    try {
      var response = await this._openaiAPI.createChatCompletion(request);

      //! DEBUG INFO
      this.logAPIResponse(request, response);
    } catch (err) {
      console.log("WE_GOT_ERR: " + err);
      return generatedQuote;
    }

    // See if it actually worked first
    if (response.status != 200) {
      throw new Error(`AI failed with error: ${response.statusText}`);
    } else if (response.data.choices[0].finish_reason != "stop") {
      throw new Error(
        `[AI completed with unexpected reason ${response.data.choices[0].finish_reason}].` +
          `It produced this: ${response.data.choices[0].message.content}`
      );
    }

    // Sometimes the response is something like "I apologize, but..."
    // try to sanitize the output to handle these cases
    const splitLines = response.data.choices[0].message.content
      .trim()
      .split(/\n+/);
    {
      const line = splitLines.pop();
      if (line.trim().length > 0) {
        generatedQuote = line;
      }
    }

    // Also...sometimes the quote is split up into two lines. In
    // those cases the second line is the attribution which will be
    // short. This heuristic seems to work!
    if (splitLines.length && generatedQuote.length < 30) {
      const otherLine = splitLines.pop();
      if (otherLine.trim().length > 0) {
        console.log(
          "### Detected second-line quote. Returning this instead: " + otherLine
        );
        generatedQuote = otherLine;
      }
    }

    return generatedQuote;
  }

  async generateQuote() {
    return this.generateQuoteWithPrompt();
  }

  logAPIResponse = (request, response) => {
    console.log("\n============================");
    console.log("  --- Request Parameters ---");
    console.log(`  model: ${response.data.model}`);
    console.log(`  response ID: ${response.data.id}`);
    console.log(`  temperature: ${request.temperature}`);
    console.log("  --- API Response ---");
    console.log(
      `  token cost: ${response.data.usage.prompt_tokens} + ${response.data.usage.completion_tokens}`
    );
    console.log(JSON.stringify(response.data));
    //    console.log(`     ${response.data.choices[0].message.content}`);
    console.log("============================\n");
  };
}

module.exports = { OpenAIQuoteGenerator };
