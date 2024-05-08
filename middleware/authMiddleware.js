const asyncHandler = require("express-async-handler")
const User = require("../models/userModels")
const jwt = require("jsonwebtoken")

const authUser = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        res.status(400)
        throw new Error("User not authorised, Please Login")
    }
        
    //verify token -- if token and secret key is provided, it will return all the parameters passed while generating token
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET)

    //check if verified user is avaiable in db
    const user = await User.findById(verifiedUser.id)

    if (!user) {
        res.status(401)
        throw new Error("User Not found")
    }

    req.user = user
    next() 
})



module.exports = authUser