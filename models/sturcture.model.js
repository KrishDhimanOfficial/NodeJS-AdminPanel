import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const navigationSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    icon: {
        type: String,
        trim: true,
        required: [true, 'Icon is required.']
    },
    subMenu: []
}, { _id: false })

const fieldSchema = new mongoose.Schema({
    field_name: {
        type: String,
        trim: true,
        required: [true, 'Field Name is required.'],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Field Name must be alphanumeric and underscores only.'
        ]
    },
    field_type: {
        type: String,
        trim: true,
        required: [true, 'Field Type is required.'],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Field Type must be alphanumeric and underscores only.'
        ]
    },
    form_type: {
        type: String,
        trim: true,
        required: [true, 'Form Type is required.'],
    },
    display_key: {
        type: String,
        trim: true
    },
    radio_option: { type: [String], trim: true }, // For : radio_buttons
    checkbox_option: { type: [String], trim: true }, // For : checkboxes
    display_name: { type: String, trim: true },
    required: { type: Boolean, default: false },
    unique: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: false },
    filter: { type: String },
    col: { type: String, trim: true },
    relation: { type: String, trim: true },
    default: { type: String, trim: true },
}, { _id: false })

const structureSchema = new mongoose.Schema({
    model: {
        type: String,
        trim: true,
        required: [true, 'Model Name is required.'],
        unique: [true, 'Model Name is already in use.'],
        match: [
            /^[a-zA-Z0-9_]+$/,
            'Model Name must be alphanumeric and underscores only.'
        ]
    },
    modelDependencies: { type: Array },
    timestamps: { type: Boolean, default: true },
    navigation: navigationSchema,
    fields: { type: [fieldSchema] },
    uploader: { type: Object },
    rewrite_files: { type: Boolean, default: true }
},
    { timestamps: true }
)

structureSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('Structure', structureSchema)