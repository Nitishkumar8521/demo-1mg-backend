const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name:{type:String, required:true },
    image:{ type:String },
    price:{ type:Number, required:true, min:0 },
    category:{ type:String, required:true, enum:["diabetes","heart","stomach","liver","bone","kidney","derma"]},
    quantity:{type:Number, min:1 },
    sellerId:{type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    rating:{type:Number, min:1, max:5 }
})

const productModel = mongoose.model("Product",productSchema);

module.exports = productModel;