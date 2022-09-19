import { Construct } from "constructs";
import {Stage, StageProps} from 'aws-cdk-lib'
import { ImageResizerStack } from "./image-resizer-stack";

export class TestStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
      super(scope, id, props);

        new ImageResizerStack(this, 'devStack')
    }
}