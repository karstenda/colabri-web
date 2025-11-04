
import { useQuery } from '@tanstack/react-query';
import type { Organization, Group } from '../../../api/ColabriAPI';

type UserAuth = {
    uid: string;
    prpls: string[];
    orgs: {
        organization: Organization;
        userId: string;
        userGroups: Group[];
    }[];
    profile: {
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    }
}

export const useUserAuth = () => {
   const {data, isLoading} = useQuery({
        queryKey: ['/auth/me'],
        queryFn: () => fetch('/auth/me').then(res => res.json()),
        select: (data) => data as UserAuth,
    });
   return { userAuth: data, isLoading };
}