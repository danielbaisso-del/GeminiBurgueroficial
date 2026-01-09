import serverless from 'serverless-http';
import { Application } from 'express';
import createApp from '../backend/src/server';

const app = createApp();
const handler = serverless(app as Application);

export default handler;
export { handler };
