const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const cors = require("cors");
var jwt = require('jsonwebtoken')
 
 
const UserSchema = require('./userSchema');
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const mongoURI = `mongodb+srv://Prudhvi876:Prudhvi876@cluster0.xa0edpx.mongodb.net/facebook?retryWrites=true&w=majority`

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res => {
    console.log('Connected to db successfully');
}).catch(err => {
    console.log('Failed to connect', err);
})


const generateAccessToken = (user) => {
    return jwt.sign({id : user._id}, "mySecretKey",{expiresIn:"20s"})
}

const generateRefreshToken = (user) => {
    console.log(user)
    return jwt.sign({id:user._id},"myRefreshSecretKey")
}


let refreshTokens = []

app.post("/refresh",(req,res)=>{
    const refreshToken = req.body.token
    
    if(!refreshToken){
        return res.send({
            status : 401,
            message : "You are not authenticated"
        })
    }
    

    if(!refreshToken.includes(refreshToken)){
        return res.status(403).json("Refresh token is not valid")
    }
    

    jwt.verify(refreshToken,"myRefreshSecretKey",(err,user)=>{
        err && console.log(err)
        refreshTokens = refreshTokens.filter((token)=>token!==refreshToken)
        
        const newAccessToken = generateAccessToken(user)
        const newrefreshToken = generateRefreshToken(user)
        
        

        refreshTokens.push(newrefreshToken)
        
        res.status(200).json({
            accessToken : newAccessToken,
            refreshToken : newrefreshToken
        })
        
    })
})

app.post('/',(req, res) => {
    const {token} = req.body

    try{
        const user = jwt.verify(token,"mySecretKey")
        const useremail = user.email
        UserSchema.findOne({email : useremail}).then(data=>{
            res.send({
                status : "okay",
                data : data
            }).catch(err=>{
                console.log(err)
            })
        })
    }catch(err){
        console.log(err)
    }
})


function cleanUpAndValidate({username, email, password}) {
    return new Promise((resolve, reject) => {

        if(typeof(email) !== 'string')  
            reject('Invalid Email');
        if(typeof(username) !== 'string')  
            reject('Invalid Username');
        if(typeof(password) !== 'string')
            reject('Invalid Password');

        // Empty strings evaluate to false
        if(!username || !password || !email)
            reject('Invalid Data');

        if(username.length < 3 || username.length > 100) 
            reject('Username should be 3 to 100 charcters in length');
        
        if(password.length < 5 || password > 300)
            reject('Password should be 5 to 300 charcters in length');

        if(!validator.isEmail(email)) 
            reject('Invalid Email');

     

        resolve();
    })
}



app.post('/register',async(req,res)=>{
    const {username,email,password} = req.body


    try {
        await cleanUpAndValidate({username, password, email});
    }
    catch(err) {
        return res.send({
            status: 400, 
            message: err
        })
    }


    let userExists

    try{
        userExists = await UserSchema.findOne({email})
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Internal Server Error. Please try again.",
            error: err  
        })
    }

    if(userExists) 
        return res.send({
            status: 400,
            message: "User with email already exists"
        })

    try {
        userExists = await UserSchema.findOne({username});
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Internal Server Error. Please try again.",
            error: err  
        })
    }

    if(userExists) 
        return res.send({
            status: 400,
            message: "Username already taken"
        })

    // Hash the password Plain text -> hash 
    const hashedPassword = await bcrypt.hash(password, 13); // md5
    
    let user = new UserSchema({
        username,
        password: hashedPassword,
        email,
    })

    try {
        const userDb = await user.save(); // Create Operation
        return res.send({
            status: 200,
            message: "Registration Successful",
            data: userDb
        });
    }
    catch(err) {
        return res.send({
            status: 400,
            message: "Internal Server Error. Please try again.",
            error: err  
        })
    }
})

const verify = (req,res,next) =>{
    const authHeader = req.headers.authorization
    if(authHeader){
    const token =  authHeader.split(" ")[1]
    jwt.verify(token,"mySecretKey",(err,user)=>{
        if(err){
            return res.status(403).json("Token is not valid")
        }

        req.user = user
        next()
    })
}else {
    return res.status(401).json("You are not authenticated")
}
}

app.post("/login", async (req, res) => {
    try {

      const userDb = await UserSchema.findOne({ email: req.body.email });
      console.log(userDb);  
      if(!userDb){
        console.log("no user")
        return res.send({
            status : 404,
            message : "User not found"
        })
      }
      const validPassword = await bcrypt.compare(req.body.password, userDb.password)
      
      if(!validPassword){
        return res.send({
            status : 400,
            message : "Wrong Password"
        })
      }
      const accessToken = generateAccessToken(userDb)
      const refreshToken = generateRefreshToken(userDb)

      refreshTokens.push(refreshToken)
      return res.json({
        data: {...userDb,accessToken,refreshToken},
      })    
    } catch (err) {
      return res.send({
        status :500,
        message : err,
      })
    }
})

app.listen(4000, () => {
    console.log('Listening on port 4000');
})

