import express from 'express'
import connectDB from './config/mongo.config.js';

import userRoutes      from './routes/user.routes.js';
import contactRoutes   from './routes/contact.routes.js';
import categoryRoutes  from './routes/category.routes.js';
import productRoutes   from './routes/product.routes.js';
import promotionRoutes from './routes/promotion.routes.js';
import quoteRoutes     from './routes/quote.routes.js';
import orderRoutes     from './routes/order.routes.js';
import paymentRoutes   from './routes/payment.routes.js';

const PORT = process.env.PORT || 3000 ;

const app = express();

connectDB();

app.use(express.json());

app.use('/users',      userRoutes);
app.use('/contacts',   contactRoutes);
app.use('/categories', categoryRoutes);
app.use('/products',   productRoutes);
app.use('/promotions', promotionRoutes);
app.use('/quotes',     quoteRoutes);
app.use('/orders',     orderRoutes);
app.use('/payments',   paymentRoutes);

app.listen(PORT, ()=> {
    console.log(`Server Running on: http://localhost:${PORT}`);
});


