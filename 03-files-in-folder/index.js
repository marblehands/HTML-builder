const { stat } = require('fs/promises');
const { readdir } = require('fs/promises');
const path = require('path');

const dirPath = path.resolve(__dirname, 'secret-folder');

readdir(dirPath, { withFileTypes: true })
  .then((filenames) => {
    for (let filename of filenames) {
      if (!filename.isDirectory()) {
        const extension = path.extname(filename.name).slice(1);
        const name = formatName(filename.name);
        const filePath = path.join(dirPath, filename.name);
        stat(filePath)
          .then((stats) => {
            const size = bytesToKilobytes(stats.size);
            console.log(`${name} - ${extension} - ${size}kb`);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  })

  .catch((err) => {
    console.log(err);
  });

function formatName(name) {
  const dotIndex = name.indexOf('.');
  return name.slice(0, dotIndex);
}

function bytesToKilobytes(bytes) {
  return (bytes / 1024).toFixed(3);
}
