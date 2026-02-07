import React from 'react';
import ColabDocEditor from '../../../editor/components/ColabDocEditor/ColabDocEditor';
import { useParams } from 'react-router';
import { ConnectedColabDocProvider } from '../../../editor/context/ColabDocContext/ConnectedColabDocProvider';

const ColabDocEditorPage: React.FC = () => {
  // Get the docId from params
  const { docId } = useParams();

  if (!docId) {
    return <div>No document ID provided.</div>;
  } else {
    return (
      <ConnectedColabDocProvider docId={docId}>
        <ColabDocEditor />
      </ConnectedColabDocProvider>
    );
  }
};

export default ColabDocEditorPage;
