import { ParameterClient, ParameterRegistry } from '../src/lib/parameters';
import { getBranch, Stage } from '../src/bin/env';
import { SSMClient } from '@aws-sdk/client-ssm';
import * as dynamodb from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as sqs from '@aws-sdk/client-sqs';
import { repeatAssertion } from './repeat';

const sqsClient = new sqs.SQSClient({ region: 'eu-central-1' });
const dynamoClient = dynamodb.DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-central-1' })
);

describe('When a message is send to the SQS queue with an item', () => {
  let shouldRunCleanup: boolean = false;
  let params: { queueUrl: string; tableName: string };

  const itemId = '123';

  beforeAll(async () => {
    const branch = getBranch();
    console.log(`Branch: ${branch}`);
    const stage = Stage.DEV;
    console.log(`Stage: ${stage.toString()}`);
    const ssmClient = new SSMClient({ region: 'eu-central-1' });
    const paramClient = new ParameterClient(stage, ssmClient, branch);

    params = await paramClient.retrieveParameters({
      queueUrl: ParameterRegistry.integTests_Demo_QueueUrl,
      tableName: ParameterRegistry.integTests_Demo_tableName,
    });

    console.log(`QueueUrl: ${params.queueUrl}`);
    console.log(`TableName: ${params.tableName}`);

    // // The table should be empty before the test case is started
    // if (
    //   (await tableIsEmpty(params.tableName, dynamoClient)) === false
    // ) {
    //   throw new Error(
    //     `Table ${params.tableName} is not empty before test case is started`
    //   );
    // }
    await sqsClient.send(
      new sqs.SendMessageCommand({
        QueueUrl: params.queueUrl,
        MessageBody: JSON.stringify({
          id: itemId,
          name: 'Test item',
          description: 'This is a test item',
        }),
      })
    );
  });

  test('Then the item is placed on the table', async () => {
    const queryCommand = new dynamodb.QueryCommand({
      TableName: params.tableName,
      KeyConditionExpression: '#pk = :pk',
      ExpressionAttributeNames: {
        '#pk': 'id',
      },
      ExpressionAttributeValues: {
        ':pk': itemId,
      },
    });
    console.log(`QueryCommand: ${JSON.stringify(queryCommand)}`);

    const assertions = async () => {
      const response = await dynamoClient.send(queryCommand);
      console.log(response);
      expect(response).toHaveProperty('Items');
      // expect(response.Items).toHaveLength(1);
      if (response.Items === undefined) {
        throw new Error('Items is undefined');
      }
      if (response.Items.length !== 1) {
        throw new Error(`Expected 1 item, got ${response.Items.length}`);
      }

      expect(response.Items[0]).toEqual(expect.objectContaining({'id': itemId}));
    };

    await repeatAssertion(assertions, 5, 20, true);
    shouldRunCleanup = true;
  }, 120000);

  // afterAll(async () => {
  //   if (shouldRunCleanup === true) {
  //     await removeItem(params.tableName, primaryKey, dynamoClient);
  //     await expect(
  //       tableIsEmpty(params.tableName, dynamoClient)
  //     ).resolves.toBeTruthy();
  //   }
  // });
});
