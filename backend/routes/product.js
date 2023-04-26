const express = require('express')
const multer = require('multer')
const path = require('path')

const uploads = multer({storage: multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.join(__dirname,'..','uploads/products'))
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
    }
})})
const { getProduct, newProduct, getSingleProduct, updateProduct, deleteProduct, createReview, getReviews, deleteReview, getAdminProducts } = require('../controller/productController')
const {isAuthenticatedUser, isAuthorizedUser } = require('../middleware/authenticate')

const router = express.Router()

router.route('/products').get(getProduct)

router.route('/admin/product/new').post(isAuthenticatedUser,isAuthorizedUser('admin'),uploads.array('images'),newProduct)

router.route('/product/:id').get(getSingleProduct)
router.route('/review').put(isAuthenticatedUser, createReview)

router.route('/admin/review').delete(isAuthenticatedUser,deleteReview)
router.route('/admin/reviews').get(isAuthenticatedUser,isAuthorizedUser('admin'),getReviews)

router.route('/admin/products').get(isAuthenticatedUser,isAuthorizedUser('admin'),getAdminProducts)
router.route('/admin/product/:id').delete(isAuthenticatedUser,isAuthorizedUser('admin'),deleteProduct)
router.route('/admin/product/:id').put(isAuthenticatedUser,isAuthorizedUser('admin'),uploads.array('images'),updateProduct)
                                  

module.exports = router