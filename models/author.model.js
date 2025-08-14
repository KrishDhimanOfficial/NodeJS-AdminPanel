import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        max: '100',
        minLength: '3',
        required: [true, "name is required."],
        default: "helo"
    }
}, { timestamps: true })

authorSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('author', authorSchema)