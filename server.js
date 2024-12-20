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

   app.post("/updatepassword", async (req, res) => {
    const { uname, newPassword } = req.body;

    // Hash the new password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    try {
        // Find the user by their username (uname)
        const user = await BarManager.findOne({ uname });

        if (!user) {
            return res.json({ error: "User not found" });
        }

        // Update the password
        await BarManager.updateOne(
            { uname },
            { $set: { password: encryptedPassword } }
        );

        res.send({ status: "Password updated successfully" });
    } catch (error) {
        res.send({ status: "error", message: error.message });
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
  //app.use('/barsuploads', express.static('barsuploads'));  
  const registerBarsAndResturants = mongoose.model("BarAndResturantsInfo");
  //const storage = multer.memoryStorage();
   
  
// FILE UPLOAD FOR BARS AND RESTURANT

const storageOfBarsResturantsImage = multer.diskStorage({
  destination: function(req, file, callback){
   callback(null, './uploads/');

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
  //files: 2
  
},
 fileFilter: barsfileFilter
});




//const barsUpload = multer({storage: storageOfBarsResturantsImage,  limits: { files: 2 } });


  app.post("/registerbars", barsUpload.single('barImage'), async(req, res)=>{
   const {barName, barAddress, barState, barPhone, businessType, barManagerUserName, barNumberOfViews, rating, customerReview} = req.body;
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
       // return res.status(400).json({ status: "error", error: "Maximum number of files exceeded (limit: 2)" });
      // }
  
  //const barImages = req.files.map(file => file.path);
   //console.log(barImages);

      await registerBarsAndResturants.create({
        barName,
        barAddress,
        barState,
        barPhone,
        businessType,
        barImage: req.file.path,   
        barManagerUserName,
        barNumberOfViews,
        rating,
        customerReview
         
      });
      res.send({ status: "ok" });


     }catch(error){
       res.send({ status: "error" });
       //console.log(res);
    }
  });

 // UPDATE BAR IMAGE 

 // Route to update bar image using barName
app.post("/updatebarimage/:barName", barsUpload.single('barImage'), async (req, res) => {
  const { barName } = req.params; // Extract barName from the URL params

  try {
    // Check if a bar with the provided barName exists
    const bar = await registerBarsAndResturants.findOne({ barName });

    if (!bar) {
      return res.status(404).json({ status: "error", error: "Bar not found" });
    }

    // Update the bar's image
    bar.barImage = req.file.path; // Save the new image path to the database

    // Save the updated bar document
    await bar.save();

    // Send a success response
    res.json({ status: "ok", message: "Bar image updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "An error occurred while updating the bar image" });
  }
});


  app.post('/incrementViews', async (req, res) => {
    try {
      const { barName } = req.body;
      const bar = await registerBarsAndResturants.findOne({ barName });
  
      if (bar) {
        bar.barNumberOfViews += 1;
        await bar.save();
        res.status(200).send({ status: 'ok' });
      } else {
        res.status(404).send({ status: 'bar not found' });
      }
    } catch (error) {
      res.status(500).send({ status: 'error', error: error.message });
    }
  }); 

  app.post('/customerreview', async (req, res) => {
    try {
      const { barName, customerReview, rating } = req.body;
      const bar = await registerBarsAndResturants.findOne({ barName });
  
      if (bar) {
        // Add the customer review to the bar's customer reviews (assuming it's an array)
        bar.customerReview = bar.customerReview || []; // Initialize if not exists
        bar.customerReview.push(customerReview);
        bar.rating = bar.rating || [];
        bar.rating.push(rating);
  
        await bar.save();
        res.status(200).send({ status: 'ok', message: 'Review added successfully' });
      } else {
        res.status(404).send({ status: 'bar not found' });
      }
    } catch (error) {
      res.status(500).send({ status: 'error', error: error.message });
    }
  });
  
 // RETREIVE ALL THE BARS

 app.get('/allbars', (req, res) =>{
  // const { barManagerUserName } = req.params;
  registerBarsAndResturants.find()
           .select('_id barName barAddress barState barPhone barImage businessType barNumberOfViews barManagerUserName rating customerReview')
           .exec((err, data) =>{
             if (!err) {
               res.json(data);
              // console.log(data);
           } else {
               res.status(500).json({ error: 'Internal Server Error' });
           }
           })
     //   console.log(res);
 });


// UPDATE BAR NAME
 app.post("/updateandsavebarname", async (req, res) => {
  // const productId = req.body._id; 
   const { id, updatedBarName } = req.body;
   console.log(req.body);
   try {
    registerBarsAndResturants.findByIdAndUpdate(
           id,
           { barName: updatedBarName },
           { new: true },
           (error, data) => {
               if (error) {
                   console.log(error);
                   res.status(500).send({ status: "error" });
               } else {
                   console.log('Updated');
                   res.send({ status: "ok", data: 'Updated Successfuly' });
               }
           }
       );
   } catch (error) {
       console.error(error);
       res.status(500).send({ status: "error" });
   }
});


// UPDATE BAR ADDRESS

app.post("/updateandsavebaraddress", async (req, res) => {
  // const productId = req.body._id; 
   const { id, updatedBarAddress } = req.body;
   console.log(req.body);
   try {
    registerBarsAndResturants.findByIdAndUpdate(
           id,
           { barAddress: updatedBarAddress },
           { new: true },
           (error, data) => {
               if (error) {
                   console.log(error);
                   res.status(500).send({ status: "error" });
               } else {
                   console.log('Updated');
                   res.send({ status: "ok", data: 'Updated Successfuly' });
               }
           }
       );
   } catch (error) {
       console.error(error);
       res.status(500).send({ status: "error" });
   }
});

// UPDATE BAR PHONE NUMBER


app.post("/updateandsavebarphone", async (req, res) => {
  // const productId = req.body._id; 
   const { id, updatedBarPhone } = req.body;
   console.log(req.body);
   try {
    registerBarsAndResturants.findByIdAndUpdate(
           id,
           { barPhone: updatedBarPhone },
           { new: true },
           (error, data) => {
               if (error) {
                   console.log(error);
                   res.status(500).send({ status: "error" });
               } else {
                   console.log('Updated');
                   res.send({ status: "ok", data: 'Updated Successfuly' });
               }
           }
       );
   } catch (error) {
       console.error(error);
       res.status(500).send({ status: "error" });
   }
});


  // DELETE BAR

  app.delete("/deletebar/:id", async (req, res) => {
    const { id } = req.params; // Get the product ID from the request parameters
  
    try {
      // Find the product by ID and delete it
      const deletedBar = await  registerBarsAndResturants.findByIdAndDelete(id);
  
      if (!deletedBar) {
        // If no product is found with the given ID
        return res.status(404).json({ error: "Bar not found" });
      }
  
      // If product is successfully deleted
      res.json({ status: "ok", message: "Bar deleted successfully" });
    } catch (error) {
      // Handle any errors
      console.error(error);
      res.status(500).json({ status: "error", message: "An error occurred while deleting the bar" });
    }
  });

 // BAR NUMBER OF VIEWS

 app.post('/incrementViews', async (req, res) => {
  try {
    const { barName } = req.body;
    const bar = await registerBarsAndResturants.findOne({ barName });

    if (bar) {
      bar.barNumberOfViews += 1;
      await bar.save();
      res.status(200).send({ status: 'ok' });
    } else {
      res.status(404).send({ status: 'bar not found' });
    }
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});


  // ADD BAR PRODUCTS


  const BarProduct = mongoose.model("BarProductsInfo");
  app.post("/registerbarproductinfo", async(req, res)=>{
    const { catSelected, barName, otherProductName, productPrice, barManagerUserName} = req.body;

    
    try{
        const oldProduct = await BarProduct.findOne({ catSelected, productPrice, barManagerUserName });
        if (oldProduct) {
            return res.json({ error: "Product Exists" });
          }
        //console.log(req.file);
        console.log(req.body);
       await BarProduct.create({
        catSelected,
         barName,
         otherProductName,
         productPrice,
         barManagerUserName
        

       });
       res.send({ status: "ok" });

      }catch(error){
        res.send({ status: "error" });
     }
 
   });

//  DELETE BAR PRODUCTS


// Route to delete a product using product ID
app.delete("/deletebarproduct/:id", async (req, res) => {
  const { id } = req.params; // Get the product ID from the request parameters

  try {
    // Find the product by ID and delete it
    const deletedProduct = await BarProduct.findByIdAndDelete(id);

    if (!deletedProduct) {
      // If no product is found with the given ID
      return res.status(404).json({ error: "Product not found" });
    }

    // If product is successfully deleted
    res.json({ status: "ok", message: "Product deleted successfully" });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ status: "error", message: "An error occurred while deleting the product" });
  }
});

   // RETRIEVE ALL BAR PRODUCTS

  
   /*app.get('/barproducts/:barManagerUserName', (req, res) =>{
    const { barManagerUserName } = req.params;
    BarProduct.find({barManagerUserName: barManagerUserName })
            .select('_id catSelected otherProductName productPrice barManagerUserName')
            .exec((err, data) =>{
              if (!err) {
                res.json(data);
               // console.log(data);
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
            })
      //   console.log(res);
  });
  */

 
   
  app.get('/barproducts', (req, res) =>{
   // const { barManagerUserName } = req.params;
    BarProduct.find()
            .select('_id catSelected barName otherProductName productPrice barManagerUserName')
            .exec((err, data) =>{
              if (!err) {
                res.json(data);
               // console.log(data);
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
            })
      //   console.log(res);
  });


  app.post("/updateandsavebarproduct", async (req, res) => {
   // const productId = req.body._id; 
    const { id, updatedPrice } = req.body;
    console.log(req.body);
    try {
        BarProduct.findByIdAndUpdate(
            id,
            { productPrice: updatedPrice },
            { new: true },
            (error, data) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ status: "error" });
                } else {
                    console.log('Updated');
                    res.send({ status: "ok", data: 'Updated Successfuly' });
                }
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "error" });
    }
});



const customerCareInfo = mongoose.model('customerCareInfo')
app.post("/createcustomercaredetails", async(req, res)=>{
  const {customerCareNumber1,customerCareNumber2, customerCareEmail} = req.body;
  console.log(req.body);
  
  try{
     
   
     await customerCareInfo.create({
      customerCareNumber1,
      customerCareNumber2,
      customerCareEmail
    
     });
     res.send({ status: "ok" });


    }catch(error){
      res.send({ status: "error" });
      //console.log(res);
   }
 });


 app.get("/getcustomercaredetails", async (req, res) => {
  try {
    // Sort by `_id` in descending order and retrieve the first document
    const details = await customerCareInfo.findOne().sort({ _id: -1 });

    if (!details) {
      return res.status(404).send({ message: "No customer care details found" });
    }

    res.status(200).send(details);
  } catch (error) {
    res.status(500).send({ message: "Error fetching customer care details" });
  }
});
