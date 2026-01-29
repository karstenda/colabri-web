import { useCallback } from 'react';
import SheetsOverview from '../../components/SheetsOverview/SheetsOverview';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import AddIcon from '@mui/icons-material/Add';

const SheetMyListPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const organization = useOrganization();

  // When a sheet is to be added
  const handleSheetCreate = useCallback(() => {
    navigate(`/org/${organization?.id}/sheets/new`);
  }, [organization, navigate]);

  const renderTopActions = useCallback(() => {
    return (
      <>
        <Button
          variant="contained"
          onClick={handleSheetCreate}
          startIcon={<AddIcon />}
        >
          {t('common.create')}
        </Button>
      </>
    );
  }, [handleSheetCreate]);

  return (
    <SheetsOverview
      scope={{ type: 'my' }}
      showSheetActions={true}
      renderTopActions={renderTopActions}
    />
  );
};

export default SheetMyListPanel;
