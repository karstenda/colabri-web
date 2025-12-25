import { useQuery } from '@tanstack/react-query';
import type { Organization, Group } from '../../../api/ColabriAPI';
import { UserProfile } from '../../data/User';

type UserAuth = {
  uid: string;
  prpls: string[];
  orgs: {
    organization: Organization;
    userId: string;
    userGroups: Group[];
  }[];
  profile: UserProfile;
};

type UserAuthError = {
  code: number;
  status: string;
  error: string;
};

export const useUserAuth = () => {
  const { data, isLoading, error } = useQuery<UserAuth, UserAuthError>({
    queryKey: ['/auth/me'],
    queryFn: async () => {
      const response = await fetch('/auth/me');
      const payload = await response.json();
      if (!response.ok) {
        throw payload;
      }
      return payload as UserAuth;
    },
  });
  return { userAuth: data, isLoading, error };
};
