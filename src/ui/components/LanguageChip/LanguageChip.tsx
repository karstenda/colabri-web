import React from 'react';
import { Chip, Avatar, useTheme } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { ContentLanguage } from '../../../editor/data/ContentLanguage';

export interface LanguageChipProps {
  /**
   * The language to display as a chip
   */
  language: ContentLanguage;

  /**
   * Whether the chip is deletable (shows delete icon)
   */
  onDelete?: (event: any) => void;

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

  const { key, ...rest } = chipProps || {};
  return (
    <Chip
      label={language.name}
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
          <LanguageIcon fontSize="small" />
        </Avatar>
      }
      variant={'outlined'}
      size={'small'}
      onDelete={onDelete}
      {...rest}
    />
  );
}
