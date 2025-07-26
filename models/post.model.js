import mongoose from "mongoose";
            import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

            const postSchema = new mongoose.Schema({
                  name: { type: String },
  slug: { type: String },
  image: { type: String },
  desc: { type: String },
  status: { type: String }
            },
            { timestamps: true })

            postSchema.plugin(mongooseAggregatePaginate)
            export default mongoose.model('post', postSchema)