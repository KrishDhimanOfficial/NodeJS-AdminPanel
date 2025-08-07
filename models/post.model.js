import mongoose from "mongoose";
            import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

            const postSchema = new mongoose.Schema({
                title: { 
            type: String,
            required: [true, 'title is required.'],
            unique: [true, 'title is already in use.'],
            
        }
            },
            { timestamps: true })

            postSchema.plugin(mongooseAggregatePaginate)
            export default mongoose.model('post', postSchema)