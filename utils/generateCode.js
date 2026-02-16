const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 6);

function generateCode() {
  return nanoid();
}

module.exports = generateCode;
