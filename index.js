#!/usr/bin/env node
import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"
import gradient from "gradient-string"
import figlet from "figlet"

const projectName = process.argv[2]

if (!projectName) {
    console.log(chalk.red("❌ Please provide a project name, e.g."))
    console.log(chalk.yellow("   npx create-admin-panel myapp"))
    process.exit(1)
}

const projectPath = path.join(process.cwd(), projectName)
const repoUrl = "https://github.com/KrishDhimanOfficial/NodeJS-AdminPanel.git"

// Fancy banner
console.log(
    gradient.pastel.multiline(
        figlet.textSync("Admin Panel", { horizontalLayout: "fitted" })
    )
)

console.log(chalk.cyan("\n📦 Downloading project from template...\n"))

try {
    execSync(`git clone ${repoUrl} ${projectName}`, { stdio: "inherit" })

    fs.rmSync(path.join(projectPath, ".git"), { recursive: true, force: true })

    console.log(chalk.green(`\n✅ Project '${projectName}' created successfully!\n`))
    console.log(chalk.white("👉 Next steps:"))
    console.log(chalk.yellow(`   cd ${projectName}`))
    console.log(chalk.yellow("   npm install"))
    console.log(chalk.yellow("   npm run dev"))
} catch (err) {
    console.log(chalk.red("❌ Something went wrong while setting up the project."))
    console.error(err)
}