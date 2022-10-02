import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as aws_s3 from 'aws-cdk-lib/aws-s3'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as s3_deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class ImageResizerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const website = new aws_s3.Bucket(this, 'websiteBucket', {
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects : true
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
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [
            aws_s3.HttpMethods.GET,
            aws_s3.HttpMethods.POST,
            aws_s3.HttpMethods.PUT,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      autoDeleteObjects : true
    })

    const outputBucket = new aws_s3.Bucket(this, 'userOutputBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [
            aws_s3.HttpMethods.GET,
            aws_s3.HttpMethods.POST,
            aws_s3.HttpMethods.PUT,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      autoDeleteObjects : true
    })

      const imageWorker = new lambda.Function(this, "image-worker", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda/imageworker'),
      handler: 'imageWorker.handler',
      timeout : Duration.seconds(60),
      memorySize : 512,
      environment: {
        s3_UPLOAD_BUCKET : uploadBucket.bucketName,
        s3_OUTPUT_BUCKET : outputBucket.bucketName
      }
    })

    const api = new apigw.LambdaRestApi(this, 'getsignedUrl', {
      handler: imageWorker,
      restApiName : 'getSignedUrl',
      proxy : false,
      defaultCorsPreflightOptions: {
        allowHeaders: [
          // 'Content-Type',
          // 'Height',
          // 'Width',
          // 'X-Api-Key',
          '*'
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['*'],
      },
    })

    imageWorker.addEventSource(new S3EventSource(uploadBucket, {
      events: [aws_s3.EventType.OBJECT_CREATED]
    }))

    const s3UploadSignedUrl = api.root.addResource('getUploadSignedUrl')
    const s3DownloadSignedUrl = api.root.addResource('getDownloadSignedUrl')
    s3UploadSignedUrl.addMethod('GET',  new apigw.LambdaIntegration(imageWorker))
    s3DownloadSignedUrl.addMethod('GET',  new apigw.LambdaIntegration(imageWorker))
    

    uploadBucket.grantPut(imageWorker)
    uploadBucket.grantRead(imageWorker)
    outputBucket.grantPut(imageWorker)
    outputBucket.grantRead(imageWorker)
  }
}
