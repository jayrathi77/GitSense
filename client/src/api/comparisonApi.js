import axiosInstance from './axiosInstance';

export const compareProfiles = async (usernameA, usernameB) => {
  const response = await axiosInstance.post('/comparison', { usernameA, usernameB });
  return response.data;
};

export default { compareProfiles };
