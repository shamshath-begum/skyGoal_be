var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const { dbUrl } = require("../config/dbConfig");
const { UserModel } = require("../schema/UserSchema.js");
const {StudentModel}=require("../schema/studentschema.js")
const {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validate,
  upload,
  roleSalesRep,roleAdmin, roleStudent
} = require("../config/auth");
const jwt = require("jsonwebtoken");
const { CourseModel } = require('../schema/courseschema.js');


mongoose.set("strictQuery", true);
mongoose.connect(dbUrl);

// signup and upload the image
router.post("/signup",upload.single("image"), async (req, res) => {
  try {
    const{name,email,password,cpassword,role}=req.body
    if(!name || !email || !password || !cpassword ||!role || name === "" || email === "" || password === "" || cpassword === "" || role === ""){
      res.status(401).send({
        message:"All the fields are required"
      })
    }
  
    const {filename}=req.file
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      req.body.password = await hashPassword(req.body.password);
      req.body.cpassword = await hashPassword(req.body.cpassword);
      let doc = new UserModel({name:req.body.name,email:req.body.email,password:req.body.password,cpassword:req.body.cpassword,role:req.body.role,imgpath:req.file.filename});
      console.log(doc)
      await doc.save();
      res.status(201).send({
        message: "User Created successfully",
      });
    } else {
      res.status(400).send({ message: "User already exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

// login and token creation
router.post("/login", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    console.log(user);
    if (user) {
      if (await hashCompare(req.body.password, user.password)) {
        let token = createToken({
          name: user.name,
          email: user.email,
          role: user.role,
        });
        console.log(token);

        res
          .status(200)
          .send({ meassage: "Login Successful", token, role: user.role ,user});
        
        
      } else {
        res.status(400).send({ message: "Invalid credentials" });
      }
    } else {
      res.send({ message: "Email doesnot exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

// student registration
router.post("/student-registration", validate,roleSalesRep,async (req, res) => {
  try {
    let user = await StudentModel.findOne({ email: req.body.email });
    if (!user) {
      let doc = new StudentModel(req.body);
      await doc.save();
      res.status(201).send({
        message: "student Created successfully",
      });
    }else{
      res.send({
        message:"user already exist"
      })
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

// course registration
router.post("/course-registration",validate,roleStudent,async (req, res) => {
console.log(req.body)
  try {
    let course = await CourseModel.findOne({ email: req.body.email });
    if(!course){
      let doc = new CourseModel(req.body);
      await doc.save();
      res.status(201).send({
        message: "Course Created successfully",
  course
      });
    }else{
      res.status(400).send({ message: "Course already Created" });
    }

    
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

// student dashboard
router.get("/student-dashboard", validate, roleStudent, async (req, res) => {
  try {
    let data = await CourseModel.aggregate([
      {
        $group: { _id: "$course", count: { $sum: 1 } },
      },
    ]);
    console.log(data)
    res.status(201).send({
      students: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});


// admin dashboard
router.get("/dashboard", validate, roleAdmin, async (req, res) => {
  try {
    let data = await StudentModel.aggregate([
      {
        $group: { _id: "$status", count: { $sum: 1 } },
      },
    ]);
    res.status(201).send({
      students: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

// Get the dashboard detaiis with status
router.get(
  "/dashboard-list-items/:status",
  validate,
  roleAdmin,
  async (req, res) => {
    console.log(req.params.status)
    try {
      let data = await StudentModel.find({ status: req.params.status });
      console.log(data)
      res.status(201).send({
        students: data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error ",
        error,
      });
    }
  }
);

// Get the dashboard detaiis with course
router.get(
  "/dashboard-list-items/:course",
  validate,
  // roleStudent,
  async (req, res) => {
    console.log(req.params.course)
    try {
      let data = await CourseModel.find({ course: req.params.course });
      console.log(data)
      res.status(201).send({
        students: data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error ",
        error,
      });
    }
  }
);

// display the student details
router.get("/display-student",validate,roleAdmin, async (req, res) => {
  try {
    let data = await StudentModel.find();
    res.status(200).send({
      students: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

// delete the student
router.delete("/delete/:id",roleAdmin, async (req, res) => {
  try {
    let { id } = req.params;
    let data = await StudentModel.findByIdAndDelete({ _id: id });
    console.log(data);
    res.status(200).send({
      message: "student deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Internal Server error",
      error,
    });
  }
});

// update the student
router.put("/manage-student/:id", async (req, res) => {
  try {
    let data = await StudentModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    console.log(data)
    res.status(200).send({
      message: "Student updated successfully",
      student: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server error",
      error,
    });
  }
});

// manage student
router.get("/manage-student/:id", validate,roleAdmin,async (req, res) => {
  try {
    let data = await StudentModel.findOne({ _id: req.params.id });
    console.log(data);
    res.status(200).send({
      student: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

module.exports = router;
