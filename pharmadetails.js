const mongoose = require("mongoose");


const PharmaDetailsScehma = new mongoose.Schema(
  {
    pname: { type: String, unique: true },
    paddress: String,
    phone: String,
    uname: String,
    state: String
  },
  {
    collection: "PharmaDetails",
  }
);

mongoose.model("PharmaDetails", PharmaDetailsScehma);