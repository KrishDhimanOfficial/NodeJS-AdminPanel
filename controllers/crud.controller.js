/**
 * A factory function to generate CRUD controller methods for any Mongoose model.
 * @param {mongoose.Model} model - The Mongoose model.
 * @returns {object} CRUD methods
*/
import mongoose from "mongoose";
import fs from 'node:fs/promises'
import validate from "../services/validate.service.js"
import { deleteFile, containsImage } from '../services/removeFile.service.js'
import chalk from 'chalk';
import handleAggregatePagination from "../services/handlepagination.service.js";
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const log = console.log
const validateId = mongoose.Types.ObjectId.isValid;

export const createCrudController = (model, options = {}, aggregate) => ({
    create: async (req, res) => {
        try {
            // console.log(req.files);
            const val = options.check;
            const IsExist = await model.findOne({ val })
            if (IsExist) res.status(400).json({ info: `${options.check} Already Exist.` })

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

    getSelectJsonData: async (req, res, option) => {
        try {
            const response = await option.model?.aggregate([
                {
                    $match: {
                        [option.searchField]: { $regex: req.query.search, $options: 'i' }
                    }
                },
                { $project: { [option.searchField]: 1 } }
            ])
            return res.status(200).json(response)
        } catch (error) {
            log(chalk.red(`getSelectJsonData -> ${option.model?.modelName} : ${error.message}`))
        }
    },

    getViewInfo: async (req, res) => {
        try {
            if (!validateId(req.params.id)) return res.status(400).redirect(`${req.baseUrl}/404`)
            const response = await model.findById({ _id: req.params.id })

            const name = model.modelName;
            const responseObj = {}
            responseObj[name] = response
            responseObj['admin'] = req.user

            return res.status(200).render(`${model.modelName}/view`, responseObj)
        } catch (error) {
            log(chalk.red(`getViewInfo -> ${model.modelName} : ${error.message}`))
        }
    },

    getAllJsonData: async (req, res) => {
        try {
            const payload = 'helo'
            // return res.status(200).json(payload.repeat(100000))
            const query = { page: req.query.page, limit: req.query.size }

            if (typeof aggregate === 'function') {
                const response = await handleAggregatePagination(model, aggregate(req, res), query)

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
            const response = await model.findById({ _id: req.params.id })

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
                containImage.fields.forEach(field => {
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

    createSchema: async (req, res) => {
        const { collection, timeStamp, field } = req.body;
        const filePath = path.join(__dirname, '../models', `${collection}.model.js`)

        try {
            if (!collection || !field?.length || !timeStamp) return res.status(400).json({ error: 'All Fields are required.' })

            const schemaFields = field.map(f => `${f.field_name}: { type: ${f.field_type === 'objectId'
                ? 'mongoose.Schema.Types.ObjectId'
                : f.field_type === 'date'
                    ? 'Date'
                    : f.field_type}, 
                    }`
            ).join(',\n')

            const fileSturcture = `
            import mongoose from "mongoose"
            import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
            
            const ${collection}Schema = new mongoose.Schema({${schemaFields}},{ timestamps: ${timeStamp === 'on'} })
            
            ${collection}Schema.plugin(mongooseAggregatePaginate)
            export default mongoose.model('${collection}', ${collection}Schema)`;
            await fs.writeFile(filePath, fileSturcture) // Create Schema

            const viewDir = path.join(__dirname, '../views', collection)
            await fs.mkdir(viewDir, { recursive: true }) // create View Files

            const create = `<div class="container">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="card card-primary">
                                            <div class="card-header bg-purple">
                                                <h3 class="card-title">Add Information</h3>
                                            </div>
                                            <form id="SubmitForm">
                                                <div class="card-body">
                                                    <div class="mb-3">
                                                    ${field.map(f => `
                                                        ${
                                                            f.form_type === 'select' 
                                                            ? `<label for="${f.field_name}" class="form-label">${f.field_name}</label>
                                                            <Select name="${f.field_name}" class="form-control" id="${f.field_name}">
                                                                <option value="" disabled selected>Select</option>
                                                            </Select>` 
                                                            : f.form_type === 'textarea'
                                                            ? `<label for="${f.field_name}" class="form-label">${f.field_name}</label>
                                                               <textarea name="${f.field_name}" class="form-control" id="${f.field_name}" placeholder="${f.field_name}"></textarea>`
                                                            : f.form_type === 'checkbox'
                                                            ? `<label for="${f.field_name}" class="form-label">${f.field_name}
                                                                    <input type="checkbox" name="${f.field_name}" class="form-check-input" id="${f.field_name}">
                                                                </label>`
                                                            : `<label for="${f.field_name}" class="form-label">${f.field_name}</label>
                                                                <input type="text" name="${f.field_name}" class="form-control" id="${f.field_name}" placeholder="${f.field_name}">`
                                                        }
                                                    `).join('')
                                                    }
                                                    </div>
                                                </div>
                                            <div class="modal-footer justify-content-between">
                                        <button id="submitFormBtn" class="btn btn-primary">Submit</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>`;
            const viewTemplates = { create }
            for (const [viewName, content] of Object.entries(viewTemplates)) {
                const filePath = path.join(viewDir, `${viewName}.ejs`)
                try {
                    await fs.access(filePath)
                } catch {
                    await fs.writeFile(filePath, content)
                }
            }

            return res.status(200).json({ success: 'Schema created successfully' })
        } catch (error) {
            await fs.rm(path.join(__dirname, '../views', collection), { recursive: true, force: true })
            chalk.red(console.error('createSchema : ', error.message))
            return res.status(400).json({ error: 'Internal Server Error. Unable to create schema' })
        }
    }
})

// export default createCrudController