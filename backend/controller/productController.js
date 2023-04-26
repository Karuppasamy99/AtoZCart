const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeature = require('../utils/apiFeature')

//     -/api/v1/products
exports.getProduct = catchAsyncError(async(req,res,next) => {
    let resPerPage = 3

    let buildQuery=()=>{
        return new ApiFeature(Product.find(),req.query).search().filter()
    }
    // const filteredProducts = await buildQuery().query.countDocuments({})

    // const totalProducts = await Product.countDocuments({})
    // let productsCount = totalProducts
    // if(filteredProducts !== totalProducts){
    //     productsCount = filteredProducts
    // }
    // const products= await buildQuery().paginate(resPerPage).query
    const filteredProductsCount = await buildQuery().query.countDocuments({})
    const totalProductsCount = await Product.countDocuments({});
    let productsCount = totalProductsCount;

    if(filteredProductsCount !== totalProductsCount) {
        productsCount = filteredProductsCount;
    }
    
    const products = await buildQuery().paginate(resPerPage).query;

    res.status(200).json({
        success: true,
        count: productsCount,
        resPerPage,
        products
    })
})

//-    /api/v1/product/new'

exports.newProduct = catchAsyncError(async(req,res,next) => {
    req.body.user = req.user.id
    let images = []
    let BASE_URL = process.env.BACKEND_URL
    if(process.env.NODE_ENV === 'production'){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    
    if(req.files.length > 0){
        req.files.forEach( file => {
            let url = `${BASE_URL}/uploads/products/${file.originalname}`
            images.push({image : url})
        })
    }
    req.body.images = images
    const product = await Product.create(req.body)
    
    res.status(201).json({
        success: true,
        product
    })
})


//    Get   -api/v1/product/:id
exports.getSingleProduct = catchAsyncError(async(req,res,next)=>{
    const product= await Product.findById(req.params.id).populate('reviews.user','name email')
    if(!product){
        return next(new ErrorHandler('Product not found',404))
    }
    res.status(201).json({
        success: true,
        product
    })
})

//     Put   -api/v1/product/:id

exports.updateProduct = catchAsyncError(async(req,res,next)=>{
    let product = await Product.findById(req.params.id)
    let images = []

        //if images not cleared we keep that image also
    if(req.body.imagesCleared === 'false' ) {
        images = product.images;
    }
    let BASE_URL = process.env.BACKEND_URL
    if(process.env.NODE_ENV === 'production'){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    
    if(req.files.length > 0){
        req.files.forEach( file => {
            let url = `${BASE_URL}/uploads/products/${file.originalname}`
            images.push({image : url})
        })
    }
    req.body.images = images
    if(!product){
        return next(new ErrorHandler('Product not found',404))
    }
    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        product
    })
})

//  Delete     -api/v1/product/:id
exports.deleteProduct = catchAsyncError(async(req,res,next) => {
    const product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler('Product not found',404))
    }

    await product.remove()

    res.status(200).json({
        success : true,
        message:`Product deleted!`
    })

})

//create review -post - /api/v1/review

exports.createReview = catchAsyncError(async (req,res,next)=>{
    const {
        productId,
        rating,
        comment
    } = req.body
    const review = {
        user : req.user.id,
        rating,
        comment
    }

    const product = await Product.findById(productId)
    //finding the user is already reviewed or not
    const isReviewed = product.reviews.find( review => {
        return review.user.toString() == req.user.id.toString()
    })

    if(isReviewed){
        //updating the review
        product.reviews.forEach( review => {
            if(review.user.toString() == req.user.id.toString()){
                review.comment = comment
                review.rating = rating
            }
        })
    }
    else{
        //creating new one
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    //find the average of product reviews
    product.ratings = product.reviews.reduce((acc,review)=>{
        return review.rating + acc
    },0)/product.reviews.length
    
    product.ratings = isNaN(product.ratings)? 0 : product.ratings

    await product.save({validateBeforeSave: false})
    res.status(200).json({
        success: true
    })
})

//Get reviews for the product   - /api/v1/reviews?id={productId}

exports.getReviews = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.id).populate('reviews.user','name email')

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

//delete review - /api/v1/review

exports.deleteReview = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId)
    if(!product){
        return next(new ErrorHandler(`Product not found`))
    }
    //filter the reviews given by the user
    const reviews = product.reviews.filter( review => {
        return review._id.toString() !== req.query.id.toString()
    })
    //updating num of reviews and average
    const numOfReviews = reviews.length
    let ratings = product.reviews.reduce((acc, review)=>{
        return review.rating + acc
    })/product.reviews.length

    ratings= isNaN(ratings)? 0 : ratings
    await Product.findByIdAndUpdate(req.query.productId,{
        numOfReviews,
        ratings,
        reviews
    })
    res.status(200).json({
        success: true
    })

})

//get All products Admin- /api/v1/admin/products

exports.getAdminProducts = catchAsyncError(async(req,res,next)=>{
    const products = await Product.find()
    res.status(200).send({
        success: true,
        products
    })
})