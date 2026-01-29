import Button from '@mui/material/Button';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import StatementsOverview from '../../components/StatementsOverview';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';

const StatementMyListPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const organization = useOrganization();

  // When a statement is to be added
  const handleStatementCreate = useCallback(() => {
    navigate(`/org/${organization?.id}/statements/new`);
  }, [organization, navigate]);

  const renderTopActions = useCallback(() => {
    return (
      <>
        <Button
          variant="contained"
          onClick={handleStatementCreate}
          startIcon={<AddIcon />}
        >
          {t('common.create')}
        </Button>
      </>
    );
  }, [handleStatementCreate]);

  return (
    <StatementsOverview
      scope={{ type: 'my' }}
      renderTopActions={renderTopActions}
      showStatementActions={true}
    />
  );
};

export default StatementMyListPanel;
