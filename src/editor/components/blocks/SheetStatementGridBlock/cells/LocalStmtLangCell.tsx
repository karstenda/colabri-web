import { LoroMap } from 'loro-crdt';
import { StmtDocSchema } from '../../../../data/ColabDoc';
import ColabTextEditor from '../../../ColabTextEditor/ColabTextEditor';
import { ConnectedSheetDoc } from '../../../../data/ConnectedColabDoc';
import { LoroDocType } from 'loro-prosemirror';
import { useColabDoc } from '../../../../context/ColabDocContext/ColabDocProvider';

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
    return <>{`No content for language code ${props.langCode}`}</>;
  }
  const textElementMap = langElement.get('textElement');
  if (!textElementMap) {
    return <>{`No text element found for language code ${props.langCode}`}</>;
  }

  const containerId = textElementMap.id;

  if (!loroDoc || !ephStoreMgr || !containerId) {
    return <></>;
  }
  return (
    <>
      <ColabTextEditor
        loro={loroDoc as any as LoroDocType}
        ephStoreMgr={ephStoreMgr}
        containerId={containerId}
        spellCheck={{
          enabled: false,
          supported: false,
          orgId: '',
          langCode: undefined,
        }}
      />
    </>
  );
};

export default LocalStmtLangCell;
