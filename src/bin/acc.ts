import * as cdk from 'aws-cdk-lib';
import { getBranch } from './env';
import { IntegrationTests } from '../lib/collections/integTests';
import { Platform } from '../lib/collections/platform';
import { Construct } from 'constructs';
import { Stage } from './env';

export class Acc extends cdk.Stack {
  constructor(scope: Construct, props?: cdk.StackProps) {
    super(scope, Stage.ACC, { ...props });

    new IntegrationTests(this);

    new Platform(this);
  }
}
