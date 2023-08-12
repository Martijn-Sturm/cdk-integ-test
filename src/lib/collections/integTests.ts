import { Construct } from 'constructs';
import { DemoTable } from '../components/demoTable';

const ID = 'integTests';

export class IntegrationTests extends Construct {
  constructor(scope: Construct) {
    super(scope, ID);

    new DemoTable(this).configureForIntegTest();
  }
}
