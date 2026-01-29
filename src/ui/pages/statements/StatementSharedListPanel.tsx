import StatementsOverview from '../../components/StatementsOverview/StatementsOverview';

const StatementSharedListPanel = () => {
  return (
    <StatementsOverview
      scope={{ type: 'shared' }}
      showStatementActions={true}
    />
  );
};

export default StatementSharedListPanel;
