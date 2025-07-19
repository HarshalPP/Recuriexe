const mongoose = require('mongoose')
const Schema = mongoose.Schema;



const sundayworking = new Schema(
    {

    title: { type: String, default: "", trim: true }, // Ensures title
    date: { 
        type: Date, 
        required: true, 
        unique: true 
      }, 

    status: { 
        type: String, 
        enum: ["active", "inactive"], 
        default: "active" 
      },
      employeeId: { 
        type: Schema.Types.ObjectId, 
        ref: "employee", 
        default: null 
      },

      department:[
 
        {

            departmentId:{
           
                    type:Schema.Types.ObjectId,
            ref: "newdepartment",
            default: null


            }
        }
      ],

      departmentSelection:{
        type:String,
        default:""
      }

},{
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }

);


const sundayModel = mongoose.model("sundayworking" , sundayworking)
module.exports = sundayModel;

