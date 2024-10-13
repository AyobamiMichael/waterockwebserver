const { type } = require("express/lib/response");
const mongoose = require("mongoose");


const DrugDetailsScehma = new mongoose.Schema(
  {
    drugname: String,
    mg: { type: String, unique: false },
    uname: String,
    pricepercard: String,
    pricepercarton: String,
    priceperpack: String,
    pname: String,
    paddress: String, 
    phone: String,
    alternativedrugname: String,
    alternativedrugprice: String,
    alternativedrugmg: String,
    time: String,
    drugcategory: String,
    expdate: String,
    othersCategory: String
  },
  {
    collection: "DrugDetails",
  }
);

mongoose.model("DrugDetails", DrugDetailsScehma);


// FOR SHOPPING MALL
const shopSchema = new mongoose.Schema({
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


})

mongoose.model("ShopInfo", shopSchema);

// FOR BARS AND RESTURANTS

const barSchema = new mongoose.Schema({
  barName: {type: String, required: true},
  barAddress: {type: String, required: true},
  barState:{type: String, reguired: true},
  barPhone: {type: String, required: true},
  barImage:{type: String, required: false},
  businessType:{type: String, required: true},
  barNumberOfViews:{type: Number, required: false},
  barManagerUserName:{type: String, required: true},
  rating:{type: Array, required: false},
  customerReview:{type: Array, required: false}

  
 
})

mongoose.model("BarAndResturantsInfo", barSchema);



const barProductsSchema = new mongoose.Schema({
  catSelected: {type: String, required: true},
  barName:{type: String, required: true},
  otherProductName: {type: String, required: false},
  productPrice: {type: String, required: true},
  barManagerUserName:{type: String, required: true},

})

mongoose.model("BarProductsInfo", barProductsSchema);



const newBarProductsSchema = new mongoose.Schema({
  catSelected: {type: String, required: true},
  barName:{type: String, required: true},
  otherProductName: {type: String, required: false},
  otherProductImage:{type: String, required: false},
  productPrice: {type: String, required: true},
  barManagerUserName:{type: String, required: true},
 
})

mongoose.model("NewBarProductsInfo", newBarProductsSchema);

