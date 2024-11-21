const jwt = require("jsonwebtoken")

const auth = async(req, res, next)=>{
    try {
        if(!req.headers.token){
            return res.json({msg:"token not exits"});
        }else{
            jwt.verify(req.headers.token,'key',(err,decoded)=>{
                if(err){
                    return res.json({msg:"Invalid token"})
                }else{
                    req.loggedUser = decoded;
                    next();
                }
            })
        }
    } catch (error) {
        res.json({"Error in auth":error.message})
    }
}

module.exports = auth;