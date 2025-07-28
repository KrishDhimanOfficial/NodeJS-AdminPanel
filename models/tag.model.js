import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tagSchema = new mongoose.Schema({
      name: { type: String },
      slug: { type: String }
},
      { timestamps: true })

tagSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model('tag', tagSchema)