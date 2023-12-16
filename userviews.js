const mongoose = require("mongoose");


const UserViewsScehma = new mongoose.Schema(
  {
    username: String
  },
  {
    collection: "Userviews",
  }
);

mongoose.model("Userviews", UserViewsScehma);