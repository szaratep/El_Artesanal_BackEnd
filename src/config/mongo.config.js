import mongoose from 'mongoose';

const  DB_CONECT = process.env.DB_URI_LOCAL

const connectDB = async () => {
    try { 
        await mongoose.connect(DB_CONECT);
        console.log('MongoDB local host connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    };
};

export default connectDB;