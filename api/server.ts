/**
 * Vercel Serverless Function Wrapper
 * 
 * This file wraps the Express app for deployment as a Vercel serverless function.
 * It imports the app factory from backend and uses serverless-http to handle requests.
 */

import serverless from 'serverless-http';
import { Application } from 'express';
import createApp from '../backend/src/server';

// Create the Express app instance
const app = createApp();

// Export the serverless handler with proper type
export const handler = serverless(app as Application);
