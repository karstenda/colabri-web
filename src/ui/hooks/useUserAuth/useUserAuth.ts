import { useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationSettingKeys } from '../useOrganizationSettings/useOrganizationSettings';
import type {
  Organization,
  Group,
  OrganizationSetting,
} from '../../../api/ColabriAPI';
import { UserProfile } from '../../data/User';

type UserAuth = {
  uid: string;
  prpls: string[];
  orgs: {
    organization: Organization;
    userId: string;
    userGroups: Group[];
    userOrgSettings: OrganizationSetting[];
  }[];
  profile: UserProfile;
};

type UserAuthError = {
  code: number;
  status: string;
  error: string;
};

export const useUserAuth = () => {
  const queryClient = useQueryClient();
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

        const userAuth = payload as UserAuth;
        // Update the userOrgSettings in the tanstack cache so that they are available elsewhere
        userAuth.orgs.forEach((org) => {
          org.userOrgSettings.forEach((setting) => {
            queryClient.setQueryData(
              organizationSettingKeys.detail(
                org.organization.id,
                setting.type,
                setting.key,
              ),
              { data: setting },
            );
          });
        });

        return userAuth;
      }
    },
    retry: false,
  });
  return { userAuth: data, isLoading, error };
};
