const {Schema, model} = require('mongoose');
const {isEmail} = require('validator');
let validateEmail = function (email) {
  let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};
const userSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    validate: {validator: isEmail, message: 'Please fill a valid email address'},
  },
  password: String,
  imageUrl: String,
}, {timestamps: true})

module.exports = model("User", userSchema)