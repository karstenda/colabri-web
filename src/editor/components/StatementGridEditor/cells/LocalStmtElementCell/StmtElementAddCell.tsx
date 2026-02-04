import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CellWrapper from '../CellWrapper';
import { useEffect, useState } from 'react';
import StatementDocController from '../../../../controllers/StatementDocController';
import StatementLocalController from '../../../../controllers/StatementLocalController';

export type StmtElementAddCellProps = {
  controller?: StatementDocController | StatementLocalController | null;
  hasFocus?: boolean;
  onAdd?: () => void;
  readOnly?: boolean;
};

const StmtElementAddCell = ({
  controller,
  hasFocus = false,
  onAdd,
  readOnly = false,
}: StmtElementAddCellProps) => {
  const { t } = useTranslation();

  const [hasHover, setHasHover] = useState(false);
  const [hasManage, setHasManage] = useState(false);
  const [hasAddRemove, setHasAddRemove] = useState(false);

  useEffect(() => {
    if (!controller) {
      setHasManage(false);
      setHasAddRemove(false);
      return;
    }
    setHasManage(controller.hasManagePermission());
    setHasAddRemove(controller.hasAddRemovePermission());
    return controller.subscribeToDocAclChanges(() => {
      setHasManage(controller.hasManagePermission());
      setHasAddRemove(controller.hasAddRemovePermission());
    });
  }, [controller]);

  return (
    <CellWrapper hasFocus={hasFocus}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%',
        }}
        onMouseEnter={() => setHasHover(true)}
        onMouseLeave={() => setHasHover(false)}
      >
        {hasHover && (hasManage || hasAddRemove) && (
          <Button
            sx={{
              height: '28px',
            }}
            onClick={onAdd}
            disabled={readOnly}
          >
            {t('languages.addLanguage')}
          </Button>
        )}
        {!hasHover && (hasManage || hasAddRemove) && (
          <Box sx={{ opacity: 0.5 }}>{t('languages.addLanguage')}</Box>
        )}
        {!(hasManage || hasAddRemove) && (
          <Box sx={{ opacity: 0.5 }}>{t('languages.noLanguage')}</Box>
        )}
      </Box>
    </CellWrapper>
  );
};

export default StmtElementAddCell;
