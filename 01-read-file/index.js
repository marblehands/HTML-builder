const path = require('path');
const fs = require('fs');
const { stdout } = require('process');

const fullPath = path.resolve('01-read-file', 'text.txt');
const redeableStream = fs.createReadStream(fullPath);

redeableStream.on('data', (data) => {
  const dataString = data.toString();
  stdout.write(dataString);
});
