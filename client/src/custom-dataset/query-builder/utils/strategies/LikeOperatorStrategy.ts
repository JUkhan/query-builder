import { ValueFormatterStrategy } from './valueFormatterStrategy';

export class LikeOperatorStrategy implements ValueFormatterStrategy {
    format(rule: any): string {
        return `'%${rule.specificValue}%'`; // LIKE operator formatting
    }
}
