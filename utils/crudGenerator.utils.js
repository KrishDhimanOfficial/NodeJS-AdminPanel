import chalk from 'chalk'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { capitalizeFirstLetter } from "captialize"
import sturctureModel from "../models/sturcture.model.js"
import validate from '../services/validate.service.js'
import createModelFile from "./createModeFile.utils.js"
import config from '../config/config.js'
import { exec } from 'node:child_process'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * FN : CRUD_GENERATOR => Create Mongoose Schema, views File
 * FN : createModelFile => Create Mongoose Schema Structure
 * FN : createAddEJSFile,createUpdateEJSFile,createViewEJSFile => Create Views Add Form Sturcture
*/

const CRUD_GENERATOR = async (req, res) => {
    const {
        collection,
        timeStamp,
        field = [],
        isSubMenu,
        icon,
        modelDependencies,
        name,
        model,
        view, edit, create,
        rewrite_files, dataTableApi, dataTableApi_check,
    } = req.body;
    console.log(req.body);
    const metaData = { dataTableApi, dataTableApi_check }
    const file_permissions = { view, edit, create, rewrite_files }
    const filteredFields = field.filter(Boolean)
    const navigation = { isSubMenu, icon, modelDependencies, name, model }
    const filePath = path.join(__dirname, '../models', `${collection}.model.js`)
    const viewDir = path.join(__dirname, '../views', collection)

    if (!collection || filteredFields.length === 0) return res.status(400).json({ error: 'All Fields are required.' })

    try {
        // Check if collection already exists
        const existingCollection = await sturctureModel.findOne({ model: collection })
        if (existingCollection && !req.params.id) return res.status(400).json({ error: `${collection} Collection already exists.` })

        // Save metadata and upload required files
        const response = await SaveData(collection, timeStamp, filteredFields, navigation, req.method,
            req.params.id, file_permissions, metaData)
        if (!response.success) return validate(res, response.error.errors)

        // Generate and write model file
        createModelFile(filePath, collection, filteredFields, timeStamp)

        // Create view directory
        if (view === 'on' || edit === 'on' || create === 'on') await fs.mkdir(viewDir, { recursive: true })

        // Generate and write EJS view files
        createEjsFiles(collection, filteredFields, viewDir, file_permissions)

        exec('npm restart', { shell: true })
        return res.status(200).json({ success: 'Schema created successfully.' })
    } catch (error) {
        console.error('createSchema:', error.message)
        return res.status(500).json({ error: 'Internal Server Error. Unable to create schema.' })
    }
}

