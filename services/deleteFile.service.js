import fs from 'fs'
import path from 'path'
import config from '../config/config.js'

const deleteFile = async (doc) => {
    try {
        const __dirname = path.dirname(`${config.serverURL}`)
        const imagePath = path.join(__dirname, '../uploads', doc)

        await fs.promises.rm(imagePath)
    } catch (error) {
        console.log('deleteImage : ' + error.message)
    }
}

export default deleteFile;