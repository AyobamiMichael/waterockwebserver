const mongoose = require("mongoose");


const DrugDetailsScehma = new mongoose.Schema(
  {
    email: String,
    price: String,
    pharmaaddress: String,
    price: String,
    productname: String,
    productmg: String,
    distance: String
  
  },
  {
    collection: "mobilecartlist",
  }
);

mongoose.model("mobilecartlist", DrugDetailsScehma);



