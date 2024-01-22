//это какой-то ад
const { createWriteStream, createReadStream } = require('fs');
const path = require('path');
const fs = require('fs').promises;

const distPath = path.join(__dirname, 'project-dist');
const startAssetsPath = path.join(__dirname, 'assets');
const endAssetsPath = path.join(distPath, 'assets');
const startStylesPath = path.join(__dirname, 'styles');
const componentsPath = path.join(__dirname, 'components');
const templatePath = path.join(__dirname, 'template.html');

fs.mkdir(distPath, { recursive: true })
  .then(() => {
    return copyDir(startAssetsPath, endAssetsPath);
  })
  .then(() => {
    return fs.access(distPath);
  })
  .then(() => {
    return compileStyles(startStylesPath, distPath);
  })
  .then(() => {
    return compileIndex(componentsPath);
  })
  .catch((err) => {
    console.log(err);
  });

function copyDir(startPath, endPath) {
  return fs
    .access(endPath)
    .then(() => {
      return fs.rm(endPath, { recursive: true }).then(() => {
        console.log('папка assets уже создана ранее и успешно удалена');
      });
    })
    .catch(() => {
      console.log('папки assets еще нет');
    })
    .then(() => {
      return fs.mkdir(endPath, { recursive: true }).then(() => {
        console.log('новая папка assets успешно создана');
      });
    })
    .then(() => {
      return fs.readdir(startPath, { withFileTypes: true }).then((files) => {
        const promises = files.map((file) => {
          const fileStartPath = path.join(startPath, file.name);
          const fileEndPath = path.join(endPath, file.name);
          if (file.isDirectory()) {
            return copyDir(fileStartPath, fileEndPath);
          } else {
            return fs
              .copyFile(fileStartPath, fileEndPath)
              .then(() => console.log(`файл '${file.name}' успешно скопирован`))
              .catch(() =>
                console.log(`ошибка копирования файла '${file.name}'`),
              );
          }
        });
        return Promise.all(promises);
      });
    });
}

function compileStyles(startPath, endPath) {
  const styles = [];
  return fs
    .readdir(startPath, { withFileTypes: true })
    .then((files) => {
      const promises = files.map((file) => {
        const pathToFile = path.join(startPath, file.name);
        const extention = path.extname(file.name).slice(1);
        if (extention === 'css') {
          return fs
            .readFile(pathToFile, 'utf-8')
            .then((data) => {
              styles.push(data);
            })
            .catch((err) => console.log('ошибка чтения файла ', file.name));
        }
      });
      return Promise.all(promises).then(() => {
        const writableStream = createWriteStream(
          path.resolve(endPath, 'style.css'),
        );
        writableStream.write(styles.join('\n'));
        console.log('стили записаны в файл styles.css');
      });
    })
    .catch((err) => console.log(err));
}

function compileIndex(componentsPath) {
  let template;
  return fs
    .readdir(componentsPath, { withFileTypes: true })
    .then((files) => {
      return readStream(templatePath).then((templateData) => {
        template = templateData;
        const promises = files.map((file) => {
          const pathToFile = path.join(componentsPath, file.name);
          return readStream(pathToFile).then((data) => {
            let tag = `{{${file.name.split('.')[0]}}}`;
            template = template.replaceAll(tag, data);
            console.log(
              'файл успешно прочитан и записан в template',
              file.name,
            );
          });
        });
        return Promise.all(promises);
      });
    })
    .then(() => {
      const indexPath = path.join(distPath, 'index.html');
      const writableStream = createWriteStream(indexPath);
      writableStream.write(template);
      console.log('index.html успешно скомпилирован');
    })
    .catch((err) => {
      console.log(err);
    });
}

function readStream(filePath) {
  const readableStream = createReadStream(filePath);
  return new Promise((resolve, reject) => {
    let data = '';
    readableStream.on('data', (chunk) => {
      data += chunk;
    });
    readableStream.on('end', () => {
      resolve(data);
    });
    readableStream.on('error', (error) => {
      reject(error);
    });
  });
}
