export * from './register-user.use-case';
export * from './get-user-profile.use-case';
export * from './update-user-profile.use-case';
export * from './change-user-password.use-case';
export * from './delete-user-account.use-case';

import { RegisterUserUseCase } from './register-user.use-case';
import { GetUserProfileUseCase } from './get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './update-user-profile.use-case';
import { ChangeUserPasswordUseCase } from './change-user-password.use-case';
import { DeleteUserAccountUseCase } from './delete-user-account.use-case';

export const UseCases = [
  RegisterUserUseCase,
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
  ChangeUserPasswordUseCase,
  DeleteUserAccountUseCase,
];
