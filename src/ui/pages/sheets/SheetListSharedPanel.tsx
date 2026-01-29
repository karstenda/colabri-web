import SheetsOverview from '../../components/SheetsOverview/SheetsOverview';

const SheetSharedListPanel = () => {
  return <SheetsOverview scope={{ type: 'shared' }} showSheetActions={true} />;
};

export default SheetSharedListPanel;
