const app = require('./app')

const connectDataBase = require('./config/database')



connectDataBase()

const server = app.listen(process.env.PORT,()=>console.log(`listening to the port ${process.env.PORT} in ${process.env.NODE_ENV}`))

process.on('unhandledRejection',(err)=>{
    console.log(`error: ${err.message}`);
    console.log('server closed due to unhandled rejection');
    server.close(()=>{
        process.exit(1)
    })
})

process.on('uncaughtException',(err)=>{
    console.log(`error: ${err.message} `)
    console.log(`server closed due to uncaughtException`);
    server.close(()=>{
        process.exit(1)
    })
})



