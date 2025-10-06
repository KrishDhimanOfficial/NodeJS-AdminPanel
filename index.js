#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const projectName = process.argv[2];

if (!projectName) {
    console.log("❌ Please provide a project name, e.g. npx create-awesome-app myapp");
    process.exit(1);
}

const projectPath = path.join(process.cwd(), projectName);

// Example: GitHub repo you want to download
const repoUrl = "https://github.com/KrishDhimanOfficial/NodeJS-AdminPanel.git";

console.log("📦 Downloading project...");
execSync(`git clone ${repoUrl} ${projectName}`, { stdio: "inherit" });

// Optional: remove .git folder so it becomes a fresh project
fs.rmSync(path.join(projectPath, ".git"), { recursive: true, force: true });

console.log(`✅ Project '${projectName}' created successfully!`);
console.log(`\n👉 cd ${projectName}`);
console.log(`👉 npm install`);
