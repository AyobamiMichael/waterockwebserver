const express = require('express')
const app = express();
const cors = require('cors');
app.use(cors());
const bcrypt = require("bcryptjs");
require('dotenv').config()
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");


// TO be copied to AWS
const multer = require('multer');
const storage = multer.diskStorage({
   destination: function(req, file, callback){
    callback(null, './uploads/');

   },
   filename: function(req, file, callback){
        callback(null, file.originalname)
        
   }
});

const fileFilter = (req, file, callback) =>{
   if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    callback(null, true);
   }else{
    callback(null, false);
  
   }
  
};
const upload = multer({storage: storage, 
  limits: {
   fileSize: 1024 * 1024 * 5
},
  fileFilter: fileFilter
});


const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

const port = 4000;

app.listen(port, ()=>{
    console.log(`Example app listening on port ${port}!`)
});


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(()=>console.log('MongoDB connected...'))
        .catch(err => console.log(err));

  
// For Mobile users signup and signin
app.use(bodyParser.urlencoded({extended:true}))
app.use('/', require('./mobileusersrouter'))        
    
 const Schema = mongoose.Schema;

 const pharmaSchema = new Schema({
    pharmacy: {type: String, required: true},
    drugName: {type: String, required: true},
    price: {type: String, required: true},
    address: {type: String, required: true},
    phone: {type: String, required: true}
 })

 const Pharmacy = mongoose.model('Pharmacy', pharmaSchema);

 app.use(express.json());
 app.use(bodyParser.json());
 
 app.use(express.urlencoded({ extended: true }));


  let resObj = {};


app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/views/index.html')
});


  const createAndSavePharmacy = (req, res) => {
     const pharmacy = new Pharmacy({
     pharmacy: req.body.pharmaname,
     drugName: req.body.drugname,
     address:  req.body.address, 
     phone: req.body.phone,
     price: req.body.price
     })

     pharmacy.save((err, data) =>{
        if(err){
            console.log(err);
        }else{
            resObj['pharmacyName'] = data.pharmacy
            resObj['drugName'] = data.drugName;
            resObj['address'] = data.address;
            resObj['phone'] =  data.phone;
            resObj['price'] = data.price;
            res.json(resObj);
        }
     })
  }
  

  app.get('/api/pharmacy', (req, res) =>{
    Pharmacy.find()
            .select('pharmacy drugName price address phone')
            .exec((err, data) =>{
                if(!err){
                    res.json(data)
                }
            })
  });


 


  app.post('/api/users', (req, res) =>{
      createAndSavePharmacy(req, res);
  });
  
  // User registration
  require("./userdetails")


  const User = mongoose.model("UserInfo");
  app.post("/register", async(req, res)=>{
    const { fname, lname,  uname, password} = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);
    try{
        const oldUser = await User.findOne({ uname });
        if (oldUser) {
            return res.json({ error: "User Exists" });
          }

       await User.create({
         fname,
         lname,
         uname,
         password:encryptedPassword,
         
       });
       res.send({ status: "ok" });
    }catch(error){
       res.send({ status: "error" });
    }

  });

  // Login Users
  app.post("/login-user", async(req, res)=>{
    const {uname, password } = req.body;
    const user = await User.findOne({uname});

    if (!user) {
        return res.json({ error: "User Not found" });
      }
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({uname: user.uname}, JWT_SECRET);
        if (res.status(201)) {
            return res.json({ status: "ok", data: token });
          } else {
            return res.json({ error: "error" });
          }
          
      }
      res.json({ status: "error", error: "InvAlid Password" });
  });

  app.post("/userData", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(user);
  
      const username = user.uname;
      User.findOne({uname: username })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });



  // Register pharmacy
   require("./pharmadetails")
  const Pharma = mongoose.model("PharmaDetails");

  const addPharma = (req, res) =>{
      const pharmacy = new Pharma({})
  } 
  app.post("/registerpharmacy",async (req, res) =>{
    const { pname, paddress, phone, uname, state} = req.body;
    try{
    //  const oldPharma = await User.findOne({ pname });
     // if (oldPharma) {
       //   return res.json({ error: "Pharma Exists" });
       // }
      // const pharmacy = new Pharma({})
     await Pharma.create({
       pname,
       paddress,
       phone,
       uname,
       state
      
     });
    
     res.send({ status: "ok" });
  }catch(error){
     res.send({ status: "error" });
  }
  })
  


