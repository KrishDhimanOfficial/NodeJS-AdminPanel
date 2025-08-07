import mongoose from "mongoose";
            import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

            const heloSchema = new mongoose.Schema({
                title: { 
            type: String,
            
            
            
        }
            },
            { timestamps: false })

            heloSchema.plugin(mongooseAggregatePaginate)
            export default mongoose.model('helo', heloSchema)