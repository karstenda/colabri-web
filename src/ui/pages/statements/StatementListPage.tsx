import Box from '@mui/material/Box';
import PageContainer from '../../components/MainLayout/PageContainer';
import StatementsOverview from '../../components/StatementsOverview';
import { useTranslation } from 'react-i18next';
import StatementLibListPanel from './StatementLibListPanel';
import StatementMyListPanel from './StatementMyListPanel';
import StatementSharedListPanel from './StatementSharedListPanel';

export type StatementListPageProps = {
  scope?: 'my' | 'shared' | 'lib';
};

export default function StatementListPage({ scope }: StatementListPageProps) {
  const { t } = useTranslation();

  let pageTitle = t('statements.title');
  if (scope === 'my') {
    pageTitle = t('statements.myStatements');
  } else if (scope === 'shared') {
    pageTitle = t('statements.sharedStatements');
  } else if (scope === 'lib') {
    pageTitle = t('statements.libraryStatements');
  } else {
    scope = 'my';
    pageTitle = t('statements.myStatements');
  }

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: t('statements.title') }]}
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {scope == 'my' && <StatementMyListPanel />}
        {scope == 'shared' && <StatementSharedListPanel />}
        {scope == 'lib' && <StatementLibListPanel />}
      </Box>
    </PageContainer>
  );
}
