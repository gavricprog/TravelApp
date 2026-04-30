/**
 * @typedef {Object} User
 * @property {number} userId
 * @property {string} email
 * @property {'User' | 'Admin'} role
 */

export function toUser(data) {
  return {
    userId: Number(data.userId),
    email: data.email || '',
    role: data.role || 'User',
  };
}
