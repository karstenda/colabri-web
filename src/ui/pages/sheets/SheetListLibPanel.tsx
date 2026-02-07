import Tabs from '@mui/material/Tabs';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { useLibraries } from '../../hooks/useLibraries/useLibraries';
import Tab from '@mui/material/Tab';
import { useCallback, useEffect, useState } from 'react';
import SheetsGrid from '../../components/SheetsOverview/SheetsOverview';
import Box from '@mui/material/Box';
import { DocumentType } from '../../../api/ColabriAPI';
import { useTranslation } from 'react-i18next';

export type SheetLibListPanelProps = {};

const SheetLibListPanel = ({}: SheetLibListPanelProps) => {
  const organization = useOrganization();
  const { t } = useTranslation();
  const { libraries } = useLibraries(
    organization?.id || '',
    organization !== undefined,
  );

  // Only work with sheet libraries
  const sheetLibraries = libraries.filter(
    (lib) => lib.type === DocumentType.DocumentTypeColabSheet,
  );

  const [activeLibraryId, setActiveLibraryId] = useState<string | null>(null);

  const activeLibrary = sheetLibraries.find(
    (lib) => lib.id === activeLibraryId,
  );

  const handleLibChange = useCallback((libraryId: string) => {
    setActiveLibraryId(libraryId);
  }, []);

  useEffect(() => {
    if (!activeLibraryId && sheetLibraries.length > 0) {
      setActiveLibraryId(sheetLibraries[0].id);
    }
  }, [activeLibraryId, sheetLibraries]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        gap: '16px',
      }}
    >
      {sheetLibraries && sheetLibraries.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            flexGrow: 0,
            borderBottom: 1,
            borderColor: 'divider',
            minWidth: '100px',
            justifyContent: 'left',
          }}
        >
          <Tabs
            value={activeLibraryId}
            onChange={(event, newValue) => handleLibChange(newValue)}
            aria-label="Sheet Libraries Tabs"
          >
            {sheetLibraries.map((library, index) => (
              <Tab
                id={'tab-' + library.id}
                aria-controls={'tabpanel-' + library.id}
                label={
                  library.name
                    .toLocaleLowerCase()
                    .endsWith(t('common.library').toLocaleLowerCase())
                    ? library.name
                    : library.name + ' ' + t('common.library')
                }
                value={library.id}
              />
            ))}
          </Tabs>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        {activeLibrary && (
          <SheetsGrid
            showSheetActions={false}
            scope={{
              type: 'lib',
              libraryId: activeLibrary ? activeLibrary.id : undefined,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default SheetLibListPanel;
