import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { generateParameterName } from '../parameters';

const TABLE_NAME = 'Demo';

export class DemoTable extends Construct {
  public readonly id: string = TABLE_NAME;

  public readonly table: dynamodb.Table;

  public queue: Queue;

  constructor(scope: Construct) {
    super(scope, TABLE_NAME);

    this.table = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // timeToLiveAttribute: 'ttl'
    });

    this.queue = new Queue(this, 'Queue', {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    const fn = new lambdaNodejs.NodejsFunction(this, 'Function', {
      entry: 'src/lambdas/demoIngest/src/main.ts',
      handler: 'lambdaHandler',
      architecture: lambda.Architecture.X86_64,
      environment:{
        TABLE_NAME: this.table.tableName
      }
    });
    this.table.grantWriteData(fn);
    fn.addEventSource(new lambdaEventSources.SqsEventSource(this.queue));
  }

  public configureForIntegTest() {
    new ssm.StringParameter(this, 'tableName', {
      parameterName: generateParameterName(this, 'tableName'),
      stringValue: this.table.tableName,
    });

    new ssm.StringParameter(this, 'QueueUrl', {
      parameterName: generateParameterName(this, 'queueUrl'),
      stringValue: this.queue.queueUrl,
    });
  }
}
