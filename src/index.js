import express from 'express';
import connectDB from './config/mongo.config.js';

const app = express();

connectDB();

app.use(express.json());

app.listen(5000, ()=> {
    console.log('Server Running on: http://localhost:5000');
});


