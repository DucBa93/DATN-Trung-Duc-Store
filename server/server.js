const express=require('express')
const mongoose=require('mongoose')
const cookieParser = require('cookie-parser');
const cors = require('cors')
const authRouter = require('./routes/auth/auth-routes')
const adminProductsRoutes = require('./routes/admin/products-routes')

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");


//Create a database conection
mongoose
.connect('mongodb+srv://thaibaduc2003:Duc_2003@cluster0.z0nxh0r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(console.log('Conect database successfully !'))
.catch((error) => console.log(error));
const app= express()
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: 'http://localhost:5173', // chi cho phep frontend :5173 goi API
        methods: ['GET', 'POST', 'DELETE', 'PUT'], 
        allowedHeaders: [
            "Content-Type",
            'Authorization',
            'Cache-Control',
            'Expires',
            'Pragma'
        ],
        credentials: true // Cho phep cookies, Author, JWT duoc gui cung request
    })

)

app.use(cookieParser())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/admin/products', adminProductsRoutes)

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);


app.listen(PORT, ()=> console.log(`Server is running on port:${PORT}`)
)