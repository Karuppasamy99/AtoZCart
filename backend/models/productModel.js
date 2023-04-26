const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Please provide the product name"],
        trim: true,
        maxLength: [100,"product name doesn't exceed 100 characters"]
    },
    price: {
        type: Number,
        default: 0.0
    },
    description: {
        type: String,
        required: [true,"please provide the product description"]
    },
    ratings:{
        type: Number,
        default: 0
    },
    images: [
        {
            image:{
                type: String,
                required: true
            }
        }
    ],
    category:{
        type: String,
        required: [true,"please provide the category of the product"],
        enum :{
            values:[
                'Electronics',
                'Mobile Phones',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                'Books',
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'
            ],
            message:'Please select the appropriate category'
        }
    },
    seller:{
        type: String,
        required: [true,'pleaseenter the product seller']
    },
    stock: {
        type: Number,
        required: [true, 'please enter the stock quantity'],
        maxLength:[20,"product stock doesn't exceed 20"]
    },
    numOfReviews:{
        type:Number,
        default: 0
    },
    reviews:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            rating:{
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user:{
        type: mongoose.Schema.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const productModel = mongoose.model('Product',productSchema)

module.exports = productModel