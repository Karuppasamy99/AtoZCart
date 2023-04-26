const express = require('express')
const app = express()
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({path:path.join(__dirname,'config/config.env')})

const errorMiddleware = require('./middleware/error')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(path.join(__dirname,'uploads')))
const products = require('./routes/product')
const user = require('./routes/auth')
const order = require('./routes/order')
const payment = require('./routes/payment')
app.use('/api/v1/',products)
app.use('/api/v1/',user)

app.use('/api/v1/',order)
app.use('/api/v1',payment)

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname,'../frontend/build')))
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,`../frontend/build/index.html`))
    })
}

app.use(errorMiddleware)

module.exports = app