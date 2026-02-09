import { GridRow, GridRowProps } from '@mui/x-data-grid/components';
import { StatementGridRowType } from '../../../../api/ColabriAPI';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { ConnectedSheetDoc, FrozenSheetDoc } from '../../../data/ColabDoc';
import { ConnectedColabDocProvider } from '../../../context/ColabDocContext/ConnectedColabDocProvider';
import { FrozenColabDocProvider } from '../../../context/ColabDocContext/FrozenColabDocProvider';

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

    // Figure out if this is a frozen reference or a connected reference
    if (stmtRef.version != undefined && stmtRef.versionV !== undefined) {
      return (
        <FrozenColabDocProvider
          docId={stmtRef.docId}
          version={stmtRef.version}
          versionV={stmtRef.versionV}
        >
          <GridRow {...props} />
        </FrozenColabDocProvider>
      );
    }
    // It's a live updating reference, so we wrap it in a connected provider
    else {
      return (
        <ConnectedColabDocProvider docId={stmtRef.docId}>
          <GridRow {...props} />
        </ConnectedColabDocProvider>
      );
    }
  } else {
    return <></>;
  }
};

export default StatementGridEditorRow;
