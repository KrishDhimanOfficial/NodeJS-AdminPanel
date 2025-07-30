import chalk from "chalk"
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { capitalizeFirstLetter } from "captialize"
import sturctureModel from "../models/sturcture.model.js"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * FN : CRUD_GENERATOR => Create Mongoose Schema, views File
 * FN : createModelFile => Create Mongoose Schema Structure
 * FN : createAddEJSFile => Create Views Add Form Sturcture
 */

const CRUD_GENERATOR = async (req, res) => {
    const { collection, timeStamp, field } = req.body;
    console.log(req.body);

    const filePath = path.join(__dirname, '../models', `${collection}.model.js`)
    const viewDir = path.join(__dirname, '../views', collection)

    try {
        if (!collection || field?.length === 0) return res.status(400).json({ error: 'All Fields are required.' })

        await fs.writeFile(filePath, createModelFile(collection, field, timeStamp)) // Create Schema
        // await fs.mkdir(viewDir, { recursive: true }) // create View Files

        //     const viewTemplates = {
        //         create: createAddEJSFile(collection, field),
        //         update: createUpdateEJSFile(collection, field),
        //         view: createViewEJSFile(collection, field)
        //     } // Views Templates

        //     for (const [viewName, content] of Object.entries(viewTemplates)) {
        //         const ViewsfilePath = path.join(viewDir, `${viewName}.ejs`)
        //         // try {
        //         //     await fs.access(ViewsfilePath)
        //         // } catch {
        //         await fs.writeFile(ViewsfilePath, content)
        //         // }
        //     }

        return res.status(200).json({ success: 'Schema created successfully', body: req.body })
    } catch (error) {
        chalk.red(console.error('createSchema : ', error.message))
        return res.status(400).json({ error: 'Internal Server Error. Unable to create schema' })
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
                    <input type="${f.form_type}" name="${f.field_name}" class="form-control" id="${f.field_name}" placeholder="${f.field_name}">
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