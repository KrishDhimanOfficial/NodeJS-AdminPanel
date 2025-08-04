import mongoose from "mongoose";
            import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

            const postSchema = new mongoose.Schema({
                title: { 
            type: String,
            required: [true, 'title is required.'],
            
            
        },
image: { 
            type: String,
            required: [true, 'image is required.'],
            
            
        }
            },
            { timestamps: true })

            postSchema.plugin(mongooseAggregatePaginate)
            export default mongoose.model('post', postSchema)