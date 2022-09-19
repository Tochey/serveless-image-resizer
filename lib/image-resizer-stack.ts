import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as aws_s3 from 'aws-cdk-lib/aws-s3'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as s3_deploy from 'aws-cdk-lib/aws-s3-deployment';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'

export class ImageResizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const website = new aws_s3.Bucket(this, 'websiteBucket', {
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: RemovalPolicy.DESTROY
    })


    new s3_deploy.BucketDeployment(this, 'static-website-deploy', {
      sources: [s3_deploy.Source.asset('./website-dist')],
      destinationBucket: website,
      retainOnDelete : false
    });

    new cdk.CfnOutput(this, "static-website-url", {
      value: website.bucketWebsiteUrl,
      description: "Bucket Website Url"
      
      
    })
    const uploadBucket = new aws_s3.Bucket(this, 'userUploadBucket', {
      removalPolicy: RemovalPolicy.DESTROY
    })

      const imageWorker = new lambda.Function(this, "image-worker", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda/imageworker'),
      handler: 'imageWorker.handler',
      environment: {
        s3_UPLOAD_BUCKET : uploadBucket.bucketName
      }
    })

    const api = new apigw.LambdaRestApi(this, 'getsignedUrl', {
      handler: imageWorker,
      restApiName : 'getSignedUrl',
      proxy : false
    })

    const s3SignedUrl = api.root.addResource('getSignedUrl')
    s3SignedUrl.addMethod('GET',  new apigw.LambdaIntegration(imageWorker))
  }
}
