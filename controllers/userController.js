//async fucntion includes try catch, inorder to avoid try catch,use asyncHandler package
const asyncHandler = require("express-async-handler")
const User = require("../models/userModels")
const jwt = require("jsonwebtoken")
const Token = require("../models/tokenModels")
const bcrypt = require("bcryptjs")
const cloudinary = require("cloudinary").v2
const { fileSizeFormatter } = require("../utils/fileUploads")

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })
}

const registerUser = asyncHandler(async (req, res) => {

    //retrieve data from request
    const { firstName, lastName, email, password, confirmPassword } = req.body


    // requiredfield validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        res.status(400).json({ error: "please fill in all required fields" })
        throw new Error("please fill in all required fields")
    }
    //passwordvalidation
    if (password.length < 12) {
        res.status(400).json({ error: "Password must be upto 12 characters" })
        throw new Error("Password must be upto 12 characters")
    }

    //password match
    if ((password !== confirmPassword)) {
        res.status(400).json({ error: "Password donot match with confirm password" })
        throw new Error("Password donot match with confirm password")
    }

    //check if user email already exists, throw err
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400).json({ error: "User email already been registered" })
        throw new Error("User EMAIL already been registered")
    }

    //else  create new user
    const user = await User.create({
        firstName, lastName, email, password
    })

    //generate token
    const token = generateToken(user._id)

    //send http only cookie to front end- the res is used to handle login and logout 
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",  //this executes when deployed
        secure: true            //to use cookie only with https
    })

    //send success/err response 
    if (user) {
        const { _id, firstName, lastName, email } = user
        res.status(200).json({
            _id, firstName, lastName, email
        })
    }
    else {
        res.status(400).json({ error: "Invalid user data" })
        throw new Error("Invalid user data")
    }
})

const loginUser = asyncHandler(async (req, res) => {
    //retrieve data from request
    const { email, password } = req.body

    // requiredfield validation
    if (!email || !password) {
        res.status(400).json({ error: "please fill in all required fields" })
        throw new Error("please fill in all required fields")
    }

    //check if user is available
    const user = await User.findOne({ email })

    if (!user) {
        res.status(400).json({ error: "User not found,please Signup" })
        throw new Error("User not found,please Signup")
    }

    //check if pwd matches
    const PasswordMatch = await bcrypt.compare(password, user.password)

    //generate token
    const token = generateToken(user._id)

    // send http only cookie to front end- the res is used to handle login and logout
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",  //this executes when deployed
        secure: true            //to use cookie only with https
    })

    if (user && PasswordMatch) {
        const { _id, email, firstName } = user
        res.status(201).json({
            _id, firstName, email
        })
    }
    else {
        res.status(400).json({ error: "Invalid Email or Password" })
        throw new Error("Invalid Email or Password")
    }

})

const logoutUser = asyncHandler(async (req, res) => {
    //reset cookie to expired when on logout
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), //epires
        sameSite: "none",  //this executes when deployed
        secure: true            //to use cookie only with https
    })
    return res.status(200).json({ message: "Successfully Logged out" })
})

const profileImageUpload = asyncHandler(async (req, res) => {
    
    let fileData = {}
    if (req.file) {
         //save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, { folder: "authentication", resource_type: "image" })
            //req.file.path- file upload path inside project
        } catch (error) {
            res.status(500)
            throw new Error("Image could not be uploaded")
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,  //cloudinary url
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2)   //give size in bytes to kb
        }
    }
    const user = await User.findById(req.user._id)
    
    const updateImage = await User.findByIdAndUpdate(
        { _id: user._id },
        {
            photo : fileData
        }
    )

    if (updateImage) {
        res.status(201).json(updateImage)
    }
    else {
        res.status(400)
        throw new Error("Image not added, Try again!")
    }
})


const getUserList = asyncHandler(async (req, res) => {

    let skip = 0;
    let limit = 10;

    // skip and limit parameters are strings, convert to number
    if (req.query.skip) {
        skip = parseInt(req.query.skip);
    }
    if (req.query.limit) {
        limit = parseInt(req.query.limit);
    }
    // If skip or limit is negative, or limit is zero, return bad request
    if (skip < 0 || limit <= 0) {
        return res.status(400).json({ error: 'Invalid skip or limit parameter' });
    }

    // Query MongoDB to retrieve users with optional skip and limit
    const users = await User.find().skip(skip).limit(limit);
    // Send the users as response
    res.json(users);
})


module.exports = { registerUser, loginUser, profileImageUpload, getUserList, logoutUser }