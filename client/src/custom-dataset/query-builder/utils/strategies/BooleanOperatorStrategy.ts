import { ValueFormatterStrategy } from './valueFormatterStrategy';

export class BooleanValueStrategy implements ValueFormatterStrategy {
    format(rule: any): string {
        return rule.specificValue; // Boolean values
    }
}
