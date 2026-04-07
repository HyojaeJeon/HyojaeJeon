declare module 'graphql-depth-limit' {
  import { ValidationRuleNode } from 'graphql';

  export default function depthLimit(maxDepth: number): ValidationRuleNode;
}
