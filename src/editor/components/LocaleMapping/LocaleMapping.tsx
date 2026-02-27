import { ContentLanguage } from '../../data/ContentLanguage';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { LanguageSelector } from '../../../ui/components/LanguageSelector';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import Box from '@mui/material/Box';

export type LocaleMappingProps = {
  languages: ContentLanguage[];
  initLocaleMap?: Record<number, ContentLanguage>;
  onChange?: (localeMap: Record<number, ContentLanguage>) => void;
};

export type LocaleEntry = {
  localeSequence: number | null;
  language: ContentLanguage | null;
};

const LocaleMapping = ({
  languages,
  initLocaleMap,
  onChange,
}: LocaleMappingProps) => {
  const { t } = useTranslation();
  const organization = useOrganization();
  const [localeMap, setLocaleMap] = useState<LocaleEntry[]>(
    initLocaleMap
      ? Object.entries(initLocaleMap).map(([key, value]) => ({
          localeSequence: parseInt(key, 10),
          language: value,
        }))
      : [],
  );

  const onLocaleChange = (value: string, index: number) => {
    // Parse as integer and validate that it's a positive integer or empty
    let numericValue: number | null = null;
    if (value !== '') {
      numericValue = parseInt(value, 10);
      if (isNaN(numericValue) || numericValue <= 0) {
        return; // Invalid input, ignore the change
      }
    }

    // Create the new locale mapping
    const newLocaleMap = [...localeMap];
    newLocaleMap[index] = {
      ...newLocaleMap[index],
      localeSequence: numericValue,
    };

    // Remove duplicate locale sequences
    for (let i = 0; i < newLocaleMap.length; i++) {
      const entry = newLocaleMap[i];
      if (entry.localeSequence === numericValue && i !== index) {
        newLocaleMap[i] = {
          ...entry,
          localeSequence: null,
        };
      }
    }

    // Set the new locale mapping
    setLocaleMap(newLocaleMap);

    // Call the onChange with the new mapping
    onChange?.(
      newLocaleMap.reduce(
        (acc, entry) => {
          if (entry.localeSequence !== null && entry.language) {
            acc[entry.localeSequence] = entry.language;
          }
          return acc;
        },
        {} as Record<number, ContentLanguage>,
      ),
    );
  };

  const onLanguageChange = (
    value: ContentLanguage | ContentLanguage[] | null,
    index: number,
  ) => {
    const language = Array.isArray(value) ? value[0] : value;
    const newLocaleMap = [...localeMap];
    newLocaleMap[index] = {
      ...newLocaleMap[index],
      language,
    };
    setLocaleMap(newLocaleMap);

    // Call the onChange with the new mapping
    onChange?.(
      newLocaleMap.reduce(
        (acc, entry) => {
          if (entry.localeSequence !== null && entry.language) {
            acc[entry.localeSequence] = entry.language;
          }
          return acc;
        },
        {} as Record<number, ContentLanguage>,
      ),
    );
  };

  return (
    <>
      <Table size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 100 }}>{t('languages.locale')}</TableCell>
            <TableCell>{t('languages.language')}</TableCell>
            <TableCell sx={{ width: 60 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {localeMap.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>
                <Box sx={{ marginTop: '-6px' }}>
                  <TextField
                    slotProps={{ htmlInput: { type: 'number' } }}
                    value={
                      entry.localeSequence !== null ? entry.localeSequence : ''
                    }
                    size="small"
                    onChange={(event) =>
                      onLocaleChange(event.target.value, index)
                    }
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ marginTop: '-6px' }}>
                  <LanguageSelector
                    scope="organization"
                    orgId={organization?.id}
                    multiple={false}
                    label={''}
                    onChange={(value) => onLanguageChange(value, index)}
                    filterOptions={(options) => {
                      // Filter out languages that are already mapped to other locales
                      // And limit them to the provided languages list
                      let allowedLanguageCodes = languages.map(
                        (lang) => lang.code,
                      );
                      localeMap.forEach((e) => {
                        if (e.localeSequence !== entry.localeSequence) {
                          allowedLanguageCodes = allowedLanguageCodes.filter(
                            (code) => code !== e.language?.code,
                          );
                        }
                      });
                      return options.filter((option) =>
                        allowedLanguageCodes.includes(option.code),
                      );
                    }}
                    value={entry.language}
                  />
                </Box>
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={() => {
                    const newLocaleMap = [...localeMap];
                    newLocaleMap.splice(index, 1);
                    setLocaleMap(newLocaleMap);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {localeMap.length < languages.length && (
            <TableRow>
              <TableCell colSpan={3}>
                <Button
                  onClick={() =>
                    setLocaleMap([
                      ...localeMap,
                      { localeSequence: null, language: null },
                    ])
                  }
                >
                  {t('languages.addLocale')}
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default LocaleMapping;
