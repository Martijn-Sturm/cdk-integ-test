import * as cdk from 'aws-cdk-lib';
import { Dev } from './src/bin/dev';
import { Acc } from './src/bin/acc';

const app = new cdk.App();

new Dev(app);

new Acc(app);

app.synth();
