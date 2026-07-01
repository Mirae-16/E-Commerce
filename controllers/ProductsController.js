const Product = require("../models/Product");

exports.getProducts = async(req,res)=>{

    const products = await Product.find().populate("category");

    res.json(products);

}

exports.createProduct = async(req,res)=>{

    const product = await Product.create(req.body);

    res.status(201).json(product);

}

exports.getProduct = async(req,res)=>{

    const product = await Product.findById(req.params.id);

    res.json(product);

}

exports.updateProduct = async(req,res)=>{

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true}
    );

    res.json(product);

}

exports.deleteProduct = async(req,res)=>{

    await Product.findByIdAndDelete(req.params.id);

    res.json({message:"Deleted Successfully"});

}