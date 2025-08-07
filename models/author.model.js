import mongoose from "mongoose";
            import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

            const authorSchema = new mongoose.Schema({name: { 
            type: String,
            required: [true, 'name is required.'],
            
            
        }},
            { timestamps: true })

            authorSchema.plugin(mongooseAggregatePaginate)
            export default mongoose.model('author', authorSchema)