const { spawnSync } = require("child_process");
const { readFileSync, writeFileSync, unlinkSync } = require("fs");
const { join } = require("path");
const { createHash } = require("crypto");

// Create the coverage badge
spawnSync("nyc", ["--reporter=json-summary", "npm", "test"]);
spawnSync("make-coverage-badge");

// Make it lowercase, add its has to its filename, move it to root directory
let badgeSource = join(__dirname, "../coverage/badge.svg");
let badge = readFileSync(badgeSource)
    .toString("utf-8")
    .replace(/Coverage/g, "coverage");

let badgeHash = createHash("md5").update(badge).digest("hex");
let badgeDestBasename = `coverage-badge-${badgeHash}.svg`;
let badgeLocalDest = join("img", badgeDestBasename);
let badgeDest = join(__dirname, "..", badgeLocalDest);

writeFileSync(badgeDest, badge);

// Delete the old badge, put the new badge in README.md
let readmeSource = join(__dirname, "../README.md");
let badgeNameRegex = /img\/coverage-badge-.{32}\.svg/;
let readme = readFileSync(readmeSource).toString("utf-8");
let lastBadgeLocalSource = readme.match(badgeNameRegex)[0];
readme = readme.replace(lastBadgeLocalSource, badgeLocalDest);

if (lastBadgeLocalSource != badgeLocalDest) 
    unlinkSync(lastBadgeLocalSource);

writeFileSync(readmeSource, readme);
