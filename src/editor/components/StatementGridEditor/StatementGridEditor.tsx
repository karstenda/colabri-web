import ColabGridEditorContextProvider from '../ColabGridEditor/context/ColabGridEditorContextProvider';
import StatementGridEditorTable, {
  StatementGridEditorTableProps,
} from './StatementGridEditorTable';

export type StatementGridEditorProps = {} & StatementGridEditorTableProps;

const StatementGridEditor: React.FC<StatementGridEditorProps> = (props) => {
  return (
    <ColabGridEditorContextProvider readOnly={props.readOnly}>
      <StatementGridEditorTable {...props} />
    </ColabGridEditorContextProvider>
  );
};

export default StatementGridEditor;
