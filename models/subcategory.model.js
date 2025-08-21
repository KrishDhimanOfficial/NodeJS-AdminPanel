import mongoose from 'mongoose'
            import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

            const subcategorySchema = new mongoose.Schema({
              name: {
    type: String,
    required: [true, "name is required."],
    unique: [true, "name is already in use."]
},
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "categoryId is required."],
    ref: "category"
}
            }, { timestamps: true })

            subcategorySchema.plugin(mongooseAggregatePaginate)
            export default mongoose.model("subcategory", subcategorySchema)