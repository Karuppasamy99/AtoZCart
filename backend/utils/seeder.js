const data= require('../data/products.json')
const Product = require('../models/productModel')

const dotenv = require('dotenv')
const connectDatabase = require('../config/database')

dotenv.config({path: 'backend/config/config.env'})

connectDatabase()

const seeder = async() =>{
    try{
        await Product.deleteMany()
        console.log('Products deleted');
        await Product.insertMany(data)
        console.log('products added');
    }catch(e){
        console.log(e.message)
    }
    process.exit()
}

seeder()