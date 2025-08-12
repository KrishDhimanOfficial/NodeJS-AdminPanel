import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const navigationSchema = new mongoose.Schema({
    name: { type: String },
    icon: {
        type: String,
        required: [true, 'Icon is required.']
    },
    subMenu: []
}, { _id: false })

const fieldSchema = new mongoose.Schema({
    field_name: {
        type: String,
        required: [true, 'Field Name is required.'],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Field Name must be alphanumeric and underscores only.'
        ]
    },
    field_type: {
        type: String,
        required: [true, 'Field Type is required.'],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Field Type must be alphanumeric and underscores only.'
        ]
    },
    form_type: {
        type: String,
        required: [true, 'Form Type is required.'],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Form Type must be alphanumeric and underscores only.'
        ]
    },
    display_key: {
        type: String,
        trim: true
    },
    required: { type: Boolean, default: false },
    unique: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: false },
    filter: { type: String },
    col: { type: String },
    relation: { type: String },
    default: { type: String },
}, { _id: false })

const structureSchema = new mongoose.Schema({
    model: {
        type: String,
        required: [true, 'Model Name is required.'],
        unique: [true, 'Model Name is already in use.'],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Model Name must be alphanumeric and underscores only.'
        ]
    },
    timestamps: { type: Boolean, default: true },
    navigation: navigationSchema,
    modeldependenices: { type: [String] },
    fields: { type: [fieldSchema] },
    uploader: { type: Object },
    rewrite_files: { type: Boolean, default: true }
},
    { timestamps: true }
)

structureSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('Structure', structureSchema)