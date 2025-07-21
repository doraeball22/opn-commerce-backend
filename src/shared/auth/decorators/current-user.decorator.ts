import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUser, JwtPayload } from '../interfaces/current-user.interface';

/**
 * Custom decorator to extract the current authenticated user from the request
 * 
 * Usage examples:
 * 
 * 1. Get full user object:
 *    async getProfile(@CurrentUser() user: ICurrentUser) {
 *      return this.userService.findById(user.id);
 *    }
 * 
 * 2. Get specific property:
 *    async getOrders(@CurrentUser('id') userId: string) {
 *      return this.orderService.findByUserId(userId);
 *    }
 * 
 * @param data - Optional property name to extract from user object
 * @returns Current user object or specific property value
 */
export const CurrentUser = createParamDecorator(
  (data: keyof ICurrentUser | undefined, ctx: ExecutionContext): ICurrentUser | string | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    
    if (!user) {
      return null;
    }
    
    const currentUser: ICurrentUser = {
      id: user.sub, // JWT subject is the user ID
      email: user.email,
      name: user.name,
    };
    
    // If a specific property is requested, return just that property
    if (data) {
      return currentUser[data] || null;
    }
    
    // Otherwise return the full user object
    return currentUser;
  },
);