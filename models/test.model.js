import mongoose from "mongoose";
    import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

    const testSchema = new mongoose.Schema({
      name: {
    type: String,
    required: [true, "name is required."]
}
    }, { timestamps: true })

    testSchema.plugin(mongooseAggregatePaginate)
    testSchema.pre('save', function(next) { next(); });
    testSchema.pre('findOneAndUpdate', function(next) { next(); });
    export default mongoose.model("test", testSchema);
    