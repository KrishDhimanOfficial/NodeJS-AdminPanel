import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, "name is already in use."],
    required: [true, "name is required."],
  }
}, { timestamps: true })

categorySchema.plugin(mongooseAggregatePaginate)
export default mongoose.model("category", categorySchema)