const mongoose=require('mongoose')
const validator=require('validator')
const UserSchema=new mongoose.Schema({
    name:{type:String,required:true},
    
    email:{type:String,required:true ,
    validate:(value)=>validator.isEmail(value)
    },
role:{type:String,default:"salesRep"},
    password:{type:String,required:true},
    cpassword:{type:String,required:true},
    imgpath:{type:String,required:true},
    createdAt:{type:Date,default:Date.now()}
},{versionKey:false})


const UserModel=mongoose.model('user',UserSchema)
module.exports={UserModel}