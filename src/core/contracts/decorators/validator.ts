import Utils from '@utils';
import { ValidationArguments, ValidatorConstraintInterface, ValidatorConstraint } from 'class-validator';

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