const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

require("./routes/UsersRouter")

app.use(express.json());

console.log("INJECTED KEYS:", Object.keys(process.env).filter(key => key.includes('MON')));

mongoose.connect(process.env.MONGO_URI, {
family: 4
})
.then(() => console.log("MongoDB Connected Successfully!"))
.catch(err => console.error("Connection Error:", err));

app.use("/api/auth", require("./routes/ProductsRouter.js"))
app.use("/users", require("./routes/UsersRouter.js"));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server Running on Port ${PORT}`);
});