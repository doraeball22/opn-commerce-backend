/**
 * Interface representing the current authenticated user
 * This interface is used across all modules for consistent user data structure
 */
export interface ICurrentUser {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name (optional) */
  name?: string;
}

/**
 * JWT payload structure
 * Contains the essential user information encoded in the JWT token
 */
export interface JwtPayload {
  /** Subject (user ID) */
  sub: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** Token issued at timestamp */
  iat?: number;
  /** Token expiration timestamp */
  exp?: number;
}