import { Stack } from '@mui/material';
import { ToolbarButton, ToolbarMenuDivider } from './ToolbarMenuStyles';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { useEffect, useRef, useState } from 'react';
import { AddLanguageModal } from '../AddLanguageModal';
import { useContentLanguages } from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { OrgContentLanguage } from '../../../api/ColabriAPI';
import { LoroMap } from 'loro-crdt';

export type StatementMenuProps = {};

export default function StatementMenu({}: StatementMenuProps) {
  // Get the document
  const { colabDoc } = useColabDoc();

  // State to control the Add Language modal
  const [isAddLanguageModalOpen, setAddLanguageModalOpen] = useState(false);

  // Get the current organization
  const organization = useOrganization();

  // Get the languages in the organization
  const { languages } = useContentLanguages(organization?.id);

  // The refs to control menu state
  const showMenuRef = useRef<boolean>(false);
  const disabled = useRef<boolean>(true);
  const addedLanguagesRef = useRef<OrgContentLanguage[]>([]);

  const loroDoc = colabDoc?.loroDoc;

  // When the colabDoc is loaded.
  useEffect(() => {
    if (!colabDoc && !loroDoc) {
      return;
    }

    // Check the document type
    const type = loroDoc?.getMap('properties')?.get('type');
    if (type === 'colab-statement') {
      // Enable the menu
      showMenuRef.current = true;
      disabled.current = false;
    }
  }, [colabDoc, loroDoc]);

  // Handle the opening of the Add Language modal
  const handleAddLanguageClicked = () => {
    // Figure out the existing languages
    const langCodes = loroDoc?.getMap('content')?.keys();

    // Map them to language objects
    const existingLanguages = languages.filter((lang) =>
      langCodes?.includes(lang.code),
    );
    addedLanguagesRef.current = existingLanguages;

    // Show the modal
    setAddLanguageModalOpen(true);
  };

  // Add the new languages to the loroDoc
  const handleAddLanguage = (languages: OrgContentLanguage[]) => {
    // Iterate over the languages
    languages.forEach((lang) => {
      // Add the language to the loroDoc content map
      const contentMap = loroDoc?.getMap('content');
      if (!contentMap) {
        console.error('Could not find content map in loroDoc');
        return;
      }

      // Create it in the loroDoc if it doesn't exist
      const stmtElementMap = contentMap.getOrCreateContainer(
        lang.code,
        new LoroMap(),
      );
      const textElementMap = stmtElementMap.getOrCreateContainer(
        'textElement',
        new LoroMap(),
      );
      textElementMap.set('nodeName', 'doc');
      loroDoc?.commit();
    });
  };

  if (showMenuRef.current === false) {
    return <></>;
  } else {
    return (
      <Stack direction="row" spacing={'2px'}>
        <ToolbarMenuDivider />
        <ToolbarButton
          disabled={disabled.current}
          onClick={handleAddLanguageClicked}
        >
          Add Language
        </ToolbarButton>
        <AddLanguageModal
          open={isAddLanguageModalOpen}
          onClose={() => setAddLanguageModalOpen(false)}
          existingLanguages={addedLanguagesRef.current}
          onAdd={handleAddLanguage}
        />
      </Stack>
    );
  }
}
