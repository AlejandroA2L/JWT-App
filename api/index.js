//Importaciones necesarias express,jsonwebtoken
const express = require('express');
const jwt = require('jsonwebtoken');

//Instanciando las funcionalidades de express
const app = express();

//
app.use(express.json());
const users = [
{
    id: "1",
    username:"Ale",
    password:"Ale12345",
    isAdmin: true,
},
{

    id: "2",
    username:"Juan",
    password:"Juan12345",
    isAdmin: false,

}
];

let refreshTokens = [];
app.post("/api/refresh",(req,res)=>{
    //Take the refresh token from user
    const refreshToken = req.body.token;

    if(!refreshToken) return res.status(401).json("You are not authenticated");
    if(!refreshTokens.includes(refreshToken)) return res.status(403).json("Token is not valid");

    jwt.verify(refreshToken,"myRefreshSecretKey",(err,user)=>{
        err && console.log(err);
        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

        const newAccessToken = generateAccesToken(user);
        const newRefreshToken = generateRefreshAccesToken(user);
        refreshTokens.push(newRefreshToken);

        res.status(200).json({
            accesToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    });


});

const generateAccesToken = (user) =>{
    return jwt.sign({id:user.id,isAdmin:user.isAdmin},
            "mySecretKey",{expiresIn:"10m"})
}

const generateRefreshAccesToken = (user) =>{
    return jwt.sign({id:user.id,isAdmin:user.isAdmin},
            "myRefreshSecretKey")
}


app.post("/api/login",(req,res)=>{
    const {username,password} = req.body;
    const user = users.find(u=>{
        return u.username=== username && u.password===password;
    });
    if(user){
        
        //Generate an acces token
            const accesToken = generateAccesToken(user);
            const refreshToken = generateRefreshAccesToken(user);
            refreshTokens.push(refreshToken);
        res.json({
            username:user.username,
            isAdmin:user.isAdmin,
            accesToken,
            refreshToken
        });
    }else{
        res.status(400).json("Username or passwor incorrect");
    } 
});



const verify = (req,res,next) =>{
const authHeader = req.headers.authorization;
if(authHeader){
    const token = authHeader;
    jwt.verify(token,"mySecretKey",(err,user)=>{
        if(err){
            return res.status(401).json("Token is no valid");
        }

        req.user = user;
        next();
    })
}else{
    res.status(401).json("No authenticated")
}
}


app.post("/api/logout",verify,(req,res)=>{
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) =>token !== refreshToken);
    res.status(200).json("You logged out succesfully");
});

app.delete("/api/users/:userId",verify,(req,res)=>{
        if(req.user.id === req.params.userId || req.user.isAdmin){
            res.status(200).json("User has been deleted");
        }else{
            res.status(401).json("You are not authorized to delete this user")
        }
})





app.listen(3000, ()=> console.log('Server Up and running'));