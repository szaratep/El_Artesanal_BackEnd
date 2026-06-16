import mongoose from 'mongoose';

const connectDB = async () => {
    try { 
        await mongoose.connect('mongodb://localhost:27017/ElArtesanalDB',);
        console.log('MongoDB local host connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    };
};

export default connectDB;