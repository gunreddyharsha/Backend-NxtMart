let express=require("express");
let path=require("path")
let {open}=require("sqlite")
let sqlite3=require("sqlite3")
let app=express()
const jwt = require('jsonwebtoken')
app.use(express.json())
const cors = require("cors")
app.use(cors());
let dbPath=path.join(__dirname,"UserData.db") 
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS USER(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
        )`);
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.post("/register",async (req,res)=>{
    let details=req.body 
    let {password,email,username}=details
    console.log(password)
    if (password==="" || email==="" || username===""){
       res.status(200).json({
        status:"400",
        message:"All the fieldes are required"
    })
    return 0
    }
    try{ 
       console.log("harsha")
       
       const query=`SELECT * FROM USER WHERE email='${email}'`
       const logindata=await db.get(query)
       
       console.log(logindata)
        
       if (logindata===undefined){

       let insertQuery=`INSERT INTO USER (username,email,password) VALUES ('${username}','${email}','${password}')`  
       let data=await db.run(insertQuery)
       res.status(200).json({
        status:"success",
        message:"register successfull",
        })
      }
      else{
      res.status(200).json({
        status:"failure",
        message:"user already registered"
        })
    }   
    }
    catch(err){
      res.status(401).json({
        message:err.message,
        status:"failurehj"
      })
    }
   
})
app.post("/login",async (req ,res)=>{
   let {email,password}=req.body 
   if (email==="" || password===""){
     res.status(200).json({
        status:"400",
        message:"All the fieldes are required"
    })
    return 0
  }
   try{
   let loginquery=`SELECT * FROM USER WHERE email='${email}'`
   const data=await db.get(loginquery)
   //console.log(data)

   if (data===undefined){
    res.status(200).json({
        status:"200",
        message:"no user found"
    })
   }
    
   
   else{
    //console.log(data)
    console.log(data.password,password)
    
   
    if(data.password===password){
        let payload={email:email}
        let jwttoken=jwt.sign(payload,"my_security_key")
        console.log("hello",jwttoken)
      res.status(200).json({
        status:"200",
        message:"login successful",
        token:jwttoken,
        ok:true
    })
    }
    else{
         res.status(200).json({
        status:"200",
        message:"password incorrect"
    })
    }
    
   }
   }catch(err){
        console.log(err.message)
         res.status(200).json({
        status:"failure to login",
        message:err.messge
    })
    }
   
})