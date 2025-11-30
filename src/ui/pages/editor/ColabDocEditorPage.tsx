import React from 'react';
import { ColabDocProvider } from '../../../editor/components/ColabDocEditor/ColabDocProvider';
import ColabDocEditor from '../../../editor/components/ColabDocEditor/ColabDocEditor';
import { useParams } from 'react-router';

const ColabDocEditorPage: React.FC = () => {
  // Get the docId from params
  const { docId } = useParams();

  if (!docId) {
    return <div>No document ID provided.</div>;
  } else {
    return (
      <ColabDocProvider docId={docId}>
        <ColabDocEditor />
      </ColabDocProvider>
    );
  }
};

export default ColabDocEditorPage;
