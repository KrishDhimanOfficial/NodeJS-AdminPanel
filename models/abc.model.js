import mongoose from "mongoose";
            import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

            const abcSchema = new mongoose.Schema({
                name: { 
            type: String,
            
            
            ref : 'xyz'
        },
images: { 
            type: String,
            
            
            
        },
tags: { 
            type: Array,
            
            
            ref : 'tag'
        }
            },
            { timestamps: false })

            abcSchema.plugin(mongooseAggregatePaginate)
            export default mongoose.model('abc', abcSchema)