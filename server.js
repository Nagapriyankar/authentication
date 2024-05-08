const dotenv = require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const userRoute = require("./routes/userRoute")
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser")
const path = require("path")

//initialize app
const app = express()

//middleware
app.use(express.json()) //helps to handle json data in application 
app.use(cookieParser())  //to create http only cookie as response to front end
app.use(bodyParser.json());   // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));   // Parse URL-encoded bodies


//initialize port
const PORT = process.env.PORT || 5000

//setup  root route
app.get("/", (req, res) => {
    res.send('Backend Application - Authentication')
})

app.use("/uploads", express.static(path.join(__dirname, "uploads")))  // linked file upload functionality - it is goig to point upload folder


//routes 
app.use("/api/users", userRoute)

//connect to db and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('connected to MongoDB')
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((error) => { 
        console.log(`Error Message: ${error}`)
    })
