import { ValueFormatterStrategy } from './valueFormatterStrategy';

export class InOperatorStrategy implements ValueFormatterStrategy {
    format(rule: any): string {
        return `(${rule.specificValue})`; // IN operator formatting
    }
}
