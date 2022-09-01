const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const schema = require('./schema')

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));

const mongoURI = `mongodb+srv://Prudhvi876:Prudhvi876@cluster0.xa0edpx.mongodb.net/jwt?retryWrites=true&w=majority`

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res => {
    console.log('Connected to db successfully');
}).catch(err => {
    console.log('Failed to connect', err);
})

let refreshTokens = [];


const verify = (req, res, next) => {
    const authHeader = req.body.token;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
  
      jwt.verify(token, "mySecretKey", (err, user) => {
        if (err) {
          return res.status(403).json("Token is not valid!");
        }
  
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You are not authenticated!");
    }
  };



app.post("/refresh", (req, res) => {
    //take the refresh token from the user
    const refreshToken = req.body.token;
  
    //send error if there is no token or it's invalid
    if (!refreshToken) return res.status(401).json("You are not authenticated!");
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh token is not valid!");
    }
    jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
      err && console.log(err);
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);
  
      refreshTokens.push(newRefreshToken);
  
      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });
  
    //if everything is ok, create new access token, refresh token and send to user
});



const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id }, "mySecretKey", {
      expiresIn: "60s",
    });
    
};
  
const generateRefreshToken = (user) => {
return jwt.sign({ id: user._id }, "myRefreshSecretKey");
};



app.get('/', verify ,(req, res) => {
    res.send('Welcome to our app');
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
        userExists = await schema.findOne({email})
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
        userExists = await schema.findOne({username});
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
    const accessToken = generateAccessToken(email)

    let user = new schema({
        username,
        password: hashedPassword,
        email,
    })

    try {
        const userDb = await user.save(); // Create Operation

        return res.send({
            status: 200,
            accessToken ,
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


app.post("/login", async (req, res) => {
    const {email,password} = req.body
    try {
        
      const userDb = await schema.findOne({ email });
      if(!userDb){
        return res.send({
            status : 404,
            message : "User not found"
        })
      }
      const validPassword = await bcrypt.compare(password, userDb.password)
      if(!validPassword){
        return res.send({
            status : 400,
            message : "Wrong Password"
        })
      }

      const accessToken = generateAccessToken(userDb)

      const refreshToken = generateRefreshToken(userDb)


      refreshTokens.push(refreshToken)


      return res.send({
        data: userDb,
        accessToken,
        refreshToken,
        message : "okay"
      })    
    } catch (err) {
      return res.send({
        status :500,
        message : "asdasd",
      })
    }
})


app.post("/logout", verify, (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.status(200).json("You logged out successfully.");
  });

  

app.listen(6000, () => {
    console.log('Listening on port 6000');
})

