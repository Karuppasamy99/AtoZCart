const catchAsyncError = require('../middleware/catchAsyncError')

const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')

// POST - api/v1/order/new

exports.newOrder = catchAsyncError(async(req,res,next)=>{
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user.id
    })

    res.status(200).json({
        success : true,
        order
    })
})

//        get - /api/v1/order/:id
exports.getSingleOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate('user','name email')
    if(!order){
        return next(new ErrorHandler(`Order not found with this id : ${req.params.id}`,404))
    }
    res.status(200).json({
        success: true,
        order
    })
})

// get logged in user order - api/v1/myorders

exports.loggedInUserOrders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find({user : req.user.id})
   
    res.status(200).json({
        success: true,
        orders
    })

})

// Admin       - get all orders - api/v1/orders
exports.orders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find()
    let totalAmount = 0
    orders.forEach( order => totalAmount += order.totalPrice)
   
    res.status(200).json({
        success: true,
        orders,
        totalAmount
    })

})

//Admin  - Update order    put - /api/v1/order/:id

exports.updateOrder = catchAsyncError(async (req,res,next)=>{
    const order = await Order.findById(req.params.id)
    if(order.orderStatus === 'Delivered'){
        return next(new ErrorHandler(`Order has been already delivered`,401))
    }
      console.log(order.orderStatus)
    //update the product stock for each product item
    order.orderItems.forEach(async orderItem => {
        await updateStock(orderItem.product,orderItem.quantity)
    })
    order.orderStatus = req.body.orderStatus
    order.deliveredAt = Date.now()
    await order.save()

    res.status(201).json({
        success: true
    })
})
async function updateStock(productId,quantity){
   const product = await Product.findById(productId)
   product.stock -= quantity
   await product.save({validateBeforeSave: false})
}

//Admin   - /api/v1/order/:id

exports.deleteOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id)

 
    if(!order){
        return next(new ErrorHandler(`Order not found with this id : ${req.params.id}`,404))
    }
    await order.remove()

    res.status(200).json({
        success: true
    })
    
})

