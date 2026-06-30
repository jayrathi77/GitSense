import dotenv from 'dotenv';
import path from 'path';
import { MongoClient } from 'mongodb';

// Load .env file from server root
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

console.log('=== MONGODB DRIVER CONNECTION TEST ===\n');
console.log('Current Working Directory:', process.cwd());
console.log('Mongo URI:', process.env.MONGODB_URI ? 'Loaded (hidden)' : 'NOT LOADED');
console.log('Node Version:', process.version);
console.log('\n');

const testConnection = async () => {
  let client;
  
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

    client = new MongoClient(uri, options);
    
    console.log('[Driver] Connecting...');
    await client.connect();
    console.log('[Driver] Connected successfully!');
    
    const admin = client.db().admin();
    const serverInfo = await admin.serverInfo();
    console.log('\n[Driver] Server Info:');
    console.log(JSON.stringify(serverInfo, null, 2));
    
    const dbList = await client.db().admin().listDatabases();
    console.log('\n[Driver] Databases:');
    console.log(dbList.databases.map(db => db.name).join(', '));
    
    console.log('\n[SUCCESS] Connection established with native driver!');
    
    await client.close();
    console.log('[Driver] Closed successfully');
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
    
    if (error.cause) {
      console.error('\n=== ERROR CAUSE ===');
      console.error(error.cause);
    }
    
    if (client) {
      await client.close();
    }
    
    process.exit(1);
  }
};

testConnection();
