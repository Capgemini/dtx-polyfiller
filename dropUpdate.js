const fs = require("fs");

let manifest = JSON.parse(fs.readFileSync("./DTX/manifest.json"));

delete manifest.update_url;

fs.writeFileSync("./DTX/manifest.json", JSON.stringify(manifest));
