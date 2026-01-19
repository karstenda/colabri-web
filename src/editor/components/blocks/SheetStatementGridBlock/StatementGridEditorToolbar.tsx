import { useTranslation } from 'react-i18next';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import Button from '@mui/material/Button';
import { GridSlotProps, Toolbar } from '@mui/x-data-grid';
import { styled, useTheme } from '@mui/material/styles';
import OutlinedColabTextEditor from '../../ColabTextEditor/ColabTextEditorOutlined';
import { useEffect } from 'react';
import { ContainerID, LoroDoc } from 'loro-crdt';
import { LoroDocType } from 'loro-prosemirror';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type StatementGridEditorToolbarProps = {
  titleContainerId?: ContainerID;
  showOutlines?: boolean;
  canAdd?: boolean;
  canManage?: boolean;
  handleStatementAdd?: () => Promise<void>;
} & GridSlotProps['toolbar'];

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  backgroundColor: 'transparent',
  minHeight: '73px',
}));

export const ToolbarWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  flexGrow: 1,
  width: '100%',
  padding: '10px',
}));

export const ToolbarLeft = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 0,
}));

export const ToolbarRight = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StatementGridEditorToolbar = ({
  titleContainerId,
  showOutlines,
  canManage,
  canAdd,
  handleStatementAdd,
  ...props
}: StatementGridEditorToolbarProps) => {
  const { colabDoc } = useColabDoc();
  const { t } = useTranslation();
  const theme = useTheme();

  const loroDoc = colabDoc?.getLoroDoc();
  const ephStoreMgr = colabDoc?.getEphStoreMgr();

  const showTitleEditor =
    titleContainerId != null &&
    loroDoc != undefined &&
    ephStoreMgr != undefined;

  const readOnly = !canManage && !canAdd;

  useEffect(() => {}, [colabDoc]);

  return (
    <StyledToolbar
      {...props}
      sx={{
        backgroundColor: !readOnly
          ? (theme.vars || theme).palette.background.default
          : (theme.vars || theme).palette.background.paper,
      }}
    >
      <ToolbarWrapper>
        <ToolbarLeft>
          {showTitleEditor && (
            <Typography variant="h6" component="div" sx={{ width: '100%' }}>
              <OutlinedColabTextEditor
                showOutlines={showOutlines}
                loro={loroDoc as any as LoroDocType}
                ephStoreMgr={ephStoreMgr}
                containerId={titleContainerId}
                spellCheck={{
                  enabled: false,
                  supported: false,
                  orgId: '',
                  langCode: undefined,
                }}
                schema="simple"
              />
            </Typography>
          )}
        </ToolbarLeft>

        <ToolbarRight>
          {(canAdd || canManage) && (
            <Button onClick={handleStatementAdd}>
              {t('editor.sheetStatementGridBlock.addButton')}
            </Button>
          )}
        </ToolbarRight>
      </ToolbarWrapper>
    </StyledToolbar>
  );
};

export default StatementGridEditorToolbar;
