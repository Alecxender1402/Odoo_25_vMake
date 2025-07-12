import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseSeeder from './seeder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

console.log('🔍 Environment check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

const runSeeder = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    console.log('URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

    // Run the seeder
    const seeder = new DatabaseSeeder();
    await seeder.seed();

    console.log('🏁 Seeding process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding process failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

// Check if this script is being run directly
const isMainScript = process.argv[1] === fileURLToPath(import.meta.url) || 
                    process.argv[1].endsWith('seeds/index.js');

if (isMainScript) {
  console.log('🌱 Running seeder directly...');
  runSeeder();
}

export default runSeeder;