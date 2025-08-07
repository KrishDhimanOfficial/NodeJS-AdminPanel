import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
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

const fieldSchema = new mongoose.Schema({
    field_name: { type: String },
    field_type: { type: String },
    form_type: { type: String },
    required: { type: Boolean },
    unique: { type: Boolean },
    isVisible: { type: Boolean },
    filter: { type: String },
    col: { type: String },
    relation: { type: String },
    default: { type: String }
}, { _id: false })


const structureSchema = new mongoose.Schema({
    model: { type: String },
    timestamps: { type: Boolean, default: true },
    navigation: navigationSchema,
    modeldependenices: { type: [String] },
    fields: { type: [fieldSchema] },
    uploader: { type: Object },
},
    { timestamps: true }
)

structureSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('Structure', structureSchema)