import serverless from 'serverless-http';
import createApp from '../backend/dist/server';

// Create the Express app using the factory function
const app = createApp();

// Export Vercel-compatible handler
export default serverless(app);