// Get the list of pharmacies
  
  app.get('/api/listpharmacies', (req, res) =>{
    Pharma.find()
            .select('pname paddress phone uname state')
            .exec((err, data) =>{
                if(!err){
                    res.json(data)
                }
            })
  });







  
  app.post("/pharmaData", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(user);
  
      const username = user.uname;
      Pharma.findOne({uname: username })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });


  app.post("/multipharmaData", async (req, res) => {
    const { token, pname } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(user);
  
       const username = user.uname;
      Pharma.find({ uname: username })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });

  
/*
  app.post("/singlepharmaData", async (req, res) => {
    const { token, pname } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(user);
  
       const username = user.uname;
      Pharma.findOne({ pname })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });


*/

  app.get("/pharmalistuname", async (req, res)=>{
        try{
             Pharma.find()
             .select('uname')
             .exec((err, data) =>{
                 if(!err){
                    // res.json(data)
                    res.send({ status: "ok", data: data});
                 }
             })
         
         }catch(error){
          res.send({ status: "error" });
         }   

  })
  

  require("./userviews")
  const UserV = mongoose.model("Userviews");

  app.get("/userviews", async (req, res)=>{

    try{
      UserV.find()
      .select('username')
      .exec((err, data) =>{
          if(!err){
             // res.json(data)
             res.send({ status: "ok", data: data});
          }
      })
  
  }catch(error){
   res.send({ status: "error" });
  }
})

// Register drugs

  require("./drugdetails")
  const Drug = mongoose.model("DrugDetails");
  app.post("/registerdrug",async (req, res) =>{
    const {drugname, mg, uname, pricepercard, pricepercarton,
      priceperpack, pname, paddress, phone, alternativedrugname,
      alternativedrugprice, alternativedrugmg, time, drugcategory, expdate, othersCategory} = req.body;
    try{
      const userName = await Drug.findOne({ uname });
        const oldDrug = await Drug.findOne({ drugname });
       // if (oldDrug && userName) {
         //  return res.json({ error: "Product Exists" });
        // }
        const product = await Pharma.findOne({uname});
        if (!product) {
          return res.json({ error: "Pls Register Pharmacy" });
        }


       
     await Drug.create({
       drugname,
       mg,
       uname,
       pricepercard,
       pricepercarton,
       priceperpack,
       pname, 
       paddress, 
       phone,
       alternativedrugname,
       alternativedrugprice,
       alternativedrugmg,
       time,
       drugcategory,
       expdate,
       othersCategory
      
     });

     res.send({ status: "ok" });
  }catch(error){
     res.send({ status: "error" });
  }
  })
  
  // Editing drugs

  app.post("/editdrug", async (req, res)=>{
   
    const {id, drugname, mg, price, time} = req.body;

         try{
            Drug.findByIdAndUpdate(id, {drugname: drugname, mg:mg, price:price, time:time}, {new: true}, (error, data)=>{
            // if(error){
             //   console.log(error);
            // }else{
             // console.log('Updated');
            // } 
          })
          res.send({ status: "ok" });
         }catch(error){
          res.send({ status: "error" });
         }
       

  })
  

// Deleting drugs
app.post("/deletedrug", async (req, res)=>{
   
  const {id} = req.body;

       try{
          Drug.findByIdAndDelete(id, (error, data)=>{
          // if(error){
           //   console.log(error);
          // }else{
           // console.log('Updated');
          // } 
        })
        res.send({ status: "ok" });
       }catch(error){
        res.send({ status: "error" });
       }
     

})


