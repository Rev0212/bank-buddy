/**
 * Simple auth check for the hackathon demo
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get user from localStorage 
 * @returns {Object|null} User object or null
 */
export const getUser = () => {
  try {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error parsing user data', error);
    return null;
  }
};

/**
 * Check if user is admin
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};