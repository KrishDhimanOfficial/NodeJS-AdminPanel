import mongoose from 'mongoose'
            import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

            const categorySchema = new mongoose.Schema({
              name: {
    type: String,
    required: [true, "name is required."],
    unique: [true, "name is already in use."]
}
            }, { timestamps: true })

            categorySchema.plugin(mongooseAggregatePaginate)
            export default mongoose.model("category", categorySchema)