import { APIGatewayEvent, APIGatewayProxyResult, Context, Handler } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import { install } from 'source-map-support';
import app from './app';

install();

const server = createServer(app);
export const handler: Handler<APIGatewayEvent, APIGatewayProxyResult> = (event: APIGatewayEvent, context: Context) => {
  proxy(server, event, context);
};
