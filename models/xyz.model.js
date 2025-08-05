import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const xyzSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'title is required.'],


    },
    image: {
        type: String,
        required: [true, 'image is required.'],


    },
    resume: {
        type: String,
        required: [true, 'resume is required.'],
    }
},
    { timestamps: false })

xyzSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('xyz', xyzSchema)