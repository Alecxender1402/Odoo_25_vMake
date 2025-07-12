/* --- IMPORT DEPENDENCIES --- */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

/* --- IMPORT MODULES --- */
import authRoutes from './routes/auth.routes.js';
import stackRoutes from './routes/stack.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';

/* --- SET ENV --- */
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* --- MIDDLEWARES --- */
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/* --- ROUTES --- */
app.use('/api/auth', authRoutes);
app.use('/api/stacks', stackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running!', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Seeding route (development only)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/seed', async (req, res) => {
    try {
      // Fix: Use named export instead of default export
      const { DatabaseSeeder } = await import('./seeds/seeder.js');
      const seeder = new DatabaseSeeder();
      await seeder.seedDatabase();
      res.status(200).json({ 
        message: 'Database seeded successfully!',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Seeding failed:', error);
      res.status(500).json({ 
        message: 'Seeding failed', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
}

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'StackIt API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      stacks: '/api/stacks',
      notifications: '/api/notifications',
      admin: '/api/admin',
      ...(process.env.NODE_ENV === 'development' && { seed: '/api/seed' })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date()
  });
});

/* --- START SERVER WITH DATABASE CONNECTION --- */
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Auto-seed in development if database is empty
    if (process.env.NODE_ENV === 'development') {
      try {
        const { User } = await import('./models/User.js');
        const userCount = await User.countDocuments();
        
        if (userCount === 0) {
          console.log('🌱 Database is empty, running auto-seeding...');
          const { DatabaseSeeder } = await import('./seeds/seeder.js');
          const seeder = new DatabaseSeeder();
          await seeder.seedDatabase();
          console.log('✅ Auto-seeding completed successfully');
        } else {
          console.log(`📊 Database already has ${userCount} users, skipping auto-seed`);
        }
      } catch (seedError) {
        console.error('❌ Auto-seeding failed:', seedError.message);
        // Don't exit, just log the error
      }
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
      console.log(`🏠 Home URL: http://localhost:${PORT}/`);
      console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🌱 Seed endpoint: http://localhost:${PORT}/api/seed (POST)`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
