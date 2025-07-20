export * from './register-user.command';
export * from './register-user.handler';
export * from './update-user.command';
export * from './update-user.handler';
export * from './delete-user.command';
export * from './delete-user.handler';
export * from './change-password.command';
export * from './change-password.handler';

import { RegisterUserCommandHandler } from './register-user.handler';
import { UpdateUserCommandHandler } from './update-user.handler';
import { DeleteUserCommandHandler } from './delete-user.handler';
import { ChangePasswordCommandHandler } from './change-password.handler';

export const CommandHandlers = [
  RegisterUserCommandHandler,
  UpdateUserCommandHandler,
  DeleteUserCommandHandler,
  ChangePasswordCommandHandler,
];
