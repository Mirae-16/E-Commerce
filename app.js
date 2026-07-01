const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

require("./routes/UsersRouter")

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.use("/api/auth", require("./routes/ProductsRouter.js"))
app.use("/users", require("./routes/UsersRouter.js"));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server Running on ${PORT}`);
});