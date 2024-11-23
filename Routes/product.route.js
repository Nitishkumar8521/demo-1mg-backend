const express = require("express");
const productModel = require("../Models/product.model");
const userModel = require("../Models/user.model");
const checkAuthorization = require("../Middleware/check.authorization")
const mongoose = require('mongoose')
const cloudinary = require("cloudinary").v2;
const auth=require('../Middleware/auth.middleware')
require("dotenv").config();

// Configure Cloudinary once at the start

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret:process.env.api_secret,
})


const productRoute = express.Router();

productRoute.get('/get-product',async(req, res)=>{
    try {
        const { q , sortBy='price', order=-1 } = req.query;
        const pipeline = [];
        if(req.loggedUser.role==='seller'){
            const userId =new mongoose.Types.ObjectId(req.loggedUser.userId);
            pipeline.push({ $match: { sellerId: userId } });
        }
       
        if(q){
            const filter = new RegExp(q, 'i')
            pipeline.push({$match: {name: { $regex: filter }}});              
        }

        if(sortBy){
            const sortOrder = parseInt(order) || -1;
            pipeline.push({ $sort: { [sortBy]: sortOrder } });
        }
        const product = await productModel.aggregate(pipeline);
        res.json({product})

    } catch (error) {
        res.json({"Error in product":error.message})
    }
})

productRoute.get('/get-product/:category',async(req, res)=>{
    try {
        const { category } = req.params;
        const pipeline = [];
        if(req.loggedUser.role==='seller'){
            const userId =new mongoose.Types.ObjectId(req.loggedUser.userId);
            pipeline.push({ $match: { sellerId: userId } });
        }

        pipeline.push({$match:{category:category}})

        const product = await productModel.aggregate(pipeline);
        res.json({product})

    } catch (error) {
        res.json({"Error in product":error.message})
    }
})


productRoute.get('/get-product/:id',auth, checkAuthorization(["seller"]),async(req, res)=>{
    try {
       const { id } = req.params;
       console.log(id)
       const product = await productModel.findOne({_id:id});
       res.json({product});
    } catch (error) {
        res.json({"Error in product":error.message})
    }
})


productRoute.post('/add-product',auth, checkAuthorization(["seller"]), async (req, res) => {
    try {
        if (!req.files || !req.files.photo) {
            return res.status(400).json({ error: "Photo is required" });
        }

        const file = req.files.photo;

       
        const result = await cloudinary.uploader.upload(file.tempFilePath);

        const { name, price, category, quantity, rating } = req.body;

       
        const product = {
            name,
            image: result.url,
            price,
            category,
            quantity,
            sellerId: req.loggedUser.userId,
            rating,
        };

        
        const setProduct = new productModel(product);
        await setProduct.save();

        
        await userModel.findByIdAndUpdate(req.loggedUser.userId, {
            $push: { product: setProduct._id },
        });

        return res.status(201).json({
            msg: "Product created successfully",
            product: setProduct,
        });
    } catch (error) {
        
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});


productRoute.patch('/update-product/:id',auth,checkAuthorization(['admin','seller']),async(req, res)=>{
    try {        
        const product = await productModel.findOne({_id:req.params.id})
        if(!product){
            return res.json({msg:"Product not found"})
        }
        if(req.loggedUser.role==='admin'){
            const product = await productModel.findByIdAndUpdate(req.params.id, req.body);
            res.json({msg:"product Update successfully",product})
        }else if(product.sellerId.equals(req.loggedUser.userId)){
            const product = await productModel.findByIdAndUpdate(req.params.id, req.body);
            res.json({msg:"product Update successfully",product})
        }else{
            res.json({msg:"You are not authorize for updating this product"})
        }
    } catch (error) {
        res.json({"Error in product":error.message});
    }
})

productRoute.delete('/delete-product/:id',auth,checkAuthorization(['seller']),async(req, res)=>{
    try {        
        const product = await productModel.findOne({_id:req.params.id})
        if(!product){
            return res.json({msg:"Product not found"})
        }
        if(req.loggedUser.role==='admin'){
            const product = await productModel.findByIdAndDelete(req.params.id);
            await userModel.findByIdAndUpdate(req.loggedUser.userId,{$pop:{product:req.params.id}})
            res.json({msg:"product delete successfully",product})
        }else if(product.sellerId.equals(req.loggedUser.userId)){
            const product = await productModel.findByIdAndDelete(req.params.id);
            await userModel.findByIdAndUpdate(req.loggedUser.userId,{$pull:{product:req.params.id}})
            res.json({msg:"product delete successfully",product})
        }else{
            res.json({msg:"You are not authorize for deleting this product"})
        }
    } catch (error) {
        res.json({"Error in product":error.message});
    }
})


module.exports = productRoute;