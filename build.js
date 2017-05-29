var fs = require("fs");

var lines = [];

process.env.PRINT_DOCS = "true";
console.log = function(line){
    lines.push(line || "");
};
require("./");

lines = lines.slice(1).concat([lines[0]]);

lines.unshift("[//]: # (GEN-DOCS-BEGIN)");
lines.push("\n[//]: # (GEN-DOCS-END)\n");

var docs = lines.join("\n");

var readme = fs.readFileSync("./README.md", "utf8");

var out = readme.replace(/\[.*GEN-DOCS-BEGIN[\s\S]*?GEN-DOCS-END.*\n/, docs);

fs.writeFileSync("./README.md", out, "utf8");
