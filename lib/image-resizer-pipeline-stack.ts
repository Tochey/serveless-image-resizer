import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit'
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
export class ImageResizerStackPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const repository = new codecommit.Repository(this, 'ImageResizer', {
            repositoryName: "image-resizer"
        });

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'ImageResizerPipeline',
            synth: new CodeBuildStep('SynthStep', {
                input: CodePipelineSource.codeCommit(repository, 'main'),
                installCommands: [
                    'npm install -g aws-cdk'
                ],
                commands: [
                    'npm ci',
                    'npm build',
                    'npx cdk synth'
                ]
            })
        })

    }
}