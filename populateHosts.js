require('dotenv').config();

const fs = require("fs");

const HOSTS = process.env.SITE_HOSTS.split(",");

let manifest = JSON.parse(fs.readFileSync("./manifest.json"));
let package = JSON.parse(fs.readFileSync("./package.json"));

manifest.version = package.version;
manifest.update_url = process.env.EXTENSION_UPDATE_URL;
manifest.permissions = HOSTS;
manifest.content_scripts = manifest.content_scripts.map(item => Object.assign({}, item, {
  matches: HOSTS
}));

fs.writeFileSync("./DTX/manifest.json", JSON.stringify(manifest));