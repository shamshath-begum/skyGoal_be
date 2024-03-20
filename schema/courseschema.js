const mongoose=require('mongoose')
const validator=require('validator')
const CourseSchema=new mongoose.Schema({
    firstName:{type:String,required:true},
    
    lastName:{type:String,required:true},
    email:{type:String,required:true ,
    validate:(value)=>validator.isEmail(value)
    },

    course:{type:String,required:true},
    // image:{type:String,required:true},
    
    createdAt:{type:Date,default:Date.now()}
},{versionKey:false,collection:"course"})
const CourseModel=mongoose.model('course',CourseSchema)
module.exports={CourseModel}


