const mongoose = require('mongoose')

mongoose.set("strictQuery", false);

const connectDataBase = () => {
    mongoose.connect(process.env.DB_LOCAL_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(con => console.log(`the host name is ${con.connection.host}`))
    
}


module.exports = connectDataBase