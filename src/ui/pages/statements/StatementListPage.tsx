import Box from '@mui/material/Box';
import PageContainer from '../../components/MainLayout/PageContainer';
import StatementsGrid from '../../components/StatementsGrid';

export default function StatementListPage() {

  const pageTitle = 'Statements';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        <StatementsGrid editable={true} />
      </Box>
    </PageContainer>
  );
}
