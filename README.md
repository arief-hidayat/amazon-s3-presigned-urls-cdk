# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Context

Ref: https://aws.amazon.com/blogs/compute/uploading-to-amazon-s3-directly-from-a-web-or-mobile-application/
Modified for Jakarta region

```
API=https://23p926q37c.execute-api.ap-southeast-3.amazonaws.com/prod
SIGNED_URL=$(curl -H "Authorization: Allow" $API | jq -r .uploadURL)
echo $SIGNED_URL
curl -v --upload-file severity.jpeg $SIGNED_URL
```