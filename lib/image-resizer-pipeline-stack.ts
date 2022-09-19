import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
export class ImageResizerStackPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new codecommit.Repository(this, 'ImageResizer', {
            repositoryName: "image-resizer"
        });

    }
}