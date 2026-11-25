import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import type { LoginDto, RegisterDto } from '../types/auth.dto';

export const AUTH_KEYS = {
  profile: ['auth', 'profile'] as const,
};

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: AUTH_KEYS.profile,
    queryFn: () => authService.getProfile(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginDto) => authService.login(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.profile, data.user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterDto) => authService.register(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.profile, data.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
