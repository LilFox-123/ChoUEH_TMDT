const PUBLIC_USER_SELECT = 'name avatar rating createdAt';
const PRIVATE_USER_SELECT = '-password';

const sanitizePublicUser = (user) => {
  if (!user) return null;

  const source = typeof user.toObject === 'function' ? user.toObject() : user;

  return {
    displayName: source.name || '',
    avatar: source.avatar || '',
    rating: source.rating ?? 0,
    responseRate: source.responseRate ?? null,
    memberSince: source.createdAt || null
  };
};

const canViewPrivateUserProfile = (requestUser, targetUserId) => {
  if (!requestUser) return false;

  return requestUser.role === 'admin'
    || requestUser._id?.toString() === targetUserId?.toString();
};

module.exports = {
  PUBLIC_USER_SELECT,
  PRIVATE_USER_SELECT,
  sanitizePublicUser,
  canViewPrivateUserProfile
};
