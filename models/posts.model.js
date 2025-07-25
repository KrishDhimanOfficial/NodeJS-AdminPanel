
import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const postsSchema = new mongoose.Schema({
        title: {
                type: String,
        },
        slug: {
                type: String,
        },
        desc: {
                type: String,
        },
        status: {
                type: Boolean,
        }
}, { timestamps: true })

postsSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('posts', postsSchema)