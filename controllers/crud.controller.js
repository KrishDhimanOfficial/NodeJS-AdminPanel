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
import sturctureModel from "../models/sturcture.model.js";
import registerModel from "../utils/registerModel.utils.js";
import { capitalizeFirstLetter } from "captialize";
import { populate } from "dotenv";
import handleFilteration from "../services/handleFilteration.service.js";
const log = console.log;
const validateId = mongoose.Types.ObjectId.isValid;

const createCrudController = (model, fields = []) => ({
    create: async (req, res) => {
        try {
            // console.log(req.body);
            // console.log(req.files);
            // const val = options.check;
            // const IsExist = await model.findOne({ val })
            // if (IsExist) res.status(400).json({ info: `${options.check} Already Exist.` })

            if (req.file?.fieldname && req.file?.path) {
                req.body[req.file.fieldname] = req.file.path;
            } // Case: upload.single()

            if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
                for (const [fieldName, files] of Object.entries(req.files)) {
                    files.length === 1
                        ? req.body[fieldName] = files[0].path
                        : req.body[fieldName] = files.map(file => file.path)
                }
            } // Case: upload.fields()

            if (Array.isArray(req.files)) {
                const fieldName = req.files[0]?.fieldname;
                if (fieldName) req.body[fieldName] = req.files.map(file => file.path)
            }  // Case: upload.array()

            const response = await model.create(req.body) // Save
            if (!response) return res.status(400).json({ error: 'Something went wrong, please try again later.' })
            return res.status(200).json({ success: 'created successfully.', redirect: req.originalUrl })
        } catch (error) {
            if (error.name === 'ValidationError') validate(res, error.errors)
            if (req.file && error) {
                await deleteFile(req.file.path)
            } // Delete single file (upload.single)

            if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {

                for (const [fieldName, files] of Object.entries(req.files)) {
                    for (const file of files) {
                        if (file?.path) await deleteFile(file.path);
                    }
                }
            }  // Delete files in fields object (upload.fields)

            if (Array.isArray(req.files)) {
                for (const file of req.files) {
                    if (file?.path) await deleteFile(file.path)
                }
            } // Delete array of files (upload.array)
            log(chalk.red(`create -> ${model.modelName} : ${error.message}`))
        }
    },

    getSelectJsonData: async (req, res, modelName) => {
        try {
            const model = await registerModel(modelName)
            const response = await model.find({
                name: {
                    $regex: req.query.search, $options: 'i'
                }
            }, { _id: 1, name: 1 })

            return res.status(200).json(response)
        } catch (error) {
            log(chalk.red(`getSelectJsonData -> ${modelName} : ${error.message}`))
        }
    },

    getViewInfo: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).redirect(`${req.baseUrl}/404`)
            const response = await model.findById({ _id: req.params.id })

            const name = model.modelName;
            const responseObj = {}
            responseObj[name] = response

            return res.status(200).render(`${model.modelName}/view`, responseObj)
        } catch (error) {
            log(chalk.red(`getViewInfo -> ${model.modelName} : ${error.message}`))
        }
    },

    getAllJsonData: async (req, res) => {
        const query = { page: req.query.page, limit: req.query.size }
        try {
            const visibleFields = Object.fromEntries(
                fields
                    .filter(col => col.isVisible)
                    .map(col => [col.col, 1])
            )

            const columns = fields.filter(col => col.isVisible)
                .map(col => ({ col: col.col, ...(col.filter && { filter: col.filter }) }))
            columns.push({ col: 'actions', actions: { edit: true, del: true, view: true } })

            const pipeline = fields
                .filter(col => col.isVisible)
                .flatMap(f => {
                    if (f.relation && f.relation !== 'No Relation') {
                        return [
                            {
                                $lookup: {
                                    from: `${f.relation}s`, // adjust pluralization as needed
                                    localField: f.field_name,
                                    foreignField: '_id',
                                    as: f.field_name
                                }
                            },
                            {
                                $unwind: {
                                    path: `$${f.field_name}`,
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $addFields: {
                                    [f.field_name]: {
                                        $ifNull: [`$${f.field_name}.${f.display_key}`, 'N/A']
                                    }
                                }
                            }
                        ]
                    }

                    if (f.field_type === 'Date') {
                        return [
                            {
                                $addFields: {
                                    [f.col]: {
                                        $dateToString: {
                                            format: "%Y-%m-%d",
                                            date: `$${f.field_name}`
                                        }
                                    }
                                }
                            }
                        ]
                    }
                    return []
                })
            pipeline.push({ $project: visibleFields })

            const updatedPipeline = handleFilteration(req.query?.filter, pipeline.filter(Boolean))
            const response = await handleAggregatePagination(model, updatedPipeline, query)

            return res.status(200).json({
                last_row: response.totalDocs,
                last_page: response.totalPages,
                data: response.collectionData.reverse(),
                columns
            })
        } catch (error) {
            log(chalk.red(`getAllJsonData -> ${model.modelName} : ${error.message}`))
        }
    },

    renderEditPage: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).redirect(`${req.baseUrl}/404`)
            const response = await model.findById(req.params.id)

            for (const f of fields) {
                if (f.field_type === 'ObjectId') {
                    await response.populate(f.field_name)
                }
            }
            // console.log(response);

            return res.status(200).render(`${model.modelName}/update`, {
                title: capitalizeFirstLetter(model.modelName),
                api: `${req.originalUrl}`,
                response,
            })
        } catch (error) {
            log(chalk.red(`renderEditPage -> ${model.modelName} : ${error.message}`))
        }
    },

    update: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).json({ error: 'Invalid Request.' })
            const { password } = req.body;
            if (password?.length === 0) delete req.body.password;

            const response = await model.findByIdAndUpdate({ _id: req.params.id },
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
            if (error.name === 'ValidationError') validate(res, error.errors)
            log(chalk.red(`updateModelStatus -> ${model.modelName} : ${error.message}`))
        }
    },

    remove: async (req, res) => {
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
            log(chalk.red(`remove -> ${model.modelName} : ${error.message}`))
        }
    },

    renderCRUD: async (req, res) => {
        try {
            return res.status(200).render('crud/crudTable',
                {
                    title: 'Generate CRUD',
                    addURL: `${req.baseUrl}/generate-crud`,
                    api: req.originalUrl,
                    dataTableAPI: `${req.originalUrl}/api`,
                }
            )
        } catch (error) {
            console.log('renderCRUD : ' + error.message)
        }
    },
    renderGenerateCRUD: async (req, res) => {
        try {
            return res.status(200).render('crud/generateCRUD',
                {
                    title: 'Generate CRUD',
                    api: req.originalUrl,
                    collections: mongoose.modelNames()
                }
            )
        } catch (error) {
            if (error.name === 'ValidationError') validate(res, error.errors)
            console.log('renderGenerateCRUD : ' + error.message)
        }
    },
    getCRUDJsonData: async (req, res) => {
        try {
            const query = { page: req.query.page, limit: req.query.size }
            const pipeline = [{ $project: { model: 1 } }]

            if (req.query?.filter) {
                req.query.filter.forEach(item => {
                    if (item.field === 'model') {
                        pipeline.push({ $match: { [item.field]: { $regex: item.value, $options: 'i' } } })
                    }
                })
            }

            const response = await handleAggregatePagination(sturctureModel, pipeline, query)
            const columns = [
                { col: 'model', filter: 'search' },
                { col: 'actions', actions: { edit: true, del: true } },
            ]
            return res.status(200).json({
                last_row: response.totalDocs,
                last_page: response.totalPages,
                data: response.collectionData,
                columns
            })
        } catch (error) {
            console.log('getCRUDJsonData : ' + error.message)
        }
    },
    renderEditCRUD: async (req, res) => {
        try {
            const response = await sturctureModel.findById({ _id: req.params.id })
            if (!response) return res.status(404).redirect(`${req.baseUrl}/404`)
            return res.status(200).render('crud/editCRUD',
                {
                    title: 'Edit CRUD',
                    api: '/admin/crud',
                    collections: mongoose.modelNames(),
                    response,
                    schemaTypes: ["String", "Number", "Boolean", "Array", "ObjectId", "Map", "Date", "Double128", "Double", "Null", "Mixed"],
                    formTypes: ["text", "select", "file", "email", "url", "tel", "search", "number", "range", "color", "date", "time", "datetime-local", "month", "week", "radio", "checkbox", "textarea"],
                    filters: ['search', 'boolean', 'groupValueFilter', 'date', 'minmax', 'number'],
                }
            )
        } catch (error) {
            console.log('renderEditCRUD : ' + error.message)
        }
    },
    removeCRUD: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).json({ error: 'Invalid Request.' })
            const response = await sturctureModel.findByIdAndDelete({ _id: req.params.id })
            if (!response) return res.status(400).json({ error: 'Something went wrong, please try again later.' })
            return res.status(200).json({ success: 'created successfully.' })
        } catch (error) {
            console.log('removeCRUD : ' + error.message)
        }
    },
})

export default createCrudController