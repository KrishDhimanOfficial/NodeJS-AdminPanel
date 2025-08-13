import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        max: '100',
        minLength: '3',

        validate: {
            validator: (name) => {
                return validate(name)
            }
        },

        required: [true, "name is required."]
    },

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "postId is required."],
        ref: "post"
    }
}, { timestamps: true })

authorSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('author', authorSchema)