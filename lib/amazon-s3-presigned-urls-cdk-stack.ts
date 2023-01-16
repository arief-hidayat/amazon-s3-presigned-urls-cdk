import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ApiGatewayToLambda, ApiGatewayToLambdaProps } from '@aws-solutions-constructs/aws-apigateway-lambda';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as agw from 'aws-cdk-lib/aws-apigateway';

export class AmazonS3PresignedUrlsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // ref: https://github.com/aws-samples/amazon-s3-presigned-urls-aws-sam/blob/master/templateWithAuth.yaml

    // S3UploadBucket
    const s3Bucket = new s3.Bucket(this, 'S3UploadBucket', {
      bucketName: 'ariefh-s3-presigned-url-cdk',
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT, s3.HttpMethods.DELETE, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
        }
      ]
    });

    const s3CrudPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetObjectVersion",
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetLifecycleConfiguration",
        "s3:PutLifecycleConfiguration",
        "s3:DeleteObject"
      ],
      resources: [
        s3Bucket.bucketArn,
        `${s3Bucket.bucketArn}/*`
      ]
    });

    const apiGw = new ApiGatewayToLambda(this, 'ApiGatewayToLambda', {
      lambdaFunctionProps: {
        code: lambda.Code.fromAsset(`getSignedURL`),
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'app.handler',
        memorySize: 128,
        timeout: Duration.seconds(5),
        environment: {
          'UploadBucket': s3Bucket.bucketName
        },
        // not available in CGK yet
        tracing: lambda.Tracing.DISABLED
      },
      apiGatewayProps: {
        deployOptions: {
          // https://github.com/awslabs/aws-solutions-constructs/blob/main/source/patterns/@aws-solutions-constructs/core/lib/apigateway-defaults.ts
          dataTraceEnabled: false,
          tracingEnabled: false
        },
      }
    });

    apiGw.lambdaFunction.addToRolePolicy(s3CrudPolicy);

    // import { WafwebaclToApiGatewayProps, WafwebaclToApiGateway } from "@aws-solutions-constructs/aws-wafwebacl-apigateway";
    // new WafwebaclToApiGateway(this, 'test-wafwebacl-apigateway', {
    //   existingApiGatewayInterface: apiGatewayToLambda.apiGateway
    // });

    new cdk.CfnOutput(this, 's3BucketArn', {
      value: s3Bucket.bucketArn,
      description: 'S3 Bucket ARN',
    });

  }
}
