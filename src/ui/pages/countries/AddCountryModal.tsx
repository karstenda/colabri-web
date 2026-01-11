import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { DialogProps } from '../../hooks/useDialogs/useDialogs';
import { CountrySelector } from '../../components/CountrySelector';
import type { PlatformCountry } from '../../../api/ColabriAPI';

export interface AddCountryModalPayload {
  orgId: string;
}

export interface AddCountryModalProps
  extends DialogProps<AddCountryModalPayload, string[]> {}

export function AddCountryModal({ open, onClose }: AddCountryModalProps) {
  const { t } = useTranslation();
  const [selectedCountries, setSelectedCountries] = React.useState<
    PlatformCountry[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  const handleCancel = async () => {
    await onClose([]);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const countryCodes = selectedCountries
        .map((country) => country.code)
        .filter((code): code is string => !!code);
      await onClose(countryCodes);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (
    value: string | string[] | PlatformCountry | PlatformCountry[] | null,
  ) => {
    if (Array.isArray(value)) {
      const countries = value.filter(
        (item): item is PlatformCountry =>
          typeof item === 'object' && item !== null && 'code' in item,
      );
      setSelectedCountries(countries);
    } else {
      setSelectedCountries([]);
    }
  };

  const isConfirmDisabled = selectedCountries.length === 0;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t('countries.addModal.title')}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('countries.addModal.description')}
          </Typography>

          <CountrySelector
            scope="platform"
            multiple
            value={selectedCountries}
            onChange={handleSelectionChange}
            label={t('countries.addModal.selectLabel')}
            placeholder={t('countries.addModal.selectPlaceholder')}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || isConfirmDisabled}
        >
          {t('countries.addModal.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddCountryModal;
