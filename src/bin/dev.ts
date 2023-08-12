import * as cdk from 'aws-cdk-lib';
import { getBranch } from './env';
import { IntegrationTests } from '../lib/collections/integTests';
import { Construct } from 'constructs';
import { Stage } from './env';

// const STAGE = Stage.DEV;

const branchName = getBranch();

export class Dev extends cdk.Stack {
  constructor(scope: Construct, props?: cdk.StackProps) {
    super(scope, `${branchName}-${Stage.DEV}`, { ...props });

    new IntegrationTests(this);
  }
}