async function SaveData(collection, timeStamp, field, nav, requestMethod, id, file_permissions, metaData) {

    try {
        const isSubMenu = nav.isSubMenu === 'on';
        const navigation = {
            name: isSubMenu ? capitalizeFirstLetter(nav.name) : capitalizeFirstLetter(collection),
            icon: isSubMenu ? nav.icon[1] : nav.icon[0],
            ...(isSubMenu && {
                subMenu: Array.isArray(nav.model) ? nav.model : [nav.model]
            })
        }

        const fields = field.map(f => ({
            field_name: f.field_name?.replace(/\s+/g, '_').trim(),
            field_type: f.field_type,
            form_type: f.form_type,
            required: f.required === 'on',
            isVisible: f.isVisible === 'on',
            filter: f.searchFilter,
            unique: f.unique === 'on',
            default: f.defaultValue,
            col: f.display_name !== ''
                ? f.display_name?.replace(/\s+/g, '_').trim()
                : f.field_name?.replace(/\s+/g, '_').trim(),
            ...(f.display_name !== '' && { display_name: f.display_name?.replace(/\s+/g, '_').trim() }),
            ...(f.relation && { relation: f.relation }),
            ...(f.display_key && { display_key: f.display_key }),
            ...(f.radio_option && { radio_option: f.radio_option.split(',') }),
            ...(f.checkbox_option && { checkbox_option: f.checkbox_option.split(',') }),
        }))

        const modelDependencies = nav.modelDependencies
            ? Array.isArray(nav.modelDependencies)
                ? nav.modelDependencies.map(d => ({ model: collection, field: d.split('|')[1], relation: d.split('|')[0], }))
                : [{ model: collection, field: nav.modelDependencies.split('|')[1], relation: nav.modelDependencies.split('|')[0], }]
            : []

        const rewrite = {
            view: file_permissions.view === 'on',
            edit: file_permissions.edit === 'on',
            create: file_permissions.create === 'on',
        }

        const data = {
            model: collection, timeStamp, navigation, fields,
            uploader: uploader(collection, field),
            rewrite, modelDependencies,
            // rewrite_files: file_permissions.rewrite_files === 'on',
            ...(metaData.dataTableApi_check == 'on' && { dataTableApi: metaData.dataTableApi }),
        }

        const unsetData = {}
        if (metaData.dataTableApi_check !== 'on' && requestMethod === 'PUT') unsetData.dataTableApi = ''

        const res = requestMethod === 'PUT'
            ? await sturctureModel.findByIdAndUpdate({ _id: id }, { $set: data, $unset: unsetData }, { new: true, runValidators: true })
            : await sturctureModel.create(data)

        if (!res) return { success: false }
        return { success: true, _id: res._id }
    } catch (error) {
        chalk.red(console.error('SaveData : ', error.message))
        return { success: false, error }
    }
}

