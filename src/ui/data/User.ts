export type UserProfile = {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
};

export function getUserDisplayName(user: UserProfile): string {
  if (
    !user.firstName ||
    user.firstName.trim() === '' ||
    !user.lastName ||
    user.lastName.trim() === ''
  ) {
    return user.email;
  } else {
    return `${user.firstName} ${user.lastName}`;
  }
}
