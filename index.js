const { readdirSync } = require('fs');
const { join } = require('path');

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirEntry => dirEntry.isDirectory())
    .map(dirEntry => dirEntry.name);

getDirectories(__dirname)
  .filter(dir => /\d{4}/.test(dir))
  .forEach(yearDir => {
    getDirectories(join(__dirname, yearDir))
      .forEach(dayDir => require(join(__dirname, yearDir, dayDir, `${yearDir}-${dayDir}`)))
  });