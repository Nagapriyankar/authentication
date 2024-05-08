const express = require("express")
const router = express.Router()
const { registerUser, loginUser, profileImageUpload, getUserList, logoutUser } = require("../controllers/userController")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/logout", logoutUser)
router.get("/profileImage", profileImageUpload)
router.get("/userList", getUserList)


module.exports = router