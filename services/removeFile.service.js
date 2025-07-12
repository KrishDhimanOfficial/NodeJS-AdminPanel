import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import chalk from 'chalk'
import config from '../config/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const deleteFile = async (folderPath) => {
    try {
        const imagePath = path.join(__dirname, '..', folderPath)

        if (fs.existsSync(imagePath)) await fs.promises.rm(imagePath, { force: true })
        else console.log(chalk.red(`File not found: ${imagePath}`))
    } catch (error) {
        console.error(chalk.red('deleteFile error:', error.message))
    }
}


const containsImage = (obj) => {
    if (!obj || typeof obj !== 'object') return { hasImage: false }

    const matchedFields = []

    const isImage = (value) => {
        const extensions = config.allowedExtensions || [];
        if (typeof value === 'string') {
            return extensions.some(ext => value.toLowerCase().endsWith(ext))
        }
        if (Array.isArray(value)) {
            return value.some(item =>
                typeof item === 'string' &&
                extensions.some(ext => item.toLowerCase().endsWith(ext))
            )
        }
        return false
    }

    for (const key in obj) {
        if (isImage(obj[key])) {
            matchedFields.push({
                field: key,
                type: Array.isArray(obj[key]) ? 'multiple' : 'single',
                value: obj[key]
            })
        }
    }

    if (matchedFields.length === 0) {
        return { hasImage: false }
    }

    return {
        hasImage: true,
        fields: matchedFields
    }
}

// { Document Like This
//   name: "User A",
//   avatar: "uploads/user.jpg",
//   documents: ["uploads/resume.pdf", "uploads/cert.png"],
//   gallery: ["uploads/img1.jpg", "uploads/img2.png"]
// }

// It retutns
// {
//   hasImage: true,
//   fields: [
//     {
//       field: 'avatar',
//       type: 'single',
//       value: 'uploads/user.jpg'
//     },
//     {
//       field: 'gallery',
//       type: 'multiple',
//       value: ['uploads/img1.jpg', 'uploads/img2.png']
//     }
//   ]
// }


export { deleteFile, containsImage }