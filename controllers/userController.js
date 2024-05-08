//async fucntion includes try catch, inorder to avoid try catch,use asyncHandler package
const asyncHandler = require("express-async-handler")
const User = require("../models/userModels")
const jwt = require("jsonwebtoken")
const Token = require("../models/tokenModels")
const bcrypt = require("bcryptjs")

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })
}

const registerUser = asyncHandler(async (req, res) => {
        
    //retrieve data from request
    const { firstName, lastName,  email, password, confirmPassword } = req.body

    
    // requiredfield validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        res.status(400)
        throw new Error("please fill in all required fields")
    }
    //passwordvalidation
    if (password.length < 12) {
        res.status(400)
        throw new Error("Password must be upto 12 characters")
    } 

    //password match
    if ((password !== confirmPassword)) {
        res.status(400)
        throw new Error("Password donot match with confirm password")
    }

     //check if user email already exists, throw err
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error("User EMAIL already been registered")
    }

    //else  create new user
    const user = await User.create({
        firstName, lastName , email, password
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
        res.status(400)
        throw new Error("Invalid user data")
    } 
})

const loginUser = asyncHandler(async (req, res) => {
    //retrieve data from request
    const { email, password  } = req.body

    // requiredfield validation
    if (!email || !password ) {
        res.status(400)
        throw new Error("please fill in all required fields")
    }

    //check if user is available
    const user = await User.findOne({ email })
    
    if (!user) {
        res.status(400)
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
        res.status(400)
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
    res.send("profile image")
})
const getUserList = asyncHandler(async (req, res) => {
    res.send("user List")
})



module.exports = { registerUser, loginUser, profileImageUpload, getUserList, logoutUser }