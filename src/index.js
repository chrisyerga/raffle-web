require("dotenv").config();
const quotes = require("./javascript/quotes");
const { exec } = require("node:child_process");

// run the `ls` command using exec
exec('figlet "diffs.ai"', (err, output) => {
  // once the command has completed, the callback function is called
  if (err) {
    // log and return if we encounter an error
    console.error("could not execute command: ", err);
    return;
  }
  // log the output received from the command
  console.log(output.substring(1));
});

//? IIFE to test async
(async () => {
  try {
    const gen = new quotes.OpenAIQuoteGenerator();
    const quote = await gen.generateQuoteWithPrompt("famous guitarist");

    console.log(`  "\n    ${quote}\n  "`);
    // console.log(`===> ${await gen.generateQuote()}`);
    // console.log(`===> ${await gen.generateQuote()}`);
    // console.log(`===> ${await gen.generateQuote()}`);
    // console.log(`===> ${await gen.generateQuote()}`);
    // console.log(`===> ${await gen.generateQuote()}`);
    // console.log(`===> ${await gen.generateQuote()}`);
    // console.log(`===> ${await gen.generateQuote()}`);
    // console.log(`===> ${await gen.generateQuote()}`);
  } catch (err) {
    console.error(err);
  }
})();
