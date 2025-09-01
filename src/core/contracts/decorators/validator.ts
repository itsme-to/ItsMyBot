import manager, { ActionValidator } from '@itsmybot';
import Utils from '@utils';
import { validate, ValidationArguments, ValidatorConstraintInterface, ValidatorConstraint } from 'class-validator';
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

@ValidatorConstraint({ name: 'isValidConditionId', async: false })
export class IsValidConditionId implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return manager.services.condition.conditions.has(value.replace('!', ''));
  }

  defaultMessage(args: ValidationArguments) {
    return `The condition ID ${args.value} is not valid.`;
  }
}


@ValidatorConstraint({ name: 'isValidActionId', async: false })
export class IsValidActionId implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return manager.services.action.actions.has(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `The action ID ${args.value} is not valid.`;
  }
}

const isValidActionArgsErrors = new Map<string, string>();

@ValidatorConstraint({ name: 'isValidActionArgs', async: false })
export class IsValidActionArgs implements ValidatorConstraintInterface {
  errors: string[] = [];

  async validate(value: any, args: ValidationArguments) {
    const object: ActionValidator = args.object as ActionValidator;
    if (!object.id) return true;

    const action = manager.services.action.actions.get(object.id);
    if (!action) return true;

    if (action.argumentsValidator) {
      const config = plainToInstance(action.argumentsValidator, value);
      const errors = await validate(config, { validationError: { target: false }, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true });
      if (errors.length > 0) {
        const lines = Utils.formatValidationErrors(errors);
        isValidActionArgsErrors.set(object.id, `Invalid action arguments for action ${object.id}:\n  - ${lines.join('\n  - ')}`);
        return false;
      }
    }

    isValidActionArgsErrors.delete(object.id);
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const object: ActionValidator = args.object as ActionValidator;
    return isValidActionArgsErrors.get(object.id) || '';
  }
}