const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please enter your name']
    },
    email: {
        type: String,
        required: [true,'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address'],
    },
    password: {
        type: String,
        required: [true,'Please enter the password'],
        minlength: [8,'Please enter the password with minimum 8 characters'],
        select: false
    },
    avatar:{
        type: String,
        
    },
    role: {
        type: String,
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: String,
    createdAt: {
        type: Date,
        default: Date.now()
    }

})

userSchema.pre('save', async function(next){
    if(! this.isModified('password')){
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this.id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_SECRET_EXPIRE
    })
}

userSchema.methods.isValidPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.getResetToken = function(){
    const token = crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    this.resetPasswordTokenExpire = Date.now() + 30*60*1000
    return token
}

const userModel = mongoose.model('User',userSchema)

module.exports = userModel