import React from 'react';
import { Chip, Avatar, useTheme } from '@mui/material';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import { CountryOption } from '../CountrySelector/CountrySelector';

export interface CountryChipProps {
  country: CountryOption;
  onDelete?: (event: any) => void;
  chipProps?: React.ComponentProps<typeof Chip>;
}

export default function CountryChip({
  country,
  onDelete,
  chipProps,
}: CountryChipProps) {
  const theme = useTheme();

  const { key, ...rest } = chipProps || {};
  return (
    <Chip
      label={country.name}
      key={key}
      sx={{
        '& .MuiChip-label': {
          fontWeight: 'normal',
        },
        ...rest?.sx,
      }}
      avatar={
        <Avatar
          sx={{
            marginLeft: '-1px !important',
            bgcolor: theme.palette.grey[400],
            width: 32,
            height: 32,
            '&.MuiChip-avatarSmall': {
              width: 24,
              height: 24,
              marginLeft: 0,
            },
          }}
        >
          <FlagCircleIcon fontSize="small" />
        </Avatar>
      }
      variant="outlined"
      size="small"
      onDelete={onDelete}
      {...rest}
    />
  );
}
