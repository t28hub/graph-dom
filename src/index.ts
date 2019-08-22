import {APIGatewayEvent, Context, Callback, Handler} from 'aws-lambda';

export const handler: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  context.succeed({
    statusCode: 200,
    body: JSON.stringify({event}),
  });
};
