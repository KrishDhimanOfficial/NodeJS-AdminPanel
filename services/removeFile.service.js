import fs from 'fs'
import path from 'path'
import config from '../config/config.js'

const deleteFile = async (file) => {
    try {
        const __dirname = path.dirname(`${config.serverURL}`)
        const imagePath = path.join(__dirname, '../uploads', file)

        await fs.promises.rm(imagePath)
    } catch (error) {
        console.log('deleteImage : ' + error.message)
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