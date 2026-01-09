import serverless from 'serverless-http';
import createApp from '../backend/src/server';

const app = createApp();

// Export handler for Vercel serverless functions
// serverless-http wraps Express app for AWS Lambda-compatible environments
export default serverless(app);
