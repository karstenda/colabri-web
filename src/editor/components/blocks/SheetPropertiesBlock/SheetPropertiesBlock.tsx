import { useEffect, useState } from 'react';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { ConnectedSheetDoc, FrozenSheetDoc } from '../../../data/ColabDoc';
import DocEditorSheetBlock from '../DocEditorBlock/DocEditorSheetBlock';
import { SheetPropertiesBlockBP } from './SheetPropertiesBlockBP';
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
import { LanguageSelector } from '../../../../ui/components/LanguageSelector';
import { useOrganization } from '../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ContentLanguage } from '../../../data/ContentLanguage';
import { LoroList } from 'loro-crdt';

export type SheetPropertiesBlockProps = {
  bp: SheetPropertiesBlockBP;
};

const SheetPropertiesBlock: React.FC<SheetPropertiesBlockProps> = ({ bp }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const organization = useOrganization();

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
      showManageControls={false}
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
          sx={{
            paddingTop: '16px',
            marginTop: '16px',
            marginBottom: '16px',
            width: '100%',
          }}
        >
          <FormGroup>
            <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                <ColabFieldEditor
                  parentContainerId={propertiesContainerId!}
                  fieldName="langCodes"
                  docController={controller!}
                  toLoroValue={(langs: ContentLanguage[]) => {
                    const loroList = new LoroList<string>();
                    for (const lang of langs) {
                      loroList.push(lang.code);
                    }
                    return loroList;
                  }}
                  fromLoroValue={(loroList: LoroList<string>) => {
                    const langCodes: string[] = [];
                    for (let i = 0; i < loroList.length; i++) {
                      langCodes.push(loroList.get(i));
                    }
                    return langCodes;
                  }}
                  inputSlot={LanguageSelector}
                  inputSlotProps={{
                    orgId: organization?.id,
                    scope: 'organization',
                    multiple: true,
                    label: t('languages.title'),
                    disabled: !canManage || bp.readOnly,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                <ColabFieldEditor
                  parentContainerId={propertiesContainerId!}
                  fieldName="masterLangCode"
                  docController={controller!}
                  toLoroValue={(langs: ContentLanguage[] | ContentLanguage) => {
                    if (Array.isArray(langs) && langs.length > 0) {
                      return langs[0].code;
                    } else if (!Array.isArray(langs) && langs) {
                      return langs.code;
                    }
                    return undefined;
                  }}
                  fromLoroValue={(loroValue: string) => {
                    const langCodes: string[] = [];
                    langCodes.push(loroValue);
                    return langCodes;
                  }}
                  inputSlot={LanguageSelector}
                  inputSlotProps={{
                    orgId: organization?.id,
                    scope: 'organization',
                    multiple: false,
                    label: t('languages.masterLanguage'),
                    disabled: !canManage || bp.readOnly,
                    filterOptions: (options: ContentLanguage[]) => {
                      const filteredOptions: ContentLanguage[] = [];
                      const sheetLangCodesLoroList = controller.getFieldValue(
                        propertiesContainerId,
                        'langCodes',
                      ) as LoroList<string>;
                      for (let i = 0; i < sheetLangCodesLoroList.length; i++) {
                        const code = sheetLangCodesLoroList.get(i);
                        const sheetLang = options.find(
                          (opt) => opt.code === code,
                        );
                        if (sheetLang) {
                          filteredOptions.push(sheetLang);
                        }
                      }
                      return filteredOptions;
                    },
                  }}
                />
              </Grid>
            </Grid>
          </FormGroup>
        </Box>
      </Stack>
    </DocEditorSheetBlock>
  );
};

export default SheetPropertiesBlock;
