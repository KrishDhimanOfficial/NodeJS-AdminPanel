import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import chalk from 'chalk'

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
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    const isImage = (value) => {
        if (typeof value === 'string') imageExtensions.some(ext => value.toLowerCase().endsWith(ext))
        if (Array.isArray(value)) {
            return value.some(item => typeof item === 'string' && imageExtensions.some(ext => item.toLowerCase().endsWith(ext)))
        }
        return false;
    }

    for (const key in obj) {
        if (isImage(obj[key])) {
            return {
                hasImage: true,
                field: key,
                type: Array.isArray(obj[key]) ? 'multiple' : 'single',
                value: obj[key]
            };
        }
    }

    return { hasImage: false }
}

// console.log(containsImage(data1)); 
// // { hasImage: true, field: 'thumbnail', type: 'single', value: 'math.png' }

// console.log(containsImage(data2)); 
// // { hasImage: true, field: 'images', type: 'multiple', value: ['img1.jpg', 'img2.png'] }

// console.log(containsImage(data3)); 
// // { hasImage: false }

export { deleteFile, containsImage }