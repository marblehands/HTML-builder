const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

const startPath = path.join(__dirname, 'styles');
const endPath = path.join(__dirname, 'project-dist');

function compileStyles(startPath, endPath) {
  const styles = [];
  fsp
    .readdir(startPath, { withFileTypes: true })
    .then((files) => {
      const promises = files.map((file) => {
        const pathToFile = path.join(startPath, file.name);
        const extention = path.extname(file.name).slice(1);
        if (extention === 'css') {
          return fsp
            .readFile(pathToFile, 'utf-8')
            .then((data) => {
              styles.push(data);
            })
            .catch((err) => console.log('ошибка чтения файла ', file.name));
        }
      });
      return Promise.all(promises);
    })
    .catch((err) =>
      console.log('Произошла ошибка чтения файлов в папке styles: ', err),
    )
    .then(() => {
      const writableStream = fs.createWriteStream(
        path.resolve(endPath, 'bundle.css'),
      );
      writableStream.write(styles.join('\n'));
      console.log('стили записаны в файл bundle.css');
    })
    .catch((err) => console.log('ошибка компиляции стилей'));
}

compileStyles(startPath, endPath);
