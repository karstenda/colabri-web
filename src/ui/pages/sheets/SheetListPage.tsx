import Box from '@mui/material/Box';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useTranslation } from 'react-i18next';
import SheetLibListPanel from './SheetListLibPanel';
import SheetSharedListPanel from './SheetListSharedPanel';
import SheetMyListPanel from './SheetListMyPanel';

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
  } else {
    scope = 'my';
    pageTitle = t('sheets.mySheets');
  }

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: t('sheets.title') }]}
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {scope == 'my' && <SheetMyListPanel />}
        {scope == 'shared' && <SheetSharedListPanel />}
        {scope == 'lib' && <SheetLibListPanel />}
      </Box>
    </PageContainer>
  );
}
