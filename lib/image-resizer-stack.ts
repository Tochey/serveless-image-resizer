import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as aws_s3 from 'aws-cdk-lib/aws-s3'
import * as s3_deploy from 'aws-cdk-lib/aws-s3-deployment';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'

export class ImageResizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const website = new aws_s3.Bucket(this, 'Bucket', {
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: RemovalPolicy.DESTROY
    })

    new cdk.CfnOutput(this, "static-website-url", {
      value: website.bucketWebsiteUrl,
      description: "Bucket Website Url"
    })

    new s3_deploy.BucketDeployment(this, 'static-website-deploy', {
      sources: [s3_deploy.Source.asset('./website-dist')],
      destinationBucket: website
    });

    new lambda.Function(this, "image-resizer", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda/Image-resizer'),
      handler: 'imageResizer.handler',
      environment: {

      }
    })

  }
}
