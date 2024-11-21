const express = require("express");
const userModel = require("../Models/user.model.js");
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const auth = require('../Middleware/auth.middleware.js')
const checkAuthorization = require('../Middleware/check.authorization.js')

const userRoute = express.Router();

userRoute.post('/login',async(req, res)=>{
  try {
    const email = req.body.email;
    const isExit = await userModel.findOne({email})
        if(isExit){
            const token = jwt.sign({email:email,userId:isExit._id,role:isExit.role },'key')
            res.json({msg:"login Successfully",token:token,currentUser:isExit})
        }else{
            res.json({msg:"Incorrect Email"})
        }
  } catch (error) {
    res.json({"Error in user":error.message})
  }
})

userRoute.get('/get-cartItem/:userId',async(req, res)=>{
  try {
    const userId = req.params.userId;
    const user = await userModel
      .findById(userId)
      .populate("cart") 
      .exec();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      msg: "Cart fetched successfully",
      cart: user.cart, 
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching cart", error: error.message });
  }
})

userRoute.get('/get-productItem/:userId',async(req, res)=>{
  try {
    const userId = req.params.userId;
    const user = await userModel
      .findById(userId)
      .populate("product") 
      .exec();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      msg: "Cart fetched successfully",
      product: user.product, 
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching cart", error: error.message });
  }
})

userRoute.get("/get-user",auth, checkAuthorization(['admin']) , async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json({ users: users });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users", details: error.message });
  }
});

userRoute.post('/register', async (req, res) => {
  try {
    const email = req.body.email;
    const user = new userModel({email});
    await user.save();
    res.status(201).json({ msg: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ error: "Error creating user", details: error.message });
  }
});

userRoute.patch('/update-user/:id',auth ,checkAuthorization(['admin']), async (req, res) => {
  try {
    const updatedUser = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ msg: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: "Error updating user", details: error.message });
  }
});

userRoute.patch('/add-toCart/:id',auth ,checkAuthorization(['seller','user']), async (req, res) => {
  try {
    const updatedUser = await userModel.findByIdAndUpdate(req.loggedUser.userId, {$addToSet:{cart:req.params.id}});
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ msg: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: "Error updating user", details: error.message });
  }
});

userRoute.patch('/remove-fromCart/:id',auth ,checkAuthorization(['seller','user']), async (req, res) => {
  try {
    const updatedUser = await userModel.findByIdAndUpdate(req.loggedUser.userId, {$pull:{cart:req.params.id}});
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ msg: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: "Error updating user", details: error.message });
  }
});

userRoute.delete('/delete-user/:id',auth ,checkAuthorization(['admin']) , async (req, res) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ msg: "User deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(400).json({ error: "Error deleting user", details: error.message });
  }
});


module.exports = userRoute;
