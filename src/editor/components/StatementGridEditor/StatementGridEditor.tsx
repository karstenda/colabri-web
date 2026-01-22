import StatementGridEditorContextProvider from './context/StatementGridEditorContextProvider';
import StatementGridEditorTable, {
  StatementGridEditorTableProps,
} from './StatementGridEditorTable';

export type StatementGridEditorProps = {} & StatementGridEditorTableProps;

const StatementGridEditor: React.FC<StatementGridEditorProps> = (props) => {
  return (
    <StatementGridEditorContextProvider>
      <StatementGridEditorTable {...props} />
    </StatementGridEditorContextProvider>
  );
};

export default StatementGridEditor;