async function createEjsFiles(collection, filteredFields, viewDir, file_permissions) {
    const { edit: update, ...rest } = file_permissions;
    const access = { ...rest, update }

    const views = {
        create: createAddEJSFile(collection, filteredFields),
        update: createUpdateEJSFile(collection, filteredFields),
        view: createViewEJSFile(collection, filteredFields)
    }

    return await Promise.all(
        Object.entries(views).map(async ([name, content]) => {
            const viewPath = path.join(viewDir, `${name}.ejs`)
            return access[name] === 'on' && access[name] !== undefined
                ? fs.writeFile(viewPath, content)
                : await fs.unlink(viewPath).catch(err => err.code !== 'ENOENT' && Promise.reject(err))
        })
    )
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

// That's Create EJS File
function createAddEJSFile(collection, fields) {
    const checkInputfile = fields.filter(f => f.form_type === 'file' && f.file?.length > 1)
    const formFields = fields.map(f => {
        const label = `<label for="${f.field_name}" class="form-label mb-2">${capitalizeFirstLetter(f.display_name || f.field_name)}</label>`;

        switch (f.form_type) {
            case 'none':
                return ''
            case 'select':
                return `
                <div class="mb-3">
                    ${label}
                    <select name="${f.field_name}" ${f.field_type === 'Array' ? 'multiple' : ' '} data-selectbox="true" class="form-control select2" id="${f.relation}">
                       ${f.field_type === 'Array'
                        ? ''
                        : '<option value="" disabled selected>Select</option>'}
                    </select>
                </div>`

            case 'textarea':
                return `
                <div class="mb-3">
                    ${label}
                    <textarea name="${f.field_name}" class="form-control summernote" id="${f.field_name}" placeholder="${f.field_name}"></textarea>
                </div>`

            case 'radio':
                const options = f.radio_option?.split(',')
                return `<div class="mb-3 d-flex flex-column">
                    ${label}
                    <div class='d-flex'>
                     ${options?.map(o => `<div class="form-check form-check-inline">
                        <input class="form-check-input"
                            type="${f.form_type}" 
                            name="${f.field_name}" 
                            id="${o}" 
                            value="response.${f.field_name}" 
                            <%= response.${f.field_name} && 'checked' %> 
                        />
                        <label class="form-check-label" for="${o}">${o}</label>
                    </div>`).join('')}
                     </div>
                    </div>`

            case 'checkbox':
                const checkoptions = f.checkbox_option?.split(',')
                return `<div class="mb-3 d-flex flex-column">
                    ${label}
                    <div class='d-flex'>
                     ${checkoptions?.map(o => `<div class="form-check form-check-inline">
                        <input 
                            class="form-check-input" 
                            type="${f.form_type}" 
                            name="${f.field_name}" 
                            id="${o}" 
                            value="${o}" 
                            <%= response.${f.field_name}.includes('${o}') && 'checked' %> 
                            /> 
                        <label class="form-check-label" for="${o}">${o}</label>
                    </div>`).join('')}
                     </div>
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
    const checkInputfile = fields.filter(f => f.form_type === 'file' && f.file?.length > 1)
    const formFields = fields.map(f => {
        const label = `<label for="${f.field_name}" class="form-label mb-2">${capitalizeFirstLetter(f.display_name || f.field_name)}</label>`;

        switch (f.form_type) {
            case 'none':
                return ''
            case 'select':
                return `
                <div class="mb-3">
                    ${label}
                    <select name="${f.field_name}" ${f.field_type === 'Array' ? 'multiple' : ' '} data-selectbox="true" class="form-control" id="${f.relation}">
                        ${f.field_type === 'Array'
                        ? `<% response.${f.field_name}.forEach(${f.field_name} => { %>
                            <option value="<%= ${f.field_name}._id %>" selected >
                                <%= ${f.field_name}.${f.display_key} %>
                            </option>
                           <% }) %>`
                        : `<option value="<%= response.${f.field_name}?._id %>" selected>
                            <%= response.${f.field_name}?.${f.display_key} %>
                            </option>`
                    }
                    </select>
                </div>`

            case 'date':
                return `
                <div class="mb-3">
                    ${label}
                      <input 
                            type="${f.form_type}" 
                            name="${f.field_name}" 
                            value="<%= response.${f.field_name}.toISOString().split('T')[0] %>" 
                            class="form-control" 
                            id="${f.field_name}" 
                            placeholder="${f.field_name}"
                        />
                </div>`

            case 'radio':
                const options = f.radio_option?.split(',')
                return `<div class="mb-3 d-flex flex-column">
                    ${label}
                    <div class='d-flex'>
                     ${options?.map(o => `<div class="form-check form-check-inline">
                        <input class="form-check-input"
                            type="${f.form_type}" 
                            name="${f.field_name}" 
                            id="${o}" 
                            value="response.${f.field_name}" 
                            <%= response.${f.field_name} && 'checked' %> 
                        />
                        <label class="form-check-label" for="${o}">${o}</label>
                    </div>`).join('')}
                     </div>
                    </div>`

            case 'checkbox':
                const checkoptions = f.checkbox_option?.split(',')
                return `<div class="mb-3 d-flex flex-column">
                    ${label}
                    <div class='d-flex'>
                     ${checkoptions?.map(o => `<div class="form-check form-check-inline">
                        <input 
                            class="form-check-input" 
                            type="${f.form_type}" 
                            name="${f.field_name}" 
                            id="${o}" 
                            value="${o}" 
                            <%= response.${f.field_name}.includes('${o}') && 'checked' %> 
                            /> 
                        <label class="form-check-label" for="${o}">${o}</label>
                    </div>`).join('')}
                     </div>
                    </div>`

            case 'textarea':
                return `
                <div class="mb-3">
                    ${label}
                    <textarea name="${f.field_name}" class="form-control summernote" id="${f.field_name}" placeholder="${f.field_name}">
                        <%= response.${f.field_name} %>
                    </textarea>
                </div>`

            default:
                return `
                <div class="mb-3">
                    ${label}
                    <input type="${f.form_type}" ${checkInputfile.includes(f) ? 'multiple' : ''} name="${f.field_name}" value="<%= response.${f.field_name} %>" class="form-control" id="${f.field_name}" placeholder="${f.field_name}">
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