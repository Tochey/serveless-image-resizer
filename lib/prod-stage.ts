import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib'

export class ProdStage extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);


    }
}