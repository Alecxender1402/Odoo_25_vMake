/* --- IMPORT DEPENDENCIES --- */
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

/* --- IMPORT MODULES --- */
import authRoutes from './routes/auth.routes.js';
import stackRoutes from './routes/stack.routes.js';

/* --- SET ENV --- */
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const { MONGO_URI } = process.env;

/* --- MIDDLEWARES --- */
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

/* --- CONNECT DB --- */
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch((err) => {
    console.error('Connection error', err);
    process.exit();
  });

/* --- USE ROUTES --- */
app.use('/api/auth', authRoutes);
app.use('/api/stacks', stackRoutes);

/* --- START SERVER --- */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
