# tinify-cli

Tinify images from the command line using the tinify API

## Installation

```bash
npm i tinify-cli -g
```

## Usage

```bash

Usage: tinify-cli [options] <glob-pattern>

Options:
  -k, --key   Your tinify API key. You can get a tinify API key at https://tinypng.com/developers
  -h, --help  Show help

Examples:
  bin\cli.js --key secretkey **/*.png                         tinify .png files
  bin\cli.js --key secretkey **/*.jpg                         tinify .jpg files
  bin\cli.js --key secretkey **/*.{png,gif,jpg}               tinify all image files
```