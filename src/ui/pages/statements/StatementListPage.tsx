import Box from '@mui/material/Box';
import PageContainer from '../../components/MainLayout/PageContainer';
import StatementsGrid from '../../components/StatementsGrid';
import { useTranslation } from 'react-i18next';

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
  }

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: t('statements.title') }]}
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        <StatementsGrid editable={true} scope={scope} />
      </Box>
    </PageContainer>
  );
}
