# Integration tests for AWS CDK

This repo contains a minimal working example of running integration tests on AWS cloud infrastructure. Check out my [blog post](https://martijn-sturm.hashnode.dev/integration-testing-aws-cdk) for more details.

## Deploy

Deploy the `Dev` or `Acc` stack by running either `npx cdk deploy {branch name}-dev` or `npx cdk deploy acc`

## Test

Run the integration demo test in `demo.test.ts` with the command `npx jest`
