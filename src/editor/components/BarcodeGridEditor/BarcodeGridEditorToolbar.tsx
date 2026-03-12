import { useTranslation } from 'react-i18next';
import { GridSlotProps } from '@mui/x-data-grid';
import { ContainerID } from 'loro-crdt';
import ColabGridEditorToolbar from '../ColabGridEditor/ColabGridEditorToolbar';

export type BarcodeGridEditorToolbarProps = {
  blockContainerId?: ContainerID;
  titleContainerId?: ContainerID;
  showOutlines?: boolean;
  canAdd?: boolean;
  canManage?: boolean;
  readOnly?: boolean;
  handleBarcodeAdd?: () => Promise<void>;
} & GridSlotProps['toolbar'];

const BarcodeGridEditorToolbar = ({
  handleBarcodeAdd,
  ...props
}: BarcodeGridEditorToolbarProps) => {
  const { t } = useTranslation();

  return (
    <ColabGridEditorToolbar
      {...props}
      handleAdd={handleBarcodeAdd}
      addButtonLabel={t('editor.sheetBarcodeGridBlock.addButton')}
    />
  );
};

export default BarcodeGridEditorToolbar;
