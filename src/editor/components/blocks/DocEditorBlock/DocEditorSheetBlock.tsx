import { useTranslation } from 'react-i18next';
import { useDialogs } from '../../../../ui/hooks/useDialogs/useDialogs';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { ConnectedSheetDoc } from '../../../data/ConnectedColabDoc';
import DocEditorBlock, { DocEditorBlockProps } from './DocEditorBlock';
import ManageModal from '../../ManageModal/ManageModal';
import { ManageSheetBlockModalPayload } from '../../ManageModal/ManageModalPayloads';

export type DocEditorSheetBlockProps = {
  foo?: string;
} & DocEditorBlockProps;

const DocEditorSheetBlock: React.FC<DocEditorSheetBlockProps> = (props) => {
  const { foo, ...docEditorBlockProps } = props;

  // Get the dialogs hook
  const dialogs = useDialogs();
  const { t } = useTranslation();

  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();
  if (!(colabDoc instanceof ConnectedSheetDoc)) {
    throw new Error(
      'SheetTextBlock can only be used with connected sheet docs.',
    );
  }

  // Get the controller
  const controller = colabDoc?.getDocController();

  /**
   * Manage the selected block's permissions
   *
   * @returns
   */
  const handleManageBlock = async () => {
    if (!controller) {
      return;
    }

    // Open the modal to manage the statement element
    await dialogs.open<ManageSheetBlockModalPayload, void>(ManageModal, {
      type: 'sheet-block',
      title: t('editor.manageModal.blockTitle'),
      sheetDocController: controller,
      blockContainerId: docEditorBlockProps.loroContainerId,
      readOnly: docEditorBlockProps.readOnly,
    });
  };

  /**
   * Shift the block up or down
   *
   * @param direction
   * @returns
   */
  const handleShift = (direction: 'up' | 'down') => {
    if (!controller) {
      return;
    }
    // Shift the block
    const success = controller.shiftBlock(
      docEditorBlockProps.loroContainerId,
      direction,
    );
    if (success) {
      controller.commit();
    }
  };

  return (
    <DocEditorBlock
      {...docEditorBlockProps}
      showUpDownControls={true}
      onManageBlock={
        docEditorBlockProps.onManageBlock
          ? docEditorBlockProps.onManageBlock
          : handleManageBlock
      }
      onMoveUp={() => handleShift('up')}
      onMoveDown={() => handleShift('down')}
    />
  );
};

export default DocEditorSheetBlock;
