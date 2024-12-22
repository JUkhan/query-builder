// Your enums for operators

import { CONDITION_OPERATORS_ENUM } from './enums';
import { BooleanValueStrategy } from './strategies/BooleanOperatorStrategy';
import { InOperatorStrategy } from './strategies/InOperatorStrategy';
import { LikeOperatorStrategy } from './strategies/LikeOperatorStrategy';
import { NullOperatorStrategy } from './strategies/NullOperatorStrategy';
import { ValueFormatterStrategy } from './strategies/valueFormatterStrategy';

export class ValueFormatter {
    static format(rule: any): string {
        const strategy = ValueFormatter.getStrategy(rule);
        return strategy ? strategy.format(rule) : `'${rule.specificValue}'`;
    }

    private static getStrategy(rule: any): ValueFormatterStrategy | null {
        if (
            rule.operator === CONDITION_OPERATORS_ENUM.IS_NULL ||
            rule.operator === CONDITION_OPERATORS_ENUM.IS_NOT_NULL
        ) {
            return new NullOperatorStrategy();
        }

        if (
            rule.operator === CONDITION_OPERATORS_ENUM.IN ||
            rule.operator === CONDITION_OPERATORS_ENUM.NOT_IN
        ) {
            return new InOperatorStrategy();
        }

        if (rule.operator === CONDITION_OPERATORS_ENUM.LIKE) {
            return new LikeOperatorStrategy();
        }

        if (rule.specificValue === 'true' || rule.specificValue === 'false') {
            return new BooleanValueStrategy();
        }

        return null;
    }
}
