import { readdirSync, statSync } from 'node:fs';
import { join, sep, posix } from 'node:path';

const getPaths = path => {
  const paths = [];
  const files = readdirSync(path);
  files.forEach(file => {
    const filePath = join(path, file);
    if (statSync(filePath).isDirectory()) paths.push(...getPaths(filePath));
    else paths.push(filePath);
  });
  return paths;
};

export default (() =>
  getPaths('./src/templates')
    .map(templatePath => {
      templatePath = templatePath.split(sep).slice(1).join(posix.sep);
      return `systems/t2k4e/${templatePath}`;
    })
)();
