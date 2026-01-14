import Box from '@mui/material/Box';
import PageContainer from '../../components/MainLayout/PageContainer';
import SheetsGrid from '../../components/SheetsGrid/SheetsGrid';
import { useTranslation } from 'react-i18next';

export type SheetListPageProps = {
  scope?: 'my' | 'shared' | 'lib';
};

export default function SheetListPage({ scope }: SheetListPageProps) {
  const { t } = useTranslation();

  let pageTitle = t('sheets.title');
  if (scope === 'my') {
    pageTitle = t('sheets.mySheets');
  } else if (scope === 'shared') {
    pageTitle = t('sheets.sharedSheets');
  } else if (scope === 'lib') {
    pageTitle = t('sheets.librarySheets');
  }

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: t('sheets.title') }]}
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        <SheetsGrid editable={true} scope={scope} />
      </Box>
    </PageContainer>
  );
}
