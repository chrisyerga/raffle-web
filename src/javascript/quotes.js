require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const history = [
  { role: "system", content: "You are a helpful assistant." },
  {
    role: "user",
    content:
      "I want a short inspirational quote about life. It should be motivational, positive and possibly related to recovery. It could be from a famous poet, author, actor, philosopher or anonymous. Please generate a quote of 25 words or less and include who the author of the quote is.",
  },
];

var quotesGenerated = 0;
var temperature = 1.0;

const displayQuote = (request, response) => {
  console.log(`  model: ${response.data.model}`);
  console.log(`  response ID: ${response.data.id}`);
  console.log(`  temperature: ${request.temperature}`);
  console.log(
    `  token cost: ${response.data.usage.prompt_tokens} + ${response.data.usage.completion_tokens}`
  );
  console.log(`     ${response.data.choices[0].message.content}`);
  console.log("\n\n" + JSON.stringify(response.data));
};

const generateQuote = () => {
  const request = {
    messages: history,
    model: "gpt-3.5-turbo",
    temperature: 0, //Math.random(1),
    max_tokens: 1000,
    top_p: 0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: ["'''"],
  };
  openai.createChatCompletion(request).then((response) => {
    displayQuote(request, response);
    // history.push(response.data.choices[0].message);
    // history.push({
    //   role: "user",
    //   content: "Please generate a different quote",
    // });

    // 10 times
    if (++quotesGenerated < 10) {
      generateQuote();
    }
  });
  // .catch((err) => {
  //   console.log("ERROR: " + err);
  // });
};

const test = (temperature, count) => {};

module.exports = {
  generateQuote,
  test,
};
