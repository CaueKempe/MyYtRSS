import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://192.168.200.35:5001/api', 
});

api.interceptors.request.use((config) => {
  const profileId = localStorage.getItem('RSS_profile_id');
  
  if (profileId) {
    config.headers['x-profile-id'] = profileId;
  }
  
  return config;
});