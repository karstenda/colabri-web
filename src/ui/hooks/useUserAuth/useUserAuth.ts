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
      if (!response.ok) {
        let payload;
        try {
          payload = await response.json();
        } catch (e) {
          throw {
            code: response.status,
            status: response.statusText,
            error: 'Request failed',
          };
        }
        throw payload;
      } else {
        const payload = await response.json();
        return payload as UserAuth;
      }
    },
    retry: false,
  });
  return { userAuth: data, isLoading, error };
};
