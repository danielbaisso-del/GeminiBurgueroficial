import serverless from 'serverless-http';
import createApp from '../backend/src/server';

const app = createApp();

export default serverless(app as any);
