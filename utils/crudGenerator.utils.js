import chalk from "chalk"
import fs from 'node:fs/promises'
import path, { parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import { capitalizeFirstLetter } from "captialize"
import sturctureModel from "../models/sturcture.model.js"
import mongoose from "mongoose"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * FN : CRUD_GENERATOR => Create Mongoose Schema, views File
 * FN : createModelFile => Create Mongoose Schema Structure
 * FN : createAddEJSFile => Create Views Add Form Sturcture
 */

const CRUD_GENERATOR = async (req, res) => {
    const { collection, timeStamp, field, isSubMenu, icon, modeldependenices, name, model } = req.body;
    const navigation = { isSubMenu, icon, modeldependenices, name, model }
    // console.log(req.body);
    console.log(req.body.field);
    uploader(collection, field.filter(Boolean))

    const filePath = path.join(__dirname, '../models', `${collection}.model.js`)
    const viewDir = path.join(__dirname, '../views', collection)

    try {
        if (!collection || field?.length === 0) return res.status(400).json({ error: 'All Fields are required.' })

        const response = await SaveData(collection, timeStamp, field.filter(Boolean), navigation)
        if (!response.success) return res.status(400).json({ error: 'Internal Server Error. Unable to create schema' })

        await fs.writeFile(filePath, createModelFile(collection, field.filter(Boolean), timeStamp)) // Create Schema
        await fs.mkdir(viewDir, { recursive: true }) // create View Files

        const viewTemplates = {
            create: createAddEJSFile(collection, field.filter(Boolean)),
            update: createUpdateEJSFile(collection, field.filter(Boolean)),
            view: createViewEJSFile(collection, field.filter(Boolean))
        } // Views Templates

        for (const [viewName, content] of Object.entries(viewTemplates)) {
            const ViewsfilePath = path.join(viewDir, `${viewName}.ejs`)
            await fs.writeFile(ViewsfilePath, content)
        }

        return res.status(200).json({ success: 'Schema created successfully', })
    } catch (error) {
        chalk.red(console.error('createSchema : ', error.message))
        return res.status(400).json({ error: 'Internal Server Error. Unable to create schema' })
    }
}

async function SaveData(collection, timeStamp, field, nav) {
    try {
        const isVisible = field.map(f => ({
            col: f.field_name.replace(/\s+/g, '_').toLowerCase().trim(),
            isVisible: f.isVisible === 'on',
            ...(f.searchFilter && {
                searchFilter: f.searchFilter
            })
        }))

        isVisible.push({
            col: 'actions', isVisible: true,
            actions: { view: true, edit: true, del: true }
        })

        const isSubMenu = nav.isSubMenu === 'on';
        const navigation = {
            name: isSubMenu ? capitalizeFirstLetter(nav.name) : capitalizeFirstLetter(collection),
            icon: isSubMenu ? nav.icon[1] : nav.icon[0],
            ...(isSubMenu && {
                subMenu: Array.isArray(nav.model) ? nav.model : [nav.model]
            })
        }

        const fields = field.map(f => ({
            field_name: f.field_name,
            field_type: f.field_type,
            form_type: f.form_type,
            required: f.required === 'on',
            unique: f.unique === 'on',
            default: f.defaultValue,
            ...(f.relation && { relation: f.relation }),
        }))

        const res = await sturctureModel.create({
            model: collection, timeStamp, navigation, fields,
            options: { isVisible },
            uploader: uploader(collection, field),
            modeldependenices: Array.isArray(nav.modeldependenices)
                ? nav.modeldependenices
                : [nav.modeldependenices]
        })

        if (!res) return { success: false }
        return { success: true }
    } catch (error) {
        chalk.red(console.error('SaveData : ', error.message))
        return { success: false }
    }
}

// Function That's set multer Config
const uploader = (collection, field) => {
    const files = field.filter(f => f.form_type === 'file')

    switch (true) {
        case files.length > 1:
            return {
                type: 'fields',
                folder: collection,
                fields: field.filter(f => f.form_type === 'file')
                    .map(f => ({
                        field_name: f.field_name,
                        count: parseInt(f.file?.length || 0),
                        size: parseInt(f.file?.size || 0)
                    }))
            }

        case files.length === 1 && parseInt(files[0].file?.length) === 1 || '':
            return {
                type: 'single',
                folder: collection,
                field_name: files[0].field_name,
                count: parseInt(files[0].file?.length || 0),
                size: parseInt(files[0].file?.size || 0)
            }

        case files.length === 1 && parseInt(files[0].file?.length) > 1:
            return {
                type: 'multi',
                folder: collection,
                field_name: files[0].field_name,
                count: parseInt(files[0].file?.length || 0),
                size: parseInt(files[0].file?.size || 0)
            }

        default:
            return { type: 'none' }
    }
}

// Function That's Create Mongoose Schema File
function createModelFile(collection, fields, timeStamp) {
    const schemaFields = fields.map(f => {
        let fieldType;

        switch (f.field_type) {
            case 'ObjectId':
                fieldType = 'mongoose.Schema.Types.ObjectId';
                break;
            case 'Mixed':
                fieldType = 'mongoose.Schema.Types.Mixed';
                break;
            case 'Date':
                fieldType = 'Date';
                break;
            default:
                fieldType = f.field_type;
                break;
        }

        return `${f.field_name}: { 
            type: ${fieldType},
            ${f.required === 'on' ? `required: [true, '${f.field_name} is required.'],` : ''}
            ${f.unique === 'on' ? `unique: [true, '${f.field_name} is already in use.'],` : ''}
            ${f.relation !== 'No Relation' ? `ref : '${f.relation}'` : ''}
        }`;
    }).join(',\n')

    const fileStructure = `
            import mongoose from "mongoose";
            import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

            const ${collection}Schema = new mongoose.Schema({
                ${schemaFields}
            },
            { timestamps: ${timeStamp === 'on'} })

            ${collection}Schema.plugin(mongooseAggregatePaginate)
            export default mongoose.model('${collection}', ${collection}Schema)`;
    return fileStructure.trim()
}


// That's Create EJS File
function createAddEJSFile(collection, fields) {
    const checkInputfile = fields.filter(f => f.form_type === 'file' && f.file?.length > 1)
    const formFields = fields.map(f => {
        const label = `<label for="${f.field_name}" class="form-label mb-2">${capitalizeFirstLetter(f.field_name)}</label>`;

        switch (f.form_type) {
            case 'select':
                return `
                <div class="mb-3">
                    ${label}
                    <select name="${f.field_name}" class="form-control select2" id="${f.field_name}">
                        <option value="" disabled selected>Select</option>
                    </select>
                </div>`

            case 'textarea':
                return `
                <div class="mb-3">
                    ${label}
                    <textarea name="${f.field_name}" class="form-control summernote" id="${f.field_name}" placeholder="${f.field_name}"></textarea>
                </div>`

            case 'checkbox':
                return `
                <div class="form-check d-flex mb-3">
                    <input class="form-check-input" name="${f.field_name}" type="checkbox" checked value="true" id="${f.field_name}" />
                    <label class="form-check-label" for="${f.field_name}">
                        ${f.field_name}
                    </label>
                </div>`

            default: // input type text
                return `
                <div class="mb-3">
                    ${label}
                    <input type="${f.form_type}" name="${f.field_name}" ${checkInputfile.includes(f) ? 'multiple' : ''} class="form-control" id="${f.field_name}" placeholder="${f.field_name}">
                </div>`
        }
    }).join('\n')

    const content = `<div class="container">
        <div class="row">
            <div class="col-12">
            <div class="card card-primary">
                <div class="card-header bg-purple">
                <h3 class="card-title">Add ${capitalizeFirstLetter(collection)} Information</h3>
                </div>
                <form id="SubmitForm">
                <div class="card-body">
                    ${formFields}
                </div>
                <div class="modal-footer justify-content-between">
                    <button id="submitFormBtn" class="btn btn-dark">Submit</button>
                </div>
                </form>
            </div>
            </div>
        </div>
    </div>`;
    return content.trim()
}

function createUpdateEJSFile(collection, fields) {
    const formFields = fields.map(f => {
        const label = `<label for="${f.field_name}" class="form-label mb-2">${capitalizeFirstLetter(f.field_name)}</label>`;

        switch (f.form_type) {
            case 'select':
                return `
                <div class="mb-3">
                    ${label}
                    <select name="${f.field_name}" class="form-control" id="${f.field_name}">
                        <option value="" disabled selected>Select</option>
                    </select>
                </div>`

            case 'textarea':
                return `
                <div class="mb-3">
                    ${label}
                    <textarea name="${f.field_name}" class="form-control" id="${f.field_name}" placeholder="${f.field_name}"></textarea>
                </div>`

            case 'checkbox':
                return `
                <div class="form-check d-flex mb-3">
                    <input class="form-check-input" name="${f.field_name}" type="checkbox" checked value="true" id="${f.field_name}" />
                    <label class="form-check-label" for="${f.field_name}">
                        ${f.field_name}
                    </label>
                </div>`

            default:
                return `
                <div class="mb-3">
                    ${label}
                    <input type="${f.form_type}" name="${f.field_name}" value="<%= response.${f.field_name} %>" class="form-control" id="${f.field_name}" placeholder="${f.field_name}">
                </div>`
        }
    }).join('\n')

    const content = `<div class="container">
        <div class="row">
            <div class="col-12">
            <div class="card card-primary">
                <div class="card-header bg-purple">
                <h3 class="card-title">Update ${capitalizeFirstLetter(collection)} Information</h3>
                </div>
                <form id="updateForm" data-id="<%= response._id %>">
                    <div class="card-body">
                        ${formFields}
                    </div>
                <div class="modal-footer justify-content-between">
                    <button id="submitFormBtn" class="btn btn-dark">Submit</button>
                </div>
                </form>
            </div>
            </div>
        </div>
    </div>`;
    return content.trim()
}

// Function That's Create View EJS File
function createViewEJSFile(collection, fields) {
    const content = `<div class="container">
        <div class="row">
            <div class="col-12">
            <div class="card card-primary">
                <div class="card-header bg-purple">
                <h3 class="card-title">View ${capitalizeFirstLetter(collection)} Information</h3>
                </div>
                <div class="card-body">
                </div>
            </div>
            </div>
        </div>
    </div>`;
    return content.trim()
}

export default CRUD_GENERATOR