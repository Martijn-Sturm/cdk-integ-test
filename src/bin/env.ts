import { execSync } from 'child_process';

export enum Stage {
  DEV = 'dev',
  PROD = 'prod',
  ACC = 'acc',
}

export function getBranch(): string {
  try {
    const stdout = execSync('git rev-parse --abbrev-ref HEAD');
    return stdout.toString().trim();
  } catch (err) {
    throw new Error(String(err));
  }
}
