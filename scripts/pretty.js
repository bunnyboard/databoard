const fs = require('fs');

const tokenListPath = './src/configs/data/tokenlists';
const files = fs.readdirSync(tokenListPath);

// pretty token configs
for (const filename of files) {
  const tokenList = require(`../src/configs/data/tokenlists/${filename}`);
  for (const [key] of Object.entries(tokenList)) {
    tokenList[key].address = tokenList[key].address.toLowerCase();
  }

  const ordered = Object.keys(tokenList)
    .sort()
    .reduce((obj, key) => {
      obj[key] = tokenList[key];
      return obj;
    }, {});

  fs.writeFileSync(`./src/configs/data/tokenlists/${filename}`, JSON.stringify(ordered).toString());
}
