const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
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
app.post("/api/login",(req,res)=>{
    const {username,password} = req.body;
    const user = users.find(u=>{
        return u.username== username && u.password==password;
    });
    if(user){
        //res.json(user);
        //Generate an acces token
        const accesToken = jwt.sign({id:user.id,isAdmin:user.isAdmin},"mySecretKey");
        res.json({
            username:user.username,
            isAdmin:user.isAdmin,
            accesToken,
        })
    }else{
        res.status(400).json("Username or passwor incorrect");
    }
    //res.json("It works")
});
app.listen(3000, ()=> console.log('Server Up and running'));