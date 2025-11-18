import React from 'react';
import { Chip, Avatar, useTheme } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { LanguageOption } from '../LanguageSelector/LanguageSelector';

export interface LanguageChipProps {
  /**
   * The language to display as a chip
   */
  language: LanguageOption;
  
  /**
   * Whether the chip is deletable (shows delete icon)
   */
  onDelete?: () => void;
  
  /**
   * Additional props to pass to the Chip component
   */
  chipProps?: React.ComponentProps<typeof Chip>;
}

export default function LanguageChip({
  language,
  onDelete,
  chipProps,
}: LanguageChipProps) {
  const theme = useTheme();

  return (
    <Chip
      label={language.name}
      sx={{
        '& .MuiChip-label': {
          fontWeight: 'normal',
        },
        ...chipProps?.sx,
      }}
      avatar={
          <Avatar sx={{
            marginLeft: 0,
            bgcolor: theme.palette.grey[400],
            width: 32,
            height: 32,
            '&.MuiChip-avatarSmall': {
              width: 24,
              height: 24,
              marginLeft: 0
            },
          }}>
            <LanguageIcon fontSize="small" />
          </Avatar>
      }
      variant={'outlined'}
      size={'small'}
      onDelete={onDelete}
      {...chipProps}
    />
  );
}