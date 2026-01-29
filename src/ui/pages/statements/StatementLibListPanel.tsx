import Tabs from '@mui/material/Tabs';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { useLibraries } from '../../hooks/useLibraries/useLibraries';
import Tab from '@mui/material/Tab';
import { useCallback, useEffect, useState } from 'react';
import StatementsGrid from '../../components/StatementsOverview/StatementsOverview';
import Box from '@mui/material/Box';
import { DocumentType } from '../../../api/ColabriAPI';

export type StatementLibListPanelProps = {};

const StatementLibListPanel = ({}: StatementLibListPanelProps) => {
  const organization = useOrganization();
  const { libraries, isLoading } = useLibraries(
    organization?.id || '',
    organization !== undefined,
  );

  // Only work with statement libraries
  const statementLibraries = libraries.filter(
    (lib) => lib.type === DocumentType.DocumentTypeColabStatement,
  );

  const [activeLibraryId, setActiveLibraryId] = useState<string | null>(null);

  const activeLibrary = statementLibraries.find(
    (lib) => lib.id === activeLibraryId,
  );

  const handleLibChange = useCallback((libraryId: string) => {
    setActiveLibraryId(libraryId);
  }, []);

  useEffect(() => {
    if (!activeLibraryId && statementLibraries.length > 0) {
      setActiveLibraryId(statementLibraries[0].id);
    }
  }, [activeLibraryId, statementLibraries]);

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
      {statementLibraries && statementLibraries.length > 1 && (
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
            aria-label="Statement Libraries Tabs"
          >
            {statementLibraries.map((library, index) => (
              <Tab
                id={'tab-' + library.id}
                aria-controls={'tabpanel-' + library.id}
                label={library.name}
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
          <StatementsGrid
            showStatementActions={false}
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

export default StatementLibListPanel;
