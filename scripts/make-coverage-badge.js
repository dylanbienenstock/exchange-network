const { spawnSync } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

spawnSync("nyc", ["--reporter=json-summary", "npm", "test"]);
spawnSync("make-coverage-badge");

let badgeSource = join(__dirname, "../coverage/badge.svg");
let badgeDest = join(__dirname, "../coverage-badge.svg");
let badge = readFileSync(badgeSource).toString("utf-8").toLowerCase();

writeFileSync(badgeDest, badge);