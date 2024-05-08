const express = require("express")
const router = express.Router()
const { registerUser, loginUser, profileImageUpload, getUserList, logoutUser } = require("../controllers/userController")
const authUser = require("../middleware/authMiddleware")
const { upload } = require("../utils/fileUploads")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/logout", logoutUser)
router.patch("/profileImage", authUser, upload.single("image"), profileImageUpload)
router.get("/userList", authUser, getUserList)


module.exports = router