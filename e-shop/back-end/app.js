const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan =require('morgan');
const mongoose = require ('mongoose');
const cors = require('cors');
// Model is in nodejs and collection is mongo db
require('dotenv/config');
const auth = require('./helper/jwt');
const errorHandler = require('./helper/error-handler');

app.use(cors());
//* allowing erverything
app.options('*', cors())

//Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(auth());
app.use(errorHandler);
app.use('/public/uploads', express.static(__dirname+'/public/uploads'));

//Routers
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');
const orderItemsRouter = require('./routers/orderItems');
const authJwt = require('./helper/jwt');

const api = process.env.API_URL;

app.use(`${api}/products`,productsRouter);
app.use(`${api}/categories`,categoriesRouter);
app.use(`${api}/users`,usersRouter);
app.use(`${api}/orders`,ordersRouter);
app.use(`${api}/orderItems`,orderItemsRouter);


//Database
mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    dbName: 'E-Store'
}).then(()=>{
    console.log('Database connection is ready...');
})
.catch((err)=>{
    console.log(err);
})

//Server
app.listen(3000,()=>{
    console.log('server is running http://localhost:3000')
})

