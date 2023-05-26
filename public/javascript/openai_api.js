require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const apiClient = new OpenAIApi(configuration);
module.exports = apiClient;
