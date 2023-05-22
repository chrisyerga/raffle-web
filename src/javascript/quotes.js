require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

//* ===== Config defaults =====
// Fastest and cheapest model tuned for chat prompts
const DEFAULT_AI_MODEL = "gpt-3.5-turbo";

// A little bit of variation so the first quote isn't always the same one
const DEFAULT_TEMPERATURE = 0.85;
const DEFAULT_TOP_P = 0;

// Grab 5 quotes at a time to fill the cache
const QUOTES_BATCH_SIZE = 5;

// The prompts for the AI
const INITIAL_PROMPT =
  "I want a short inspirational quote. " +
  "It should be motivational, positive and life affirming. " +
  "It would be helpful if the quote is related to recovery, but not necessary. " +
  "It could be from a famous poet, author, actor, athlete, philosopher or anonymous. " +
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
    this._configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Connect to openai.com and fill the quotes cache
    // We let any exceptions pop out of this to the caller
    this._openaiAPI = new OpenAIApi(this._configuration);
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
      generatedQuote = response.data.choices[0].message.content;

      //! DEBUG INFO
      this.logAPIResponse(request, response);
    } catch (err) {
      console.log(err);
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
