require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("./db/conn");
const cookieParser = require("cookie-parser")

const Products = require("./models/productsSchema")
const  DefaultData = require("./defaultdata")
const cors = require("cors")
const router = require("./routes/router")

app.use(express.json())
app.use(cookieParser(""));
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}));
app.use(router);

const port = 8005;

  app.get("/api/test", (req, res) => {
        try {
            console.log("Received request for /test");
            res.send("Test route is working!");
        } catch (error) {
             console.log("error" + error.message);
        }
    
   });
    app.get("/hello", (req, res) => {
       console.log("Hello route accessed");
       res.send("Hello World!");
   });

   app.use((req, res) => {
    console.log(`404 Not Found: ${req.originalUrl}`);
    res.status(404).send('404 Not Found');
});


app.listen(port, ()=>{
    console.log(`server is running on port number ${port}`);
});


DefaultData();