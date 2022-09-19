#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ImageResizerStack } from '../lib/image-resizer-stack';
import { ImageResizerStackPipelineStack } from '../lib/image-resizer-pipeline-stack';

const app = new cdk.App();
new ImageResizerStackPipelineStack(app, 'ImageResizerPipelineStack')
// new ImageResizerStack(app, 'ImageResizerStack', {});