import { BEZIER_COMMAND_CODES, isBezierCommand } from '@/common/PathData/helpers';
import { Command, CommandCodes } from '@/common/PathData/types';
import { includes } from 'lodash-es';

function lastCommandExists(commands: ReadonlyArray<Command>) {
  return !!commands.length;
}

// NOTE: if validation becomes more complicated, consider using fp-ts or other functional approach
type commandsValidator = (commands: ReadonlyArray<Command>) => void;
export const validateLastCommandExists: commandsValidator = (commands) => {
  if (!lastCommandExists(commands)) {
    throw new Error('expected last command to exist but instead found empty commands list');
  }
};
const validateLastCommandIsBezier: commandsValidator = (commands) => {
  validateLastCommandExists(commands);
  const lastCommand = commands[commands.length - 1];
  if (isBezierCommand(lastCommand)) {
    throw new Error(`expected last command to be a bezier (command code one of ${BEZIER_COMMAND_CODES
    }) but instead saw ${lastCommand.code}`);
  }
};
export const validatePushCommand = (commands: ReadonlyArray<Command>, newCommand: Command) => {
  if (newCommand.code !== CommandCodes.M) {
    validateLastCommandExists(commands);
  }
  if (includes([CommandCodes.T, CommandCodes.S], newCommand.code)) {
    validateLastCommandIsBezier(commands);
  }
};
