import React from 'react';
import { useUserAuth } from '../../hooks/useUserAuth/useUserAuth';
import LoginPrompt from './login/LoginPrompt';
import OrgPicker from './orgpick/OrgPicker';
import { Organization } from '../../../api/ColabriAPI';
import { CircularProgress, Stack, styled, Toolbar } from '@mui/material';
import ErrorPrompt from './error/ErrorPrompt';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import MainFrame from '../../components/MainLayout/MainFrame';

const LandingPage: React.FC = () => {
  const { isLoading, userAuth, error } = useUserAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Figure out what to show
  const needsLogin = !isLoading && error?.code === 401;
  const needsError = !isLoading && error && error?.code !== 401;
  const needsOrgPick = !isLoading && userAuth && userAuth?.orgs?.length > 1;
  const needsOrgRedirect =
    !isLoading && userAuth && userAuth?.orgs?.length === 1;
  const needsTrial = !isLoading && userAuth && userAuth?.orgs?.length === 0;

  // Get all the organizations in an array
  const orgs: Organization[] = [];
  if (userAuth && userAuth.orgs) {
    userAuth.orgs.forEach((org) => {
      orgs.push(org.organization);
    });
  }

  // Redirect to the single organization if possible
  React.useEffect(() => {
    if (needsOrgRedirect && orgs[0]) {
      navigate(`/org/${orgs[0].id}`, { replace: true });
    }
  }, [needsOrgRedirect, orgs, navigate]);

  return (
    <MainFrame>
      {isLoading && <CircularProgress size="3rem" />}
      {needsLogin && <LoginPrompt />}
      {needsError && <ErrorPrompt msg={error?.error} />}
      {needsOrgPick && <OrgPicker orgs={orgs} />}
      {needsTrial && <ErrorPrompt msg={t('onboarding.noOrgsPromptTitle')} />}
    </MainFrame>
  );
};

export default LandingPage;
