const express = require("express")
const router = express.Router()
const { registerUser, loginUser, profileImageUpload, getUserList, logoutUser } = require("../controllers/userController")
const authUser = require("../middleware/authMiddleware")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/logout", logoutUser)
router.get("/profileImage", profileImageUpload)
router.get("/userList", authUser, getUserList)


module.exports = router