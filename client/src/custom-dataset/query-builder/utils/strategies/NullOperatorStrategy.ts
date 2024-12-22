import { ValueFormatterStrategy } from './valueFormatterStrategy';

export class NullOperatorStrategy implements ValueFormatterStrategy {
    format(rule: any): string {
        return ''; // No value needed for null operators
    }
}
