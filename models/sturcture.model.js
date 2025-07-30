import mongoose from "mongoose";

const navigationSchema = new mongoose.Schema({
    name: { type: String },
    icon: { type: String },
    subMenu: [
        { model: { type: String } }
    ]
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
                default: {
                    view: { type: Boolean, default: true },
                    update: { type: Boolean, default: true },
                    delete: { type: Boolean, default: true },
                }
            }
        }
    ]
}, { _id: false })


const structureSchema = new mongoose.Schema({
    model: { type: String },
    navigation: navigationSchema,
    modeldependencies: { type: [String] },
    options: optionsSchema
},
    { timestamps: true }
)

export default mongoose.model('Structure', structureSchema);
