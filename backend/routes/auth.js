const express = require('express')
const multer = require('multer')
const path = require('path')

const upload =multer({storage: multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.join(__dirname,'..','/uploads/user'))
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
    }
    
})})


const { registerUser, 
    loginUser, 
    logoutUser, 
    forgetPassword, 
    resetPassword, 
    getUserProfile, 
    changePassword, 
    updateProfile, 
    getAllUser, 
    getSpecificUser,
    updateUser,
    deleteUser
} = require('../controller/authController')
const router = express.Router()
const {isAuthenticatedUser, isAuthorizedUser} = require('../middleware/authenticate')

router.route('/register').post(upload.single('avatar'),registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)
router.route('/password/forgot').post(forgetPassword)
router.route('/password/reset/:token').post(resetPassword)
router.route('/myprofile').get(isAuthenticatedUser,getUserProfile)
router.route('/password/change').put(isAuthenticatedUser,changePassword)
router.route('/update').put(isAuthenticatedUser,upload.single('avatar'),updateProfile)

//Admin routes
router.route('/admin/users').get(isAuthenticatedUser,isAuthorizedUser('admin'),getAllUser)
router.route('/admin/user/:id').get(isAuthenticatedUser,isAuthorizedUser('admin'),getSpecificUser)
router.route('/admin/user/:id').put(isAuthenticatedUser,isAuthorizedUser('admin'),updateUser)
router.route('/admin/user/:id').delete(isAuthenticatedUser,isAuthorizedUser('admin'),deleteUser)

module.exports = router