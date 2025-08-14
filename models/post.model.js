import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title is required."],
        unique: [true, "title is already in use."]
    },

    image: {
        type: String,
        // required: [true, "image is required."],
    },

    date: {
        type: Date,
    },

    comments: {
        type: Number,
        default: 0
    },

    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        // required: [true, "author_id is required."],

        ref: "author"
    },

    desc: {
        type: String,
        required: [true, "desc is required."],
        trim: true
    },

    tagId: {
        type: [mongoose.Schema.Types.ObjectId],
        required: [true, "tagId is required."],
        ref: "tag"
    },
},
    { timestamps: true })

postSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('post', postSchema)