// res.json({ status: "ok", data: token });

  app.post("/viewdrugs", async(req, res) =>{
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(user);
  
      const username = user.uname;
     await Drug.find({uname: username })
        .then((data) => {

          res.send({ status: "ok", data: data });

        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });

  app.post("/viewalldrugs", (req, res) =>{
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(user);
  
      const username = user.uname;
      Drug.find({uname: username })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });



   app.get('/viewalldrugs', (req, res) =>{
    Drug.find()
            .select('drugname mg pricepercard pricepercarton priceperpack pname paddress phone drugcategory alternativedrugname alternativedrugprice alternativedrugmg time expdate')
            .exec((err, data) =>{
                if(!err){
                    res.json(data)
                }
            })
  });


  app.get('/mobiledruglist', (req, res) =>{
    Drug.find()
            .select('drugname mg uname pricepercard pname paddress phone alternativedrugname alternativedrugprice alternativedrugmg time expdate')
            .exec((err, data) =>{
                if(!err){
                    res.json(data)
                }
            })
  });




require("./mobilecartdetails")
  const Product = mongoose.model("mobilecartlist");
app.get('/mobiledrugcartlist', (req, res) =>{
    Product.find()
            .select('email price pharmaaddress price productname productmg distance')
            .exec((err, data) =>{
                if(!err){
                    res.json(data)
                }
            })
  });



  require("./mobilehistorydetails")
  const HistoryProducts = mongoose.model("mobilehistorylist");
app.get('/mobiledrughistorylist', (req, res) =>{
     HistoryProducts.find()
            .select('email price pharmaaddress price productname productmg distance')
            .exec((err, data) =>{
                if(!err){
                    res.json(data)
                }
            })
  });


  /*
    app.get('/api/pharmacy', (req, res) =>{
    Pharmacy.find()
            .select('pharmacy drugName price address phone')
            .exec((err, data) =>{
                if(!err){
                    res.json(data)
                }
            })
  });
  */

  // SIGNUP SHOPPING MALL DATAMANAGER AND SIGN IN
  const ShoppingMallDataManager = mongoose.model("ShoppingMallDataManagerInfo");
  app.post("/registershoppingmalldatamanager", async(req, res)=>{
    const { fname, lname,  uname, password} = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);
    try{
        const oldUser = await ShoppingMallDataManager.findOne({ uname });
        if (oldUser) {
            return res.json({ error: "User Exists" });
          }

       await ShoppingMallDataManager.create({
         fname,
         lname,
         uname,
         password:encryptedPassword,

       });
       res.send({ status: "ok" });

      }catch(error){
        res.send({ status: "error" });
     }
 
   });

  app.post("/loginshoppingmalldatamanager", async(req, res)=>{
    const {uname, password } = req.body;
    const user = await ShoppingMallDataManager.findOne({uname});

    if (!user) {
        return res.json({ error: "User Not found" });
      }
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({uname: user.uname}, JWT_SECRET);
        if (res.status(201)) {
            return res.json({ status: "ok", data: token });
          } else {
            return res.json({ error: "error" });
          }
          
      }
      res.json({ status: "error", error: "InvAlid Password" });
  });

  app.post("/shoppingmalldatamanagerdata", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(user);
  
      const username = user.uname;
      ShoppingMallDataManager.findOne({uname: username })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });
 

 // Shop Registration
 // TO be copied to AWS
  /* const shopSchema = new Schema({
    shopName: {type: String, required: true},
    shopAddress: {type: String, required: true},
    shopPhone: {type: String, required: true},
    productPrice: {type: String, required: true},
    catSelected: {type: String, required: true},
    subCatItemSelected:{type: String, required: true},
    productImage: {type: String, required: true},
    productName:{type: String, required: true},
    shoppingMallManagerUserName:{type: String, required: true},
    productDescription:{type: String, required: true}


 })*/
 const registerShop = mongoose.model("ShopInfo");
   //const storage = multer.memoryStorage();

   app.post("/registershop", upload.single('productImage'), async(req, res)=>{
    const {shopName, shopAddress, shopPhone, productPrice, catSelected, subCatItemSelected, productName, productDescription, shoppingMallManagerUserName} = req.body;
    console.log(req.file);
    console.log(req.body);
    
    try{
      
      const existingShop = await registerShop.findOne({
        productPrice,
        catSelected,
        subCatItemSelected,
        productName,
        productDescription   
    });

    if (existingShop) {
        return res.json({ status: "error", error: "Data already exists" });
    }


       await registerShop.create({
         shopName,
         shopAddress,
         shopPhone,
         productPrice,
         catSelected,
         subCatItemSelected,
         productImage: req.file.path,
         productName,
         productDescription,
         shoppingMallManagerUserName

       });
       res.send({ status: "ok" });

      }catch(error){
        res.send({ status: "error" });
     }
 
   });
   // POST METHOD
   app.post('/viewallshoppingproducts', (req, res) =>{
    registerShop.find()
            .select('_id productName productPrice productDescription shopName catSelected subCatItemSelected shopPhone shopAddress productImage shoppingMallManagerUserName')
            .exec((err, data) =>{
                if(!err){
                    res.json(data)
                }
            })
         // console.log(res);
  });

 // GET METHOD
  app.get('/viewallshoppingproducts', (req, res) =>{
    registerShop.find()
            .select('_id productName productPrice productDescription shopName catSelected subCatItemSelected shopPhone shopAddress productImage shoppingMallManagerUserName')
            .exec((err, data) =>{
                if(!err){
                    res.json(data)
                }
            })
         // console.log(res);
  });

   app.use('/uploads', express.static('uploads'));  

  
   app.get("/getproductforediting/:_id", (req, res) => {
    const productId = req.params._id;
   // console.log(productId);
   // const product = registerShop.findById(productId);
   
   // console.log(product);

   registerShop.findOne({_id: productId})
   .then((data) => {
     res.send({ status: "ok", data: data });
    // console.log(data);
   })
   .catch((error) => {
     res.send({ status: "error", data: error });
   });
  
   // if (!product) {
     // return res.status(404).json({ error: "Product not found" });
   // }
  
   // res.json(product);
  });
  

  app.post("/updateandsaveproduct/:_id", async (req, res)=>{
    const productId = req.params._id;
  //  const {id,  catSelected,  productName,  productPrice, shopAddress, shopName, shopPhone} = req.body;
    const { token, editedProduct } = req.body;
      //console.log(productId);
      //console.log(editedProduct.productName);
         try{
            registerShop.findByIdAndUpdate(productId, {productName: editedProduct.productName, productPrice:editedProduct.productPrice}, {new: true}, (error, data)=>{
            // if(error){
             //   console.log(error);
            // }else{
             // console.log('Updated');
            // } 
          })
          res.send({ status: "ok" });
         }catch(error){
          res.send({ status: "error" });
         }
       

  })

  // Deleting products
  app.delete("/deleteproduct/:id", async (req, res) => {
    const productId = req.params.id;
    console.log(productId);
    try {
      registerShop.findByIdAndDelete(productId, (error, data) => {
        if (error) {
          console.log(error);
          res.status(500).send({ status: "error", message: "Internal Server Error" });
        } else {
          console.log('Deleted');
          res.status(200).send({ status: "ok", message: "Product deleted successfully" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "error", message: "Internal Server Error" });
    }
  });
  
  // RESTURANTS AND BARS

  // SIGNUP AND SIGNIN BARMANAGER
  const BarManager = mongoose.model("BarManagerInfo");
  app.post("/registerbarmanager", async(req, res)=>{
    const { fname, lname,  uname, password} = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);
    try{
        const oldUser = await BarManager.findOne({ uname });
        if (oldUser) {
            return res.json({ error: "User Exists" });
          }

       await BarManager.create({
         fname,
         lname,
         uname,
         password:encryptedPassword,

       });
       res.send({ status: "ok" });

      }catch(error){
        res.send({ status: "error" });
     }
 
   });

  app.post("/loginbarmanager", async(req, res)=>{
    const {uname, password } = req.body;
    const user = await BarManager.findOne({uname});

    if (!user) {
        return res.json({ error: "User Not found" });
      }
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({uname: user.uname}, JWT_SECRET);
        if (res.status(201)) {
            return res.json({ status: "ok", data: token });
          } else {
            return res.json({ error: "error" });
          }
          
      }
      res.json({ status: "error", error: "InvAlid Password" });
  });

  app.post("/baramanagerdata", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      console.log(user);
  
      const username = user.uname;
      BarManager.findOne({uname: username })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });
    

  // REGISTER BAR
  app.use('/barsuploads', express.static('barsuploads'));  
  const registerBarsAndResturants = mongoose.model("BarAndResturantsInfo");
  //const storage = multer.memoryStorage();
   
  
