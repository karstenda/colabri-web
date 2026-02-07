import { GridRow, GridRowProps } from '@mui/x-data-grid/components';
import { StatementGridRowType } from '../../../../api/ColabriAPI';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { ConnectedSheetDoc, FrozenSheetDoc } from '../../../data/ColabDoc';
import { ConnectedColabDocProvider } from '../../../context/ColabDocContext/ConnectedColabDocProvider';

const StatementGridEditorRow = (props: GridRowProps) => {
  const { colabDoc } = useColabDoc();

  if (
    !(colabDoc instanceof ConnectedSheetDoc) &&
    !(colabDoc instanceof FrozenSheetDoc)
  ) {
    throw new Error(
      'StatementGridEditorRow can only be used within sheet documents.',
    );
  }
  if (!colabDoc) {
    throw new Error(
      'StatementGridEditorRow must be used within a ColabDocProvider.',
    );
  }

  if (props.row.type == StatementGridRowType.StatementGridRowTypeLocal) {
    return <GridRow {...props} />;
  } else if (
    props.row.type == StatementGridRowType.StatementGridRowTypeReference
  ) {
    // Figure out the docId from the row
    const controller = colabDoc.getDocController();
    const stmtRef = controller.getStatementReference(props.row.id);

    return (
      <ConnectedColabDocProvider docId={stmtRef.docId}>
        <GridRow {...props} style={{ backgroundColor: '#f0f0f0' }} />
      </ConnectedColabDocProvider>
    );
  } else {
    return <></>;
  }
};

export default StatementGridEditorRow;
