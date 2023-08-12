import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as dynamodb from '@aws-sdk/lib-dynamodb';
import { SQSEvent, Context } from 'aws-lambda';
import * as logging from '@aws-lambda-powertools/logger'

const TABLE_NAME = process.env.TABLE_NAME || '';

const LOGGER = new logging.Logger({
  serviceName: TABLE_NAME,
});

LOGGER.setLogLevel('INFO');
const DOC_CLIENT = dynamodb.DynamoDBDocumentClient.from(new DynamoDBClient({ }))

type Model = {
    id: string;
}   

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function lambdaHandler(event: SQSEvent, _context: Context) {

    const objs: Model[]  = event.Records.map(record => {
        const { body } = record;
        LOGGER.info('Record:', { body });
        return JSON.parse(body);
    });

    const putRequests: dynamodb.PutCommandInput[] = objs.map(obj => {
        return {
            TableName: TABLE_NAME,
            Item: { id: obj.id }
        }
    })

    await Promise.all(putRequests.map(async putRequest => {
        const response = await DOC_CLIENT.send(new dynamodb.PutCommand(putRequest));
        LOGGER.info('Put item', { response });
    }))

}
