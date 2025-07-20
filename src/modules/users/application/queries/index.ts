export * from './get-user-profile.query';
export * from './get-user-profile.handler';

import { GetUserProfileQueryHandler } from './get-user-profile.handler';

export const QueryHandlers = [GetUserProfileQueryHandler];
