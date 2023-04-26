const catchAsyncError = require('../middleware/catchAsyncError')
const User = require('../models/userModel')
const sendEmail = require('../utils/email')
const ErrorHandler = require('../utils/errorHandler')
const crypto = require('crypto')
const sendToken = require('../utils/sendToken')

//            POST -/api/v1/register

exports.registerUser = catchAsyncError(async(req,res,next) => {
    const {name,password,email} = req.body
    let BASE_URL = process.env.BACKEND_URL
    if(process.env.NODE_ENV === 'production'){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    
    let avatar;
    if(req.file){
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
    }
    const user =await User.create({
        name,
        password,
        email,
        avatar
    })
    //instead of giving seperate response we use sendToken fn
    sendToken(user,201,res)
})

//            POST  -/api/v1/login
exports.loginUser = catchAsyncError(async (req,res,next)=>{
    const {password,email} = req.body
    if(!email || !password){
        return next(new ErrorHandler('please enter email and password', 400))
    }

    //finding user in database
    const user = await User.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorHandler('Invalid email and password',401))
    }

    if(!await user.isValidPassword(password)){
        return next(new ErrorHandler('Invalid email and password',401))
    }
    sendToken(user,201,res)

})

//          GET  - /api/v1/logout

exports.logoutUser = (req,res,next) =>{
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly: true
    }).status(200)
    .json({
        success: true,
        message:`Logged out successfully`
    })
}

//            Post- /api/v1//password/forgot

exports.forgetPassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new ErrorHandler('User not found with this email'))
    }
    const resetToken = user.getResetToken()
    await user.save({validateBeforeSave: false})

    //create reset url
    let BASE_URL = process.env.FRONTEND_URL
    if(process.env.NODE_ENV === 'production'){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    
    const resetUrl = `${BASE_URL}/password/reset/${resetToken}`

    let message = `Your password reset url is as follow as \n\n
    ${resetUrl}\n\n if you have not requested please ignore it`

    try{
        sendEmail({
            email: user.email,
            subject: 'AtoZcart Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message:`Email sent to ${user.email}`
        })

    }catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordTokenExpire= undefined
        await user.save({validateBeforeSave: false})
        return next(new ErrorHandler(error.message,500))
    }

})

//              POST - /api/v1//password/reset/:token

exports.resetPassword = catchAsyncError(async(req,res,next)=>{
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: {
            $gt : Date.now()
        }
    })
    if(!user){
        return next( new ErrorHandler(`Password reset token is invalid or expired`))
    }
    if(req.body.password!== req.body.confirmPassword){
        return next( new ErrorHandler(`Password doesn't match`))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordTokenExpire =undefined

    await user.save({
        validateBeforeSave: false
    })

    sendToken(user, 201, res)
})

//                   GET - /api/v1/myprofile

exports.getUserProfile = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})

//                 PUT - /api/v1/password/change
exports.changePassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password')

    if(! user.isValidPassword(req.body.oldpassword)){
        return next(new ErrorHandler('old password is incorrect',401))
    }

    user.password = req.body.password
    await user.save()
    res.status(200).json({
        success: true
    })
})

 //       PUT- /api/v1/update
exports.updateProfile = catchAsyncError(async(req,res,next)=>{
    let changeFields = {
        name : req.body.name,
        email: req.body.email
    }
    let avatar;
    let BASE_URL = process.env.BACKEND_URL
    if(process.env.NODE_ENV === 'production'){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    
    if(req.file){
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
        changeFields = {...changeFields,avatar}
    }
    const user = await User.findByIdAndUpdate(req.user.id,changeFields,{
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        user
    })
})

//Admin - get all user /api/v1/admin/users
exports.getAllUser = catchAsyncError(async(req,res,next)=>{
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})

//Admin specific user /api/v1/admin/user/:id
exports.getSpecificUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler(`Id not found ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        user
    })
})

//Admin - Update User  /api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async(req,res,next)=>{
    const changeFields = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id,changeFields,{
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        user
    })
})

//Admin - Delete User /api/v1/admin/user/:id

exports.deleteUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id)
    if(!user){
        return next(new ErrorHandler(`Id not found ${req.params.id}`))
    }
    await user.remove()
    res.status(200).json({
        success: true
    })

})

