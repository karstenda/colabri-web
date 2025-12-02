import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import {
  LanguageSelector,
  LanguageOption,
} from '../../../ui/components/LanguageSelector/LanguageSelector';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import type { OrgContentLanguage } from '../../../api/ColabriAPI';

interface AddLanguageModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback when the modal is closed
   */
  onClose: () => void;

  /**
   * Languages that are already added to the document
   */
  existingLanguages: OrgContentLanguage[];

  /**
   * Callback when languages are added
   * @param languages - The newly selected languages to add
   */
  onAdd: (languages: OrgContentLanguage[]) => void;
}

export const AddLanguageModal: React.FC<AddLanguageModalProps> = ({
  open,
  onClose,
  existingLanguages,
  onAdd,
}) => {
  const organization = useOrganization();
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageOption[]>(
    [],
  );

  // Get codes of existing languages to filter them out
  const existingLanguageCodes = existingLanguages.map((lang) => lang.code);

  // Filter available options to exclude already added languages
  const filterOptions = (options: LanguageOption[]) => {
    return options.filter(
      (option) => option.code && !existingLanguageCodes.includes(option.code),
    );
  };

  const handleAdd = () => {
    if (selectedLanguages.length > 0) {
      onAdd(selectedLanguages as OrgContentLanguage[]);
      setSelectedLanguages([]);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedLanguages([]);
    onClose();
  };

  const handleChange = (
    value: string | string[] | LanguageOption | LanguageOption[] | null,
  ) => {
    if (Array.isArray(value)) {
      // Filter out string values and keep only LanguageOption objects
      const languageOptions = value.filter(
        (item): item is LanguageOption => typeof item !== 'string',
      );
      setSelectedLanguages(languageOptions);
    } else {
      setSelectedLanguages([]);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Add Languages to Document</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <LanguageSelector
            scope="organization"
            orgId={organization?.id}
            multiple={true}
            value={selectedLanguages}
            onChange={handleChange}
            label="Select Languages"
            placeholder="Choose one or more languages to add"
            filterOptions={filterOptions}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={selectedLanguages.length === 0}
        >
          Add{' '}
          {selectedLanguages.length > 0 ? `(${selectedLanguages.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLanguageModal;
