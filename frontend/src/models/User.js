export function toUser(data) {
  return {
    userId: Number(data.userId),
    name: data.name || '',
    email: data.email || '',
    role: data.role || 'User',
  };
}
