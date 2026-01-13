import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function usePreferences<T>(key: string) {
  const queryClient = useQueryClient();
  const profileId = localStorage.getItem('RSS_profile_id');

  const isValidProfile = !!profileId && profileId !== 'null' && profileId !== 'undefined';

  const { data, isLoading } = useQuery<T>({
    queryKey: ['preference', key, profileId],
    queryFn: async () => {
      if (!isValidProfile) return null; 
      const res = await api.get(`/preferences/${profileId}/${key}`);
      return res.data; 
    },
    staleTime: 1000 * 60 * 5,
    enabled: isValidProfile, 
  });

  const mutation = useMutation({
    mutationFn: async (newValue: T) => {
      if (!isValidProfile) return;
      await api.post(`/preferences/${profileId}/${key}`, { value: newValue });
    },
    onSuccess: (newValue) => {
      if (isValidProfile) {
        queryClient.setQueryData(['preference', key, profileId], newValue);
      }
    }
  });

  return {
    preferences: data,
    isLoading,
    savePreferences: mutation.mutate, 
  };
}