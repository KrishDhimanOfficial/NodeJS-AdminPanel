import mongoose from 'mongoose'
            import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

            const testSchema = new mongoose.Schema({
              name: {
    type: String
}
            }, { timestamps: true })

            testSchema.plugin(mongooseAggregatePaginate)
            export default mongoose.model("test", testSchema)