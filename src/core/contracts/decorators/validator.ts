import { manager, ActionValidator, ConditionValidator, Utils } from '@itsmybot';
import { validate, ValidationArguments, ValidatorConstraintInterface, ValidatorConstraint, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@ValidatorConstraint({ name: 'isPermissionFlag', async: false })
export class IsPermissionFlag implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const permission = Utils.getPermissionFlags(value.toString());
    return permission !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Permission must be a valid permission flag.';
  }
}

@ValidatorConstraint({ name: 'isActivityType', async: false })
export class IsActivityType implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const activityType = Utils.getActivityType(value.toString());
    return activityType !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    return 'This is not a valid activity type. Please use one of the following: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING';
  }
}

@ValidatorConstraint({ name: 'isTextInputStyle', async: false })
export class IsTextInputStyle implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const textInputStyle = Utils.getTextInputStyle(value.toString());
    return textInputStyle !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    return 'This is not a valid activity type. Please use one of the following: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING';
  }
}

@ValidatorConstraint({ name: 'isCommandOptionType', async: false })
export class IsCommandOptionType implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const commandOptionType = Utils.getCommandOptionType(value.toString());
    return commandOptionType !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    return 'This is not a command option type.';
  }
}

@ValidatorConstraint({ name: 'isChannelType', async: false })
export class IsChannelType implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const channelType = Utils.getChannelType(value.toString());
    return channelType !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    return 'This is not a valid channel type. Please use one of the following: GUILD_TEXT, GUILD_VOICE, GUILD_CATEGORY, GUILD_NEWS, GUILD_STORE, GUILD_NEWS_THREAD, GUILD_PUBLIC_THREAD, GUILD_PRIVATE_THREAD, GUILD_STAGE_VOICE';
  }
}

@ValidatorConstraint({ name: 'isBooleanOrString', async: false })
export class IsBooleanOrString implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return typeof value === 'boolean' || typeof value === 'string';
  }

  defaultMessage(args: ValidationArguments) {
    return 'This is not a valid type. Please use either a boolean or a string.';
  }
}

@ValidatorConstraint({ name: 'isValidMetaKey', async: false })
export class IsValidMetaKey implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return manager.services.engine.metaHandler.metas.has(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `The meta key ${args.value} does not exist. Please define it in the meta configuration.`;
  }
}

@ValidatorConstraint({ name: 'isNumberMeta', async: false })
export class IsNumberMeta implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const meta = manager.services.engine.metaHandler.metas.get(value);
    return meta?.type == 'number'
  }

  defaultMessage(args: ValidationArguments) {
    return `The meta key ${args.value} is not of type number.`;
  }
}

@ValidatorConstraint({ name: 'isBooleanMeta', async: false })
export class IsBooleanMeta implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const meta = manager.services.engine.metaHandler.metas.get(value);
    return meta?.type == 'boolean'
  }

  defaultMessage(args: ValidationArguments) {
    return `The meta key ${args.value} is not of type boolean.`;
  }
}

@ValidatorConstraint({ name: 'isListMeta', async: false })
export class IsListMeta implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const meta = manager.services.engine.metaHandler.metas.get(value);
    return meta?.type == 'list'
  }

  defaultMessage(args: ValidationArguments) {
    return `The meta key ${args.value} is not of type list.`;
  }
}

@ValidatorConstraint({ name: 'isNotListMeta', async: false })
export class IsNotListMeta implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const meta = manager.services.engine.metaHandler.metas.get(value);
    return meta?.type !== 'list'
  }

  defaultMessage(args: ValidationArguments) {
    return `The meta key ${args.value} is not a valid type. Should be string, number, or boolean.`;
  }
}

const actionArgsErrors = new WeakMap<object, ValidationError[]>();
const conditionArgsErrors = new WeakMap<object, ValidationError[]>();

export const getActionArgsChildErrors = (value: any) => actionArgsErrors.get(value);
export const getConditionArgsChildErrors = (value: any) => conditionArgsErrors.get(value);

@ValidatorConstraint({ name: 'isValidActionId', async: false })
export class IsValidActionId implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return manager.services.action.actions.has(value);
  }
  defaultMessage(args: ValidationArguments) {
    return `The action ID ${args.value} does not exist.`;
  }
}

@ValidatorConstraint({ name: 'isValidActionArgs', async: true })
export class IsValidActionArgs implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const object: ActionValidator = args.object as ActionValidator;
    if (!object?.id) return true;

    const action = manager.services.action.actions.get(object.id);
    if (!action) return true;

    actionArgsErrors.delete(value);

    if (action.argumentsValidator) {
      const config = plainToInstance(action.argumentsValidator, value);
      const errors = await validate(config, {
        validationError: { target: false },
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      });

      if (errors.length > 0) {
        actionArgsErrors.set(value, errors);
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const object: ActionValidator = args.object as ActionValidator;
    return `Invalid action arguments for action ${object?.id ?? '(unknown)'}:`;
  }
}

@ValidatorConstraint({ name: 'isValidConditionId', async: false })
export class IsValidConditionId implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return manager.services.condition.conditions.has(String(value).replace('!', ''));
  }
  defaultMessage(args: ValidationArguments) {
    return `The condition ID ${args.value} does not exist.`;
  }
}

@ValidatorConstraint({ name: 'isValidConditionArgs', async: true })
export class IsValidConditionArgs implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const object: ConditionValidator = args.object as ConditionValidator;
    if (!object?.id) return true;

    const condition = manager.services.condition.conditions.get(object.id);
    if (!condition) return true;

    conditionArgsErrors.delete(value);

    if (condition.argumentsValidator) {
      const config = plainToInstance(condition.argumentsValidator, value);
      const errors = await validate(config, {
        validationError: { target: false },
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      });

      if (errors.length > 0) {
        conditionArgsErrors.set(value, errors);
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const object: ConditionValidator = args.object as ConditionValidator;
    return `Invalid condition arguments for condition ${object?.id ?? '(unknown)'}:`;
  }
}