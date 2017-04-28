// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
    fullname: String,
    username: { type: String, index: { unique: true }},
    password: String,
    address:{
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: Number
    },
    phone: String,
    driver_license: { type: String, index: { unique: true }},
    license_exp_month: String,
    license_exp_year: String,
    avatar: String,
    email_token : String,
    role: String,
    is_active: Boolean
});

userSchema.methods.validPassword = function(pass){
    return (this.password === pass);
};

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', userSchema);