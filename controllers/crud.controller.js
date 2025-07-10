/**
 * A factory function to generate CRUD controller methods for any Mongoose model.
 * @param {mongoose.Model} model - The Mongoose model.
 * @returns {object} CRUD methods
*/
import mongoose from "mongoose";
import validate from "../services/validate.service.js"
import { deleteFile, containsImage } from '../services/removeFile.service.js'
import chalk from 'chalk';
import handleAggregatePagination from "../services/handlepagination.service.js";
const log = console.log
const validateId = mongoose.Types.ObjectId.isValid;

export const createCrudController = (model, options = {}, aggregate) => ({
    create: async (req, res) => {
        try {
            const val = options.check;
            const IsExist = await model.findOne({ val })
            if (IsExist) res.status(400).json({ info: `${options.check} Already Exist.` })

            const response = await model.create(req.body)

            if (!response) return res.status(400).json({ error: 'Something went wrong, please try again later.' })
            return res.status(200).json({ success: 'created successfully.', redirect: req.originalUrl })
        } catch (error) {
            if (error.name === 'ValidationError') validate(res, error.errors)
            log(chalk.red(`create -> ${model.modelName} : ${error.message}`))
        }
    },

    getAllJsonData: async (req, res) => {
        try {
            const query = { page: req.query.page, limit: req.query.size }

            if (typeof aggregate === 'object') {
                const response = await handleAggregatePagination(model, aggregate, query)

                return res.status(200).json({
                    last_page: response.totalPages,
                    data: response.collectionData,
                    columns: options.list
                })
            } else {
                const response = await handleAggregatePagination(model, [{ $project: options.isVisible }], query)

                return res.status(200).json({
                    last_page: response.totalPages,
                    data: response.collectionData.reverse(),
                    columns: options.list
                })
            }
        } catch (error) {
            log(chalk.red(`getAllJsonData -> ${model.modelName} : ${error.message}`))
        }
    },

    async getOne(req, res) {
        try {
            if (!validateId(req.params.id)) return res.status(400).json({ error: 'Invalid Request.' })
            const response = await model.findById(req.params.id)
            return res.render(`${req.modelName}/update`, {
                title: req.modelName,
                api: `${req.baseUrl}/resources/${req.modelName}`,
                response
            })
        } catch (error) {
            log(chalk.red(`getOne -> ${model.modelName} : ${error.message}`))
        }
    },

    update: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).json({ error: 'Invalid Request.' })
            const { password } = req.body;
            if (password.length === 0) delete req.body.password;

            const response = await model.findByIdAndUpdate(req.params.id,
                { $set: req.body },
                {
                    new: true,
                    runValidators: true,
                }
            )
            if (!response) return res.status(404).json({ error: 'Not found' })
            return res.status(200).json({ success: 'update successfully', redirect: req.originalUrl })
        } catch (error) {
            if (error.name === 'ValidationError') validate(res, error.errors)
            log(chalk.red(`update -> ${model.modelName} : ${error.message}`))
        }
    },
    updateModelStatus: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).json({ error: 'Invalid Request.' })

            const { status } = req.body;
            const response = await model.findByIdAndUpdate({ _id: req.params.id },
                { status }, { new: true }
            )
            if (!response) return res.status(400).json({ error: 'Something went wrong, please try again later.' })
            return res.status(200).json({ success: 'updated successfully.' })
        } catch (error) {
            log(chalk.red(`updateModelStatus -> ${model.modelName} : ${error.message}`))
        }
    },

    remove: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).json({ error: 'Invalid Request.' })

            const response = await model.findByIdAndDelete(req.params.id)
            if (!response) return res.status(404).json({ error: 'Not found' })

            const containImage = containsImage(response)
            if (containImage.hasImage) { //TODO:add folder Name
                containImage.type === 'single'
                    ? deleteFile(`${folder}/${containImage.value}`)
                    : containImage.value?.forEach(file => deleteFile(`${folder}/${file}`))
            }

            return res.status(200).json({ success: 'Deleted successfully' })
        } catch (error) {
            log(chalk.red(`remove -> ${model.modelName} : ${error.message}`))
        }
    }
})

// export default createCrudController