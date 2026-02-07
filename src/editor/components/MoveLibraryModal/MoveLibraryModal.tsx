import React, { useEffect, useMemo, useState } from 'react';
import { DialogProps } from '../../../ui/hooks/useDialogs/useDialogs';
import { useTranslation } from 'react-i18next';
import { ColabDoc } from '../../data/ColabDoc';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import {
  Library,
  useLibraries,
  useMoveToLibrary,
} from '../../../ui/hooks/useLibraries/useLibraries';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { Permission } from '../../../ui/data/Permission';
import { useUserAuth } from '../../../ui/hooks/useUserAuth/useUserAuth';
import { Menu, MenuItem, Select } from '@mui/material';
import { ColabLoroDoc } from '../../data/ColabLoroDoc';

export interface MoveLibraryModalPayload {
  doc: ColabDoc<ColabLoroDoc>;
}

export interface MoveLibraryModalProps
  extends DialogProps<MoveLibraryModalPayload, void> {}

export const MoveLibraryModal: React.FC<MoveLibraryModalProps> = ({
  open,
  onClose,
  payload,
}) => {
  const { t } = useTranslation();
  const organization = useOrganization();
  const { libraries } = useLibraries(organization?.id ?? '', !!organization);
  const { userAuth } = useUserAuth();
  const { moveToLibrary } = useMoveToLibrary(organization?.id ?? '');

  // State to track the active library selection
  const [activeLibrary, setActiveLibrary] = useState<Library | undefined>(
    undefined,
  );

  // Get the prpls required to manage the active library
  const activeLibraryManagePrpls = new Set<string>(
    activeLibrary?.acls[Permission.Manage] ?? [],
  );

  // Check if the user can manage the active library
  const userPrpls = new Set<string>(userAuth?.prpls ?? []);
  const canManageActiveLibrary = Array.from(activeLibraryManagePrpls).some(
    (item) => userPrpls.has(item),
  );

  // Filter out the libraries of the right document type
  const availableLibraries = useMemo(
    () => libraries.filter((lib) => lib.type === payload.doc.getDocType()),
    [libraries, payload.doc],
  );

  useEffect(() => {
    // Set the initial active library
    if (availableLibraries.length > 0) {
      setActiveLibrary(availableLibraries[0]);
    }
  }, [availableLibraries]);

  // Handle moving the document to the selected library
  const handleMoveToLibrary = () => {
    moveToLibrary({
      docId: payload.doc.getDocId(),
      libraryId: activeLibrary!.id,
    }).then(() => {
      onClose(undefined);
    });
  };

  const handleCreateLibraryRequest = () => {};

  const handleCancel = () => {
    onClose(undefined);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('editor.moveLibraryModal.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack direction={'row'} spacing={4}>
            <Select
              fullWidth
              value={activeLibrary?.id || ''}
              onChange={(e) => {
                const selectedLibrary = libraries.find(
                  (lib) => lib.id === e.target.value,
                );
                setActiveLibrary(selectedLibrary);
              }}
            >
              {availableLibraries.map((library) => (
                <MenuItem value={library.id} key={library.id}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        {canManageActiveLibrary && (
          <Button
            onClick={handleMoveToLibrary}
            disabled={!activeLibrary}
            variant="contained"
          >
            {t('libraries.moveToLibrary')}
          </Button>
        )}
        {!canManageActiveLibrary && (
          <Button
            onClick={handleCreateLibraryRequest}
            disabled={!activeLibrary}
            variant="contained"
          >
            {t('libraries.createLibraryRequest')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
