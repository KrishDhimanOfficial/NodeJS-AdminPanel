import mongoose from "mongoose"
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const navigationSchema = new mongoose.Schema({
    name: { type: String },
    icon: { type: String },
    subMenu: []
}, { _id: false })

const optionsSchema = new mongoose.Schema({
    isVisible: { type: Object },
    list: [
        {
            _id: false,
            col: { type: String },
            searchFilter: { type: String },
            actions: {
                type: Object,
                default: { view: true, update: true, delete: true, }
            }
        }
    ]
}, { _id: false })

const fieldSchema = new mongoose.Schema({
    field_name: { type: String },
    field_type: { type: String },
    form_type: { type: String },
    required: { type: String },
    unique: { type: String },
    relation: { type: String },
    default: { type: String }
}, { _id: false })


const structureSchema = new mongoose.Schema({
    model: { type: String },
    timestamps: { type: Boolean, default: true },
    navigation: navigationSchema,
    modeldependenices: { type: [String] },
    options: optionsSchema,
    fields: { type: [fieldSchema] },
    status: { type: Boolean, default: true }
},
    { timestamps: true }
)

// structureSchema.pre('save', async function (next) {
//     const FILE_PATH = path.join(__dirname, '../utils', `resources.json`)
//     let data = [];

//     if (fs.access(FILE_PATH)) {
//         const fileContents = await fs.readFile(FILE_PATH, 'utf-8');
//         try {
//             data = JSON.parse(fileContents)
//         } catch (err) {
//             console.error('⚠️ Error parsing JSON, starting fresh');
//             data = [];
//         }
//     }

//     // Step 2: Append new structure
//     data.push(this)

//     // Step 3: Write back to file
//     await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
//     next()
// })

export default mongoose.model('Structure', structureSchema)