const mongoose = require("mongoose");


const HistoryDetailsScehma = new mongoose.Schema(
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
    collection: "mobilehistorylist",
  }
);

mongoose.model("mobilehistorylist", HistoryDetailsScehma);