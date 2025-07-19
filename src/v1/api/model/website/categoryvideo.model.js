const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const categoryVideoSchema = new Schema({
    category: {
        type: String,
        required: true,
        unique: true
    },
    // video should be an array of object
    video: [{
     
        videotitle:{
         type:String,
         required:false
        },

        videoUrl: {
            type: String,
            required: true
        }
       
    }]

},{
    timestamps: true
})

const CategoryVideo = mongoose.model("CategoryVideo", categoryVideoSchema);
module.exports = CategoryVideo;