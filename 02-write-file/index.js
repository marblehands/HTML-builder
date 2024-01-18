const fs = require('fs');
const path = require('path');
const { stdout } = require('process');
const readline = require('readline');

const writableStream = fs.createWriteStream(
  path.resolve(__dirname, 'output.txt'),
);

const readlineInstance = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

stdout.write('Hello, how are you?\n');

readlineInstance.on('line', (answer) => {
  if (answer !== 'exit') {
    writableStream.write(`${answer}\n`);
  } else {
    exit();
  }
});

readlineInstance.on('SIGINT', () => {
  exit();
});

function exit() {
  console.log('Goodbye!');
  readlineInstance.close();
  writableStream.end();
  process.exit();
}
