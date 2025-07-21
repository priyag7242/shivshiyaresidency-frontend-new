import mongoose from 'mongoose';
import { config } from '../config/config';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('⚠️  MongoDB connection failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log('📝 Note: The app will run without database for now.');
    console.log('💡 To fix: Set up MongoDB Atlas or install MongoDB locally.');
    // Don't exit - let the app run without database for demo purposes
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
}); 