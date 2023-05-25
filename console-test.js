require("dotenv").config();
const quotes = require("./javascript/quotes");
const { exec } = require("node:child_process");
const prompt = require("prompt-sync")({ sigint: true });
const tty = require("node:tty");

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

//? IIFE to test
(async () => {
  var userPrompt = "sunset at the beach";
  const gen = new quotes.OpenAIQuoteGenerator();
  var quote = await gen.generateQuoteWithPrompt(userPrompt);
  console.log(`QUOTE: ${quote}`);

  if (true === process.stdout.isTTY) {
    do {
      userPrompt = prompt("prompt>");
      quote = await gen.generateQuoteWithPrompt(userPrompt);
      console.log(`QUOTE: ${quote}`);
    } while (userPrompt.length > 0);
  }
})();

const openaiAPI = require("./javascript/openai_api");
(async () => {
  var imagePrompt = "a beach scene with a happy person.";

  const response = await openaiAPI.createImage({
    prompt: imagePrompt,
    n: 4,
    size: "512x512",
  });

  console.log(JSON.stringify(response.data));

  console.log(`\n\nImage URL: ${response.data.data[0].url}`);

  /*
   *
   *
   *
   *
   */

  const width = 512;
  const height = 512;
  const fs = require("fs");
  const GIFEncoder = require("gifencoder");
  const { createCanvas, loadImage } = require("canvas");

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const encoder = new GIFEncoder(width, height);
  encoder.createReadStream().pipe(fs.createWriteStream("./result.gif"));
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(40);
  encoder.setQuality(10);

  var textx = 400;

  for (const entry of response.data.data) {
    console.log(">> Loading image frame: " + entry.url);
    const image = await loadImage(entry.url);
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    ctx.font = "bold 80px sans-serif";
    ctx.fillText("The Differents", textx, 256);
    textx = 525;
    textx -= 15;

    encoder.addFrame(ctx);

    if (true || textx <= 340) {
      for (index = 0; index < 30; ++index) {
        ctx.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000";
        ctx.font = "bold 80px sans-serif";
        ctx.fillText("The Differents", textx, 256);

        textx -= 15;

        encoder.addFrame(ctx);
      }
    }
  }
  encoder.finish();
})();
