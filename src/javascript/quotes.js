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
  "I want some short inspirational quotes about life. " +
  "It should be motivational, positive and life affirming. " +
  "It would be helpful if the quote is related to recovery, but not necessary. " +
  "It could be from a famous poet, author, actor, philosopher or anonymous. " +
  "Please generate 5 quotes of 25 words or less and include who the author of the quote is.";
const NEXT_PROMPT = "Thanks. Please generate another quote.";
const initialPromptMessages = [
  { role: "system", content: "You are a helpful assistant." },
  {
    role: "user",
    content: INITIAL_PROMPT,
  },
];
const nextPromptMessages = [{ role: "user", content: NEXT_PROMPT }];

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

  async initialize() {
    console.log(`INFO: Fetching ${QUOTES_BATCH_SIZE} quotes for the cache`);
    await this.fillQuotesCache();
  }

  _quotesReady = 0;
  get getQuotesAvailable() {
    return this._quotesReady;
  }

  _quotesCache = [];
  async fillQuotesCache() {
    if (this._quotesReady > 0) {
      console.log(
        `INFO: fillquotesCache() called with ${this._quotesReady} quotes already in cache. Race condition?`
      );
    } else if (this._quotesReady < 0) {
      console.error(
        `ERR: fillquotesCache() called with ${this._quotesReady} quotes in cache. Something's busted.`
      );
    }

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

    try {
      var response = await this._openaiAPI.createChatCompletion(request);
      const newQuote = response.data.choices[0].message;

      //! DEBUG INFO
      this.logAPIResponse(request, response);

      const splitQuotes = newQuote.content.split(/[0-9]+\. /);
      var extractedQuotes = splitQuotes.filter(
        (quote) => quote.trim().length > 0
      );
      extractedQuotes = extractedQuotes.map((quote) => quote.trim());

      this._quotesCache = this._quotesCache.concat(extractedQuotes);
      this._quotesReady += extractedQuotes.length;
    } catch (err) {
      console.log(err);
    }
  }

  async generateQuote() {
    if (this._quotesReady === 0) {
      // Call this sync because we need to return something
      // Normally we'd fill the cache in the background
      await this.fillQuotesCache();
    }

    if (this._quotesReady > 0) {
      this._quotesReady--;
      return this._quotesCache.pop();
    } else {
      throw new Error("quote fetch failed");
    }
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
