import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import stackRoutes from './routes/stack.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB.');
    })
    .catch(err => {
        console.error('Connection error', err);
        process.exit();
    });

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the StackIt API.' });
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/stacks', stackRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});