// FILE UPLOAD FOR BARS AND RESTURANT

const storageOfBarsResturantsImage = multer.diskStorage({
  destination: function(req, file, callback){
   callback(null, './baruploads/');

  },
  filename: function(req, file, callback){
       callback(null, file.originalname)
       
  }
});

const barsfileFilter = (req, file, callback) =>{
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
   callback(null, true);
  }else{
   callback(null, false);
 
  }
 
};
const barsUpload = multer({storage: storageOfBarsResturantsImage, 
 limits: {
  fileSize: 1024 * 1024 * 5,
  
},
 fileFilter: barsfileFilter
});




//const barsUpload = multer({storage: storageOfBarsResturantsImage,  limits: { files: 2 } });


  app.post("/registerbars", barsUpload.single('barImage'), async(req, res)=>{
   const {barName, barAddress, barPhone, barState, barManagerUserName} = req.body;
   console.log(req.file);
   console.log(req.body);
   
   try{
     
     const existingBar = await registerBarsAndResturants.findOne({
       barName,
       barAddress

   });

   if (existingBar) {
       return res.json({ status: "error", error: "Data already exists" });
      }

     // if (req.files.length > 2) {
      //  return res.status(400).json({ status: "error", error: "Maximum number of files exceeded (limit: 2)" });
     // }
  
  //const barImages = req.files.map(file => file.path);
   //console.log(barImages);

      await registerBarsAndResturants.create({
        barName,
        barAddress,
        barPhone,
        barState,
        barManagerUserName,
        barImage: req.file.path

      
      });
      res.send({ status: "ok" });

     }catch(error){
       res.send({ status: "error" });
       //console.log(res);
    }
  });
  // ADD BAR PRODUCTS

  const addBarsProducts = mongoose.model("BarProductsInfo");
  //const storage = multer.memoryStorage();

  app.post("/registerbarsproducts", async(req, res)=>{
   const {barName, barAddress, barPhone, productPrice,productName,barManagerUserName,productDescription} = req.body;
   console.log(req.file);
   console.log(req.body);
   
   try{
     
     const existingBarProducts = await addBarsProducts.findOne({
       productPrice,
       productName,
       barManagerUserName

   });

   if (existingBarProducts) {
       return res.json({ status: "error", error: "Data already exists" });
   }


      await addBarsProducts.create({
        barName,
        barAddress,
        barPhone,
        productPrice,
        productName,
        productDescription,
        barManagerUserName

      });
      res.send({ status: "ok" });

     }catch(error){
       res.send({ status: "error" });
    }

  });



    //productImage: req.file.path,
       // barManagerUserName