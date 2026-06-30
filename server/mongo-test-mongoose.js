import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load .env file from server root
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

console.log('=== MONGOOSE CONNECTION TEST ===\n');
console.log('Current Working Directory:', process.cwd());
console.log('Mongo URI:', process.env.MONGODB_URI ? 'Loaded (hidden)' : 'NOT LOADED');
console.log('Node Version:', process.version);
console.log('Mongoose Version:', mongoose.version);
console.log('\n');

// Enable mongoose debug mode
mongoose.set('debug', true);

// Connection lifecycle events
mongoose.connection.on('connecting', () => {
  console.log('[Mongoose] Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('[Mongoose] Connected to MongoDB');
  console.log('[Mongoose] Connection host:', mongoose.connection.host);
  console.log('[Mongoose] Connection name:', mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  console.error('[Mongoose] Connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('[Mongoose] Disconnected from MongoDB');
});

const testConnection = async () => {
  try {
    console.log('[Test] Starting connection attempt...\n');
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('[Test] Connection options:');
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };
    console.log(JSON.stringify(options, null, 2));
    console.log('\n');

    await mongoose.connect(uri, options);
    
    console.log('\n[SUCCESS] Connection established!');
    console.log('[Test] Connection state:', mongoose.connection.readyState);
    console.log('[Test] Ready states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
    
    await mongoose.disconnect();
    console.log('[Test] Disconnected successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('\n[FAILURE] Connection failed!');
    console.error('\n=== FULL ERROR OBJECT ===');
    console.error(error);
    console.error('\n=== ERROR MESSAGE ===');
    console.error(error.message);
    console.error('\n=== ERROR NAME ===');
    console.error(error.name);
    console.error('\n=== ERROR CODE ===');
    console.error(error.code);
    console.error('\n=== STACK TRACE ===');
    console.error(error.stack);
    
    if (error.reason) {
      console.error('\n=== ERROR REASON ===');
      console.error(error.reason);
    }
    
    process.exit(1);
  }
};

testConnection();
