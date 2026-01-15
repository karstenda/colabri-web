import { TFunction } from 'i18next';

const getStmtNameColumn = (t: TFunction) => ({
  field: 'name',
  headerName: t('statements.columns.name'),
  width: 250,
  flex: 1,
  renderCell: () => <>Name</>,
});

export default getStmtNameColumn;
