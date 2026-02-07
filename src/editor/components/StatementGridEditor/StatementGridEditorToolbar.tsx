import { useTranslation } from 'react-i18next';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import Button from '@mui/material/Button';
import { GridSlotProps, Toolbar } from '@mui/x-data-grid';
import { styled, useTheme } from '@mui/material/styles';
import ColabTextEditorOutlined from '../ColabTextEditor/ColabTextEditorOutlined';
import { useEffect } from 'react';
import { ContainerID, LoroDoc } from 'loro-crdt';
import { LoroDocType } from 'loro-prosemirror';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ConnectedSheetDoc, FrozenSheetDoc } from '../../data/ColabDoc';

export type StatementGridEditorToolbarProps = {
  titleContainerId?: ContainerID;
  showOutlines?: boolean;
  canAdd?: boolean;
  canManage?: boolean;
  readOnly?: boolean;
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
  readOnly,
  handleStatementAdd,
  ...props
}: StatementGridEditorToolbarProps) => {
  const { colabDoc } = useColabDoc();
  const { t } = useTranslation();
  const theme = useTheme();

  if (
    !(colabDoc instanceof ConnectedSheetDoc) &&
    !(colabDoc instanceof FrozenSheetDoc)
  ) {
    throw new Error(
      'StatementGridEditorToolbar can only be used with sheet docs.',
    );
  }

  const loroDoc = colabDoc?.getLoroDoc();
  const ephStoreMgr = colabDoc?.getEphStoreMgr();

  const showTitleEditor =
    titleContainerId != null &&
    loroDoc != undefined &&
    ephStoreMgr != undefined;

  const showReadOnly = (!canManage && !canAdd) || readOnly;

  useEffect(() => {}, [colabDoc]);

  return (
    <StyledToolbar
      {...props}
      sx={{
        backgroundColor: !showReadOnly
          ? (theme.vars || theme).palette.background.default
          : (theme.vars || theme).palette.background.paper,
      }}
    >
      <ToolbarWrapper>
        <ToolbarLeft>
          {showTitleEditor && (
            <Typography variant="h6" component="div" sx={{ width: '100%' }}>
              <ColabTextEditorOutlined
                showOutlines={showOutlines && !readOnly}
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
                canEdit={canManage && !readOnly}
              />
            </Typography>
          )}
        </ToolbarLeft>

        <ToolbarRight>
          {(canAdd || canManage) && !readOnly && (
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
