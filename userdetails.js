const mongoose = require("mongoose");

/*
const PharmaDetailsScehma = new mongoose.Schema(
  {
    pname: { type: String, unique: true },
    paddress: String,
    phone: String,
   
  },
  {
    collection: "PharmaDetails",
  }
);

mongoose.model("PharmaDetails", PharmaDetailsScehma);


const DrugDetailsScehma = new mongoose.Schema(
  {
    drugname: String,
    mg: { type: String, unique: true },
    pharmacyname: String,
   
  },
  {
    collection: "DrugDetails",
  }
);

mongoose.model("DrugDetails", DrugDetailsScehma);

*/

const UserDetailsScehma = new mongoose.Schema(
  {
    fname: String,
    lname: String,
    uname: { type: String, unique: true },
    password: String,
   // listofdrugs: [DrugDetailsScehma],
   // pharmadetails: [PharmaDetailsScehma],
    
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", UserDetailsScehma);


const ShoppingMallDataManagerSchema = new mongoose.Schema(
  {
     fname: String,
     lname: String,
    uname: {type: String, unique: true},
    password: String,
  
  },
   {
    collection: "ShoppingMallDataManagerInfo",
  }
  );
  
  mongoose.model("ShoppingMallDataManagerInfo", ShoppingMallDataManagerSchema );
  