import { Construct } from 'constructs';
import { DemoTable } from '../components/demoTable';

const ID = 'PlatformName';

export class Platform extends Construct {
  constructor(scope: Construct) {
    super(scope, ID);

    new DemoTable(this);
  }
}
