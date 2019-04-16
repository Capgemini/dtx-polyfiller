require('dotenv').config();

const fs = require("fs");

const HOSTS = process.env.SITE_HOSTS.split(",");
const SUBMIT_CLAIMS = process.env.SUBMIT_CLAIMS.split(",");

let manifest = JSON.parse(fs.readFileSync("./manifest.json"));
let pack = JSON.parse(fs.readFileSync("./package.json"));

manifest.version = pack.version;
manifest.update_url = process.env.EXTENSION_UPDATE_URL;
manifest.permissions = HOSTS;
manifest.content_scripts = manifest.content_scripts.map(item => Object.assign({}, item, {
    matches: HOSTS
}));
manifest.content_scripts[1].matches = SUBMIT_CLAIMS; // Set the submit claims matches

fs.writeFileSync("./DTX/manifest.json", JSON.stringify(manifest));
