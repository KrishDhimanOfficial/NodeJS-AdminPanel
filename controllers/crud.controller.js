/**
 * A factory function to generate CRUD controller methods for any Mongoose model.
 * @param {mongoose.Model} model - The Mongoose model.
 * @returns {object} CRUD methods
 * Developer - KRISH DHIMAN
*/
import mongoose from "mongoose";
import validate from "../services/validate.service.js"
import { deleteFile, containsImage } from '../utils/removeFile.utils.js'
import chalk from 'chalk';
import handleAggregatePagination from "../utils/handlepagination.utils.js";
import sturctureModel from "../models/sturcture.model.js";
import registerModel from "../utils/registerModel.utils.js";
import { capitalizeFirstLetter } from "captialize";
const log = console.log;
const validateId = mongoose.Types.ObjectId.isValid;

const createCrudController = (model, fields = [], modelDependencies = [], rewrite = {}) => ({
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
            log(chalk.red(`create -> ${model.modelName} : ${error.message}`))

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

            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    if (file?.path) await deleteFile(file.path)
                }
            } // Delete array of files (upload.array)

            if (error?.cause?.code === 11000) return res.status(400).json({ error: `${error.cause.keyValue.name} Already Exist.` })
            if (error.name === 'ValidationError') validate(res, error.errors)
            if (error.name === 'CastError') return res.status(400).json({ error: `Invalid value for ${error.path}` })
        }
    },

    update: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).json({ error: 'Invalid Request.' })
            const { password } = req.body;
            if (password?.length === 0) delete req.body.password;

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

            const response = await model.findByIdAndUpdate({ _id: req.params.id },
                { $set: req.body },
                { runValidators: true }
            ) // update Data
            if (!response) return res.status(404).json({ error: 'Not found' })

            if (req.file?.fieldname && req.file?.path) {
                await deleteFile(response[req.file.fieldname])
            } // Case: upload.single()

            if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
                for (const [fieldName, files] of Object.entries(req.files)) {
                    if (Array.isArray(response[fieldName])) {
                        for (const file of response[fieldName]) {
                            await deleteFile(file)
                        }
                    } else {
                        await deleteFile(response[fieldName])
                    }
                }
            }
            // Case: upload.fields()

            if (Array.isArray(req.files)) {
                const fieldName = response[req.files[0]?.fieldname];
                if (Array.isArray(fieldName)) for (const file of fieldName) await deleteFile(file)
            } // Case: upload.array()

            return res.status(200).json(
                {
                    success: 'update successfully',
                    redirect: `${req.baseUrl}/resources/${model.modelName}`
                })
        } catch (error) {
            log(chalk.red(`update -> ${model.modelName} : ${error.message}`))

            if (req.file && error) {
                await deleteFile(req.file.path)
            } // Delete single file (upload.single)

            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    if (file?.path) await deleteFile(file.path)
                }
            } // Delete array of files (upload.array)

            if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
                for (const [fieldName, files] of Object.entries(req.files)) {
                    for (const file of files) {
                        if (file?.path) await deleteFile(file.path);
                    }
                }
            }  // Delete files in fields object (upload.fields)

            if (error?.cause?.code === 11000) return res.status(400).json({ error: `${error.cause.keyValue.name} Already Exist.` })
            if (error.name === 'ValidationError') validate(res, error.errors)
            if (error.name === 'CastError') return res.status(400).json({ error: `Invalid value for ${error.path}.` })
        }
    },

    getSelectJsonData: async (req, res, modelName, display_key) => {
        try {
            const model = await registerModel(modelName)
            const response = await model.aggregate([
                { $match: { [display_key]: { $regex: String(req.query.search), $options: 'i' } } },
                { $addFields: { label: `$${display_key}`, value: '$_id' } },
                { $project: { label: 1, value: 1 } }
            ])

            return res.status(200).json(response)
        } catch (error) {
            log(chalk.red(`getSelectJsonData -> ${modelName} : ${error.message}`))
        }
    },

    getViewInfo: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).redirect(`${req.baseUrl}/404`)
            const response = await model.findById({ _id: req.params.id }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })

            return res.status(200).render(`${model.modelName}/view`, {
                title: capitalizeFirstLetter(model.modelName),
                [model.modelName]: response,
                breadcrumb: [{ name: capitalizeFirstLetter(model.modelName), url: `${req.baseUrl}/resources/${model.modelName}` }, { name: 'View', active: true }]
            })
        } catch (error) {
            log(chalk.red(`getViewInfo -> ${model.modelName} : ${error.message}`))
        }
    },

    getAllJsonData: async (req, res) => {
        try {
            // Pagination query
            const query = {
                page: req.query.page,
                limit: req.query.size
            };

            // Build columns for table
            const columns = [
                { col: 'No', maxWidth: 80, download: true },
                ...fields
                    .filter(col => col.isVisible)
                    .map(col => ({
                        col: col.col,
                        ...(col.filter && { filter: col.filter }),
                        ...(col.col === 'image' && { download: false }),
                    })),
                {
                    col: 'table_actions', download: false, maxWidth: 180, actions: {
                        edit: rewrite.edit, view: rewrite.view,
                    }
                }
            ]
            // Build aggregation pipeline
            const pipeline = fields
                .filter(col => col.isVisible)
                .flatMap(f => {
                    const displayName = f.display_name || f.field_name;
                    // Case: Date fields → format as YYYY-MM-DD
                    if (f.field_type === 'Date') {
                        return [
                            {
                                $addFields: { [f.col]: { $dateToString: { format: "%Y-%m-%d", date: `$${f.field_name}` } } }
                            }
                        ]
                    }

                    // Case: With Relation → populate reference and pick display_key
                    if (f.relation && f.relation !== 'No Relation') {
                        const collectionName = mongoose.model(f.relation).collection.name;
                        return [
                            { $lookup: { from: collectionName, localField: f.field_name, foreignField: '_id', as: displayName } },
                            { $unwind: { path: `$${displayName}`, preserveNullAndEmptyArrays: true } },
                            { $addFields: { [displayName]: { $ifNull: [`$${displayName}.${f.display_key}`, 'N/A'] } } }
                        ]
                    }

                    // Case: No Relation → check for deletable docs
                    if (f.relation && f.relation === 'No Relation') {
                        const docs_lookups = modelDependencies.map(m => {
                            const collectionName = mongoose.model(m.relation).collection.name;
                            return {
                                $lookup: {
                                    from: collectionName,
                                    localField: '_id',
                                    foreignField: m.field,
                                    as: `${m.relation}_Docs`
                                }
                            }
                        })

                        const docs_unwind = {
                            $addFields: {
                                canDelete: {
                                    $cond: {
                                        if: {
                                            $or: modelDependencies.map(
                                                item => ({
                                                    $gt: [{ $size: `$${item.relation}_Docs` }, 0]
                                                })
                                            )
                                        },
                                        then: false,
                                        else: true
                                    }
                                }
                            }
                        }
                        return [...docs_lookups, docs_unwind]

                        // const relationModel = modelDependencies.find(d => d.model === model.modelName)
                        // if (!relationModel) return [{ $addFields: { canDelete: true } }]

                        // const collectionName = mongoose.model(relationModel.relation).collection.name;
                        // return [
                        //     { $lookup: { from: collectionName, localField: '_id', foreignField: relationModel.field, as: 'relatedDocs' } },
                        //     {
                        //         $addFields: {
                        //             canDelete: {
                        //                 $cond: {
                        //                     if: { $gt: [{ $size: "$relatedDocs" }, 0] }, then: false,
                        //                     else: true
                        //                 }
                        //             }
                        //         }
                        //     }
                        // ]
                    }

                    // Case: Custom display_name (different from field_name)
                    if (f.display_name) {
                        return [{ $addFields: { [f.col]: `$${f.field_name}` } }]
                    }

                    return [] // fallback for fields without conditions
                })

            // Visible fields projection
            const visibleFields = Object.fromEntries(fields.filter(col => col.isVisible).map(col => [col.col, 1]))
            visibleFields.canDelete = 1;

            // Paginate aggregation results
            const response = await handleAggregatePagination(model, pipeline, query, req.query?.filter)

            // Send response
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
                if (f.relation && f.relation !== 'No Relation' && f.field_type === 'Array') {
                    await response.populate(f.field_name);
                }
            }

            return res.status(200).render(`${model.modelName}/update`, {
                title: capitalizeFirstLetter(model.modelName),
                api: `${req.baseUrl}/resources/${model.modelName}`,
                response,
                breadcrumb: [{ name: capitalizeFirstLetter(model.modelName), url: `${req.baseUrl}/resources/${model.modelName}` }, { name: 'Edit', active: true }]
            })
        } catch (error) {
            log(chalk.red(`renderEditPage -> ${model.modelName} : ${error.message}`))
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
                    breadcrumb: [{ name: 'CRUD', active: true, }]
                }
            )
        } catch (error) {
            console.log('renderCRUD : ' + error.message)
        }
    },
    renderGenerateCRUD: async (req, res) => {
        try {
            const collections = mongoose.modelNames().filter(m => m !== 'Structure' && m !== 'Admin').map(m => {
                const notIncluded = ['updatedAt', 'createdAt', '__v', '_id']
                return {
                    model: m,
                    fields: Object.keys(mongoose.model(m).schema.paths)
                        .filter(p => !notIncluded.includes(p))
                }
            })

            return res.status(200).render('crud/generateCRUD',
                {
                    title: 'Generate CRUD',
                    api: req.originalUrl,
                    collections,
                    breadcrumb: [{ name: 'CRUD', url: `${req.baseUrl}/crud` }, { name: 'Add', active: true, }],
                }
            )
        } catch (error) {
            if (error.name === 'ValidationError') validate(res, error.errors)
            console.log('renderGenerateCRUD : ' + error.message)
        }
    },
    getCRUDJsonData: async (req, res) => {
        try {
            const query = { page: req.query.page, limit: req.query.size, }
            const pipeline = [{ $project: { model: 1 } }]

            const response = await handleAggregatePagination(sturctureModel, pipeline, query, req.query?.filter)
            const columns = [
                { col: 'No', maxWidth: 80 },
                { col: 'model', filter: 'search' },
                {
                    col: 'actions', actions: {
                        edit: true, del: true
                    }
                },
            ]

            return res.status(200).json({
                last_row: response.totalDocs,
                last_page: response.totalPages,
                data: response.collectionData.reverse(),
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

            const collections = mongoose.modelNames()
                .filter(m => m !== 'Structure' && m !== 'Admin')
                .map(m => {
                    const model = mongoose.model(m)
                    const schemaPaths = model.schema.paths;
                    const notIncluded = ['updatedAt', 'createdAt', '__v', '_id']
                    const types = ['String', 'Number', 'Boolean', 'Date']

                    return {
                        model: m,
                        fields: Object.keys(schemaPaths).filter(p => {
                            const path = schemaPaths[p]
                            return (
                                !notIncluded.includes(p) &&
                                !types.includes(path.instance)
                            )
                        })
                    }
                })

            return res.status(200).render('crud/editCRUD',
                {
                    title: 'Edit CRUD',
                    api: '/admin/crud',
                    collections, response,
                    breadcrumb: [{ name: 'CRUD', url: `${req.baseUrl}/crud` }, { name: 'Edit', active: true, }],
                    schemaTypes: ["String", "Number", "Boolean", "Array", "ObjectId", "Date", "Double", "Mixed", 'Map'],
                    formTypes: ['none', "text", "select", "file", "email", "url", "tel", "search", "number", "range", "color", "date", "time", "datetime-local", "month", "week", "radio", "checkbox", "textarea"],
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