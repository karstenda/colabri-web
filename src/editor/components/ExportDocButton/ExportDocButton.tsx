import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CodeIcon from '@mui/icons-material/Code';
import MSWordIcon from '../icons/MSWordIcon';
import { useTranslation } from 'react-i18next';
import { DocumentType } from '../../../api/ColabriAPI';
import ExportDocGS1XMLModal, {
  ExportDocGS1XMLModalPayload,
} from '../ExportDocGS1XMLModal/ExportDocGS1XMLModal';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { useDialogs } from '../../../ui/hooks/useDialogs/useDialogs';
import { ConnectedSheetDoc } from '../../data/ColabDoc';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '8px',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: (theme.vars || theme).palette.text.secondary,
        marginRight: theme.spacing(1.5),
        ...theme.applyStyles('dark', {
          color: 'inherit',
        }),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles('dark', {
      color: (theme.vars || theme).palette.grey[300],
    }),
  },
}));

export type ExportDocButtonProps = {
  docType: DocumentType;
};

export default function ExportDocButton({ docType }: ExportDocButtonProps) {
  const { t } = useTranslation();
  const { colabDoc } = useColabDoc();
  const dialogs = useDialogs();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportGS1XML = async () => {
    if (!colabDoc || !(colabDoc instanceof ConnectedSheetDoc)) {
      return;
    }

    // Open the modal to manage the statement element
    await dialogs.open<ExportDocGS1XMLModalPayload, void>(
      ExportDocGS1XMLModal,
      {
        sheetDoc: colabDoc,
      },
    );

    // Close the menu
    handleClose();
  };

  return (
    <div>
      <Button
        id="export-doc-button"
        size="small"
        aria-controls={open ? 'export-doc-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        color="secondary"
        sx={{
          padding: '6px',
          height: '26px',
        }}
      >
        {t('editor.exportDocButton.export')}
      </Button>
      <StyledMenu
        id="export-doc-menu"
        slotProps={{
          list: {
            'aria-labelledby': 'export-doc-button',
          },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {docType == DocumentType.DocumentTypeColabSheet && (
          <MenuItem onClick={handleExportGS1XML} disableRipple>
            <CodeIcon />
            {t('editor.exportDocButton.exportGS1XML')}
          </MenuItem>
        )}
        <MenuItem onClick={handleClose} disableRipple disabled>
          <MSWordIcon />
          {t('editor.exportDocButton.exportWord')}
        </MenuItem>
      </StyledMenu>
    </div>
  );
}
