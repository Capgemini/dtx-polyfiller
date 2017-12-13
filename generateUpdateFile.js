require('dotenv').config();

const fs = require("fs");

const package = JSON.parse(fs.readFileSync("./package.json"));

const XML_DOC = `<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='${process.env.EXTENSION_APP_ID}'>
    <updatecheck codebase='${process.env.EXTENSION_DOWNLOAD_URL}' version='${package.version}' />
  </app>
</gupdate>`;

fs.writeFileSync("./update.xml", XML_DOC);