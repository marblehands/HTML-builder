const path = require('path');
const fs = require('fs').promises;

const startPath = path.join(__dirname, 'files');
const endPath = path.join(__dirname, 'files-copy');

function copyDir(startPath, endPath) {
  fs.access(endPath)
    .then(() => {
      return fs.rm(endPath, { recursive: true }).then(() => {
        console.log('папка files-copy уже создана ранее и успешно удалена');
      });
    })
    .catch((err) => {
      console.log('папки files-copy еще нет');
    })
    .then(() => {
      return fs
        .mkdir(endPath)
        .then(() => console.log('новая папка files-copy успешно создана'));
    })
    .then(() => {
      return fs
        .readdir(startPath, { withFileTypes: true })
        .then((files) => {
          const promises = files.map((file) => {
            const fileStartPath = path.join(startPath, file.name);
            const fileEndPath = path.join(endPath, file.name);
            return fs
              .copyFile(fileStartPath, fileEndPath)
              .then(() => console.log(`файл '${file.name}' успешно скопирован`))
              .catch((copyerr) =>
                console.log(`ошибка копирования файла '${file.name}'`),
              );
          });
          return Promise.all(promises);
        })
        .catch((err) => {
          console.log(err);
        });
    });
}

copyDir(startPath, endPath);
