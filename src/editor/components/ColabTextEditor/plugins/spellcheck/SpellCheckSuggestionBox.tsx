import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  IconButton,
  Button,
  Box,
  Stack,
  ClickAwayListener,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

export interface SpellCheckSuggestionBoxProps {
  error: {
    msg: string;
    replacements?: { value: string }[];
  };
  position: {
    x: number;
    y: number;
  };
  onReplace: (value: string) => void;
  onIgnore: () => void;
  onClose: () => void;
  readOnly?: boolean;
}

export const SpellCheckSuggestionBox: React.FC<
  SpellCheckSuggestionBoxProps
> = ({ error, position, onReplace, onIgnore, onClose, readOnly }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
  };

  const handleReplace = (value: string) => {
    onReplace(value);
  };

  const handleIgnore = () => {
    onIgnore();
  };

  return (
    <Box>
      <ClickAwayListener onClickAway={handleClose}>
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            zIndex: 50,
            left: position.x,
            top: position.y,
            p: 2,
            maxWidth: 320,
            borderRadius: 1,
            backgroundColor: 'background.paper',
            borderColor: theme.palette.divider,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1}
          >
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ alignSelf: 'center', paddingRight: 2 }}
            >
              {error.msg}
            </Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              aria-label={t('common.close')}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {error.replacements && error.replacements.length > 0 ? (
              error.replacements.slice(0, 3).map((replacement, index) => (
                <Button
                  key={index}
                  variant="contained"
                  size="small"
                  onClick={() => handleReplace(replacement.value)}
                  disabled={readOnly}
                >
                  {replacement.value}
                </Button>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                {t('spellcheck.noReplacements')}
              </Typography>
            )}
            {!readOnly && (
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={handleIgnore}
              >
                {t('spellcheck.ignore')}
              </Button>
            )}
          </Stack>
        </Paper>
      </ClickAwayListener>
    </Box>
  );
};
