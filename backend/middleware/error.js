const ErrorHandler = require("../utils/errorHandler")

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500

    if(process.env.NODE_ENV === 'development'){
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            stack: err.stack,
            err: err
        })
    }

    if(process.env.NODE_ENV == 'production'){
        let message = err.message;
        let error = new Error(message);
       

        if(err.name == "ValidationError") {
            message = Object.values(err.errors).map(value => value.message)
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.name =="CastError"){
            message = `Resource not found: ${err.path}`
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.code == 11000){
            message = `Duplicate ${Object.keys(err.keyValue)} error`
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.code == "JSONWebTokenError"){
            message = `JSON web token is invalid. Try again`
            error = new Error(message)
            err.statusCode = 400
        }

        if(err.code == "TokenExpiredError"){
            message = `JSON web token is expired. Try again`
            error = new Error(message)
            err.statusCode = 400
        }

        res.status(err.statusCode).json({
            success: false,
            message: error.message || 'internal server error',
        })
    }
    
}