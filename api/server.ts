import serverless from 'serverless-http';
// Import from compiled backend (backend is built before this via buildCommand in vercel.json)
import createApp from '../backend/dist/server';

// Create the Express app using the factory function
const app = createApp();

// Export Vercel-compatible handler
export default serverless(app);
