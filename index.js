const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./Routes/user.route');
const auth = require('./Middleware/auth.middleware');
const productRoute = require('./Routes/product.route');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const cors = require('cors')


const app = express();
app.use(cors({
    origin:"*"
}))

app.use(express.json());
app.use(fileUpload({
    useTempFiles:true
}))

app.use('/user', userRoute);
app.use('/product',auth,productRoute)

app.get('/', (req, res) => {
    res.json({ msg: "Welcome to home page" });
});

// Connect to MongoDB and Start the Server
mongoose.connect(process.env.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to MongoDB successfully");

    app.listen(8080, () => {
        console.log("Server is started at port 8080");
    });
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
});