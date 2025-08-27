import chalk from "chalk"
import { deleteFile, containsImage } from "./removeFile.utils.js"
import mongoose from "mongoose"
const validateId = mongoose.Types.ObjectId.isValid;

const handleRemoveRecord = async (req, res, model) => {
    try {
        if (!validateId(req.params.id)) return res.status(400).json({ error: 'Invalid Request.' })

        const response = await model.findByIdAndDelete({ _id: req.params.id })
        if (!response) return res.status(404).json({ error: 'Not found' })

        const containImage = containsImage(response)
        if (containImage.hasImage) {
            containImage.fields?.forEach(field => {
                field.type === 'single'
                    ? deleteFile(field.value)
                    : field.value?.forEach(file => deleteFile(file))
            })
        }

        return res.status(200).json({ success: 'Deleted successfully' })
    } catch (error) {
        chalk.red(console.log('handleRemoveRecord : ' + error.message))
    }
}

export default handleRemoveRecord