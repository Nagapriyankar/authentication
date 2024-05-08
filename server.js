const dotenv = require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

//initialize app
const app = express()

//initialize port
const PORT = process.env.PORT || 5000

//setup  root route
app.get("/", (req, res) => {
    res.send('Backend Application - Authentication')
})


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
