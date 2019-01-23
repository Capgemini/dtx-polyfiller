const fs = require("fs");

const HOSTS = process.env.SITE_HOSTS.split(",");

let manifest = JSON.parse(fs.readFileSync("./manifest.json"));
let pack = JSON.parse(fs.readFileSync("./package.json"));

delete manifest.update_url;

fs.writeFileSync("./DTX/manifest.json", JSON.stringify(manifest));
