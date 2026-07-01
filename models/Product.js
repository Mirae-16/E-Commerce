const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    description:String,

    price:{
        type:Number,
        required:true
    },

    stock:Number,

    image:String,

    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    }

});

module.exports = mongoose.model("Product",productSchema);