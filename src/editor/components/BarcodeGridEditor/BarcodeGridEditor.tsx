import ColabGridEditorContextProvider from '../ColabGridEditor/context/ColabGridEditorContextProvider';
import BarcodeGridEditorTable, {
  BarcodeGridEditorTableProps,
} from './BarcodeGridEditorTable';

export type BarcodeGridEditorProps = {} & BarcodeGridEditorTableProps;

const BarcodeGridEditor: React.FC<BarcodeGridEditorProps> = (props) => {
  return (
    <ColabGridEditorContextProvider readOnly={props.readOnly}>
      <BarcodeGridEditorTable {...props} />
    </ColabGridEditorContextProvider>
  );
};

export default BarcodeGridEditor;
