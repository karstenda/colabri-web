import { useEffect, useMemo, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { Organization } from '../../../../api/ColabriAPI';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { useNavigate } from 'react-router';

export type OrgPickerProps = {
  orgs: Organization[];
  selectedOrg?: Organization | null;
  onSelect?: (org: Organization | null) => void;
  label?: string;
  helperText?: string;
};

const OrgPicker = ({
  orgs,
  selectedOrg = null,
  onSelect,
  label = 'Select organization',
  helperText,
}: OrgPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const [value, setValue] = useState<Organization | null>(selectedOrg);

  useEffect(() => {
    setValue(selectedOrg ?? null);
  }, [selectedOrg]);

  const options = useMemo(
    () =>
      [...orgs].sort((a, b) => {
        const aLabel =
          a.name?.toLocaleLowerCase() ?? a.id?.toLocaleLowerCase() ?? '';
        const bLabel =
          b.name?.toLocaleLowerCase() ?? b.id?.toLocaleLowerCase() ?? '';
        return aLabel.localeCompare(bLabel);
      }),
    [orgs],
  );

  const getLabel = (option: Organization) =>
    option.name ?? option.id ?? 'Unknown organization';
  const getIdentity = (option?: Organization | null) =>
    option?.id ?? option?.name ?? '';

  const onPicked = (org: Organization | null) => {
    setValue(org);
    if (onSelect) {
      onSelect(org);
    } else if (org) {
      navigate(`/org/${org.id}`);
    }
  };

  return (
    <Paper
      sx={{
        display: 'flex',
        justifyContent: 'center', // Centers horizontally
        alignItems: 'center', // Centers vertically
        padding: theme.spacing(2),
        minWidth: 350,
        maxWidth: 500,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4">
          {t('onboarding.orgPickerPromptTitle')}
        </Typography>
        <Typography variant="body2">
          {t('onboarding.orgPickerPrompt')}
        </Typography>
        <Autocomplete
          options={options}
          value={value}
          onChange={(_event, newValue) => {
            onPicked(newValue ?? null);
          }}
          getOptionLabel={getLabel}
          isOptionEqualToValue={(option, val) =>
            getIdentity(option) === getIdentity(val)
          }
          autoHighlight
          fullWidth={true}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={
                options.length
                  ? 'Start typing to search...'
                  : 'No organizations available'
              }
              helperText={helperText}
            />
          )}
        />
      </Stack>
    </Paper>
  );
};

export default OrgPicker;
