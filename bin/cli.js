#!/usr/bin/env node
const { statSync } = require('fs');
const glob = require('glob');
const tinify = require('tinify');
const { eachLimit } = require('async');
const fileSize = require('filesize');

const argv = require('yargs')
  .usage('Usage: tinify-cli [options] <glob-pattern>')
  .demandCommand(1, 'Missing required "glob-pattern" argument')
  .example('tinify-cli --key secretkey **/*.png', 'tinify .png files')
  .example('tinify-cli --key secretkey **/*.jpg', 'tinify .jpg files')
  .example('tinify-cli --key secretkey **/*.{png,gif,jpg}', 'tinify all image files')
  .option('k', {
    alias: 'key',
    default: process.env.TINIFY_API_KEY,
    demandOption: true,
    describe: 'Your tinify API key or set environment variable "TINIFY_API_KEY". You can get a tinify API key at https://tinypng.com/developers',
    type: 'string'
  })
  .help('h')
  .alias('h', 'help')
  .argv;

const files = glob.sync(argv._[0]);

if (files.length == 0) {
  console.log(`Could not find any files matching ${argv._[0]}`);
  process.exit(0);
}

tinify.key = argv.k;

eachLimit(files, 3, tinifyFile, (err) => {
  if (err) {
    if (err instanceof tinify.AccountError) {
      console.log(`Please verify your API key and account limit`);
    } else if (err instanceof tinify.ClientError) {
      console.log(`Check your source image and request options`);
    } else if (err instanceof tinify.ServerError) {
      console.log(`Temporary issue with the Tinify API`);
    } else if (err instanceof tinify.ConnectionError) {
      console.log(`A network connection error occurred`);
    } else {
      console.log(`Something went wrong and we have no idea what it was. But wait, here is the error detail`, err);
    }

    process.exit(1);
  }

  console.log(`Finished compressing ${files.length} images`);
  if (tinify.compressionCount) {
    console.log(`${tinify.compressionCount} compressions done this month using the tinify API`);
  }
});

function tinifyFile(filename, next) {
  const sizeUncompressed = statSync(filename).size;

  const source = tinify.fromFile(filename);
  /* Could add additional options?
   var resized = source.resize({
   method: "fit",
   width: 150,
   height: 100
   });
   */
  source.toFile(filename, (err) => {
    if (err) { return next(err); }

    const sizeCompressed = statSync(filename).size;

    console.log(`Compressed file ${filename} from ${fileSize(sizeUncompressed)} to ${fileSize(sizeCompressed)}`);

    next();
  });
}