
import dotenv from 'dotenv';
import { PersistenceFurthersService } from './application/PersistenceFurthersService';

// Load environment variables
dotenv.config();

async function main(): Promise<void> {
  const service = new PersistenceFurthersService();

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await service.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await service.stop();
    process.exit(0);
  });

  try {
    await service.start();
  } catch (error) {
    console.error('Failed to start service:', error);
    process.exit(1);
  }
}

main().catch(console.error);
