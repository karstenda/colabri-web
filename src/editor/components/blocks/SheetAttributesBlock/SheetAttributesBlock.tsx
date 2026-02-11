import { useEffect, useState } from 'react';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { ConnectedSheetDoc, FrozenSheetDoc } from '../../../data/ColabDoc';
import DocEditorSheetBlock from '../DocEditorBlock/DocEditorSheetBlock';
import {
  SheetTextBlockHeaderLeft,
  SheetTextBlockHeaderWrapper,
} from '../SheetTextBlock/SheetTextBlockStyle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import ColabFieldEditor from '../../ColabFieldEditor/ColabFieldEditor';
import Select from '@mui/material/Select';
import { SheetAttributesBlockBP } from './SheetAttributesBlockBP';

export type SheetAttributesBlockProps = {
  bp: SheetAttributesBlockBP;
};

const SheetAttributesBlock: React.FC<SheetAttributesBlockProps> = ({ bp }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();
  if (
    !(colabDoc instanceof ConnectedSheetDoc) &&
    !(colabDoc instanceof FrozenSheetDoc)
  ) {
    throw new Error('SheetPropertiesBlock can only be used with sheet docs.');
  }

  // The document controller
  const controller = colabDoc?.getDocController();
  const loroDoc = colabDoc?.getLoroDoc();
  const propertiesContainerId = loroDoc?.getMap('properties').id;

  // State to track whether the user can manage this statement element
  const [canManage, setCanManage] = useState<boolean>(
    controller ? controller.hasManageBlockPermission(bp.containerId) : false,
  );

  // State to track focus and hover
  const [focus, setFocus] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const showOutlines = (focus || isHovered) && canManage;

  useEffect(() => {
    if (controller && bp.containerId) {
      // Update the canEdit state
      setCanManage(controller.hasManagePermission());

      // Subscribe to ACL changes in the loroDoc
      const aclUnsubscribe = controller.subscribeToBlockAclChanges(
        bp.containerId,
        () => {
          // On any ACL change, update the canEdit state
          setCanManage(controller.hasManagePermission());
        },
      );

      // Cleanup subscriptions on unmount
      return () => {
        aclUnsubscribe();
      };
    }
  }, [controller, bp.containerId]);

  // Handle focus change from DocEditorBlock
  const handleFocusChange = (hasFocus: boolean) => {
    setFocus(hasFocus);
  };
  const handleHoverChange = (isHovered: boolean) => {
    setIsHovered(isHovered);
  };

  return (
    <DocEditorSheetBlock
      blockId={bp.id}
      blockType={'SheetPropertiesBlock'}
      loroContainerId={bp.containerId}
      colabDoc={colabDoc}
      onFocusChange={handleFocusChange}
      onHoverChange={handleHoverChange}
      showManageControls={true}
      editable={canManage}
      readOnly={bp.readOnly}
    >
      <Stack direction="column" spacing={0.5}>
        <Stack direction="row" spacing={1} flex={1}>
          <SheetTextBlockHeaderWrapper>
            <SheetTextBlockHeaderLeft>
              <Typography variant="h6">
                {t('editor.sheetPropertiesBlock.name')}
              </Typography>
            </SheetTextBlockHeaderLeft>
          </SheetTextBlockHeaderWrapper>
        </Stack>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ marginTop: '16px', marginBottom: '16px', width: '100%' }}
        >
          <FormGroup>
            <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}>
              <Divider
                orientation="horizontal"
                flexItem
                sx={{
                  width: '100%',
                  color: (theme.vars || theme).palette.grey[500],
                  marginBottom: '20px',
                }}
              >
                {t('products.form.details')}
              </Divider>
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
              <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex' }}></Grid>
            </Grid>
          </FormGroup>
        </Box>
      </Stack>
    </DocEditorSheetBlock>
  );
};

export default SheetAttributesBlock;
