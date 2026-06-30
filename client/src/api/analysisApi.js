import axiosInstance from './axiosInstance';

export const analyzeProfile = async (username) => {
  const response = await axiosInstance.post('/analysis', { username });
  return response.data;
};

export const getAnalysis = async (id) => {
  const response = await axiosInstance.get(`/analysis/${id}`);
  return response.data;
};

export const getHistory = async () => {
  const response = await axiosInstance.get('/history');
  return response.data;
};

export default { analyzeProfile, getAnalysis, getHistory };
