
import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const categorySchema = new mongoose.Schema({
        name: {
                type: String,
        },
        status: {
                type: Boolean,
        }
}, { timestamps: true })

categorySchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('category', categorySchema)