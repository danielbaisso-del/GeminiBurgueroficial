import serverless from 'serverless-http';
import createApp from '../backend/src/server';

const app = createApp();
const handler = serverless(app as any);

export default handler;
export { handler };
