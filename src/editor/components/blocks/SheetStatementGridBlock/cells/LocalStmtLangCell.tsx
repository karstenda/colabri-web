import { LoroMap } from 'loro-crdt';
import { StmtDocSchema } from '../../../../data/ColabDoc';
import ColabTextEditor from '../../../ColabTextEditor/ColabTextEditor';
import { ConnectedSheetDoc } from '../../../../data/ConnectedColabDoc';
import { LoroDocType } from 'loro-prosemirror';
import { useColabDoc } from '../../../../context/ColabDocContext/ColabDocProvider';
import CellWrapper from './CellWrapper';
import { Box, Skeleton } from '@mui/material';

export type LocalStmtLangCellProps = {
  statement: LoroMap<StmtDocSchema>;
  langCode: string;
};

const LocalStmtLangCell = (props: LocalStmtLangCellProps) => {
  const { colabDoc } = useColabDoc();

  const loroDoc = colabDoc?.getLoroDoc();
  const ephStoreMgr = colabDoc?.getEphStoreMgr();

  // Get the containerId for the textElement of the targeted statement language
  const contentMap = props.statement.get('content');
  const langElement = contentMap.get(props.langCode);
  if (!langElement) {
    return (
      <CellWrapper>
        <Box sx={{ opacity: 0.5 }}>{`Not added`}</Box>
      </CellWrapper>
    );
  }
  const textElementMap = langElement.get('textElement');
  if (!textElementMap) {
    return (
      <CellWrapper>
        <Box
          sx={{ opacity: 0.5 }}
        >{`No text element found for language code ${props.langCode}`}</Box>
      </CellWrapper>
    );
  }

  const containerId = textElementMap.id;

  if (!loroDoc || !ephStoreMgr || !containerId) {
    return (
      <CellWrapper>
        <Skeleton variant="rectangular" width="100%" height={40} />
      </CellWrapper>
    );
  }
  return (
    <CellWrapper padding="0px">
      <ColabTextEditor
        loro={loroDoc as any as LoroDocType}
        ephStoreMgr={ephStoreMgr}
        containerId={containerId}
        canEdit={false}
        spellCheck={{
          enabled: false,
          supported: false,
          orgId: '',
          langCode: undefined,
        }}
      />
    </CellWrapper>
  );
};

export default LocalStmtLangCell;
