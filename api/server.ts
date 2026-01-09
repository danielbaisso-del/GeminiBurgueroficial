import serverless from 'serverless-http';
import { Application } from 'express';
import createApp from '../backend/src/server';

const app: Application = createApp();

export const handler = serverless(app);
