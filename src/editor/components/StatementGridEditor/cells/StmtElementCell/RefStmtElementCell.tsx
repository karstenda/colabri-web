import { LoroMap } from 'loro-crdt';
import { StmtDocSchema } from '../../../../data/ColabDoc';
import {
  ConnectedSheetDoc,
  ConnectedStmtDoc,
} from '../../../../data/ConnectedColabDoc';
import { LoroDocType } from 'loro-prosemirror';
import { useColabDoc } from '../../../../context/ColabDocContext/ColabDocProvider';
import CellWrapper from '../CellWrapper';
import { Box, Skeleton } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetActiveStatementElement } from '../../../../context/ColabDocEditorContext/ColabDocEditorProvider';
import { ColabApprovalState } from '../../../../../api/ColabriAPI';
import StmtElementAddCell from './StmtElementAddCell';
import StmtElementEditCell from './StmtElementEditCell';
import {
  useActiveCell,
  useStatementGridEditorReadOnly,
} from '../../context/StatementGridEditorContextProvider';

export type RefStmtCellProps = {
  field: string;
  rowId: string;
  langCode: string;
};

const RefStmtElementCell = (props: RefStmtCellProps) => {
  const { t } = useTranslation();
  const setActiveStatementElement = useSetActiveStatementElement();
  const readOnly = useStatementGridEditorReadOnly();
  const activeCell = useActiveCell();
  const hasFocus =
    activeCell?.field === props.field && activeCell?.rowId === props.rowId;

  // The connected document
  const { colabDoc } = useColabDoc();
  if (colabDoc && !(colabDoc instanceof ConnectedStmtDoc)) {
    throw new Error(
      'RefStmtElementCell can only be used within connected statement documents.',
    );
  }

  // Get the LoroDoc, controller, and ephStoreMgr
  const loroDoc = colabDoc?.getLoroDoc();
  const controller = colabDoc?.getDocController();
  const ephStoreMgr = colabDoc?.getEphStoreMgr();

  // Get the containerId for the textElement of the targeted statement language
  const langElement = controller?.getContentMap().get(props.langCode);

  let isLoading = false;
  let isNotAdded = false;
  let isNotFound = false;
  let isError = false;

  if (!loroDoc || !ephStoreMgr || !colabDoc || !controller) {
    isLoading = true;
  } else if (!langElement) {
    isNotAdded = true;
  }

  // Get the container ID for the text element
  const textElementMap = langElement?.get('textElement');
  const textElementContainerId = textElementMap?.id;
  if (!textElementContainerId && !isNotAdded) {
    isError = true;
  }

  // Create state to track edit permissions and approval state
  const [canEdit, setCanEdit] = useState(false);
  const [approvalState, setApprovalState] = useState(ColabApprovalState.Draft);

  // Use an effect to keep the edit and approval states updated
  useEffect(() => {
    if (isNotAdded || isNotFound || isError || !controller) {
      return;
    }

    setCanEdit(controller.canEditStatementElement(props.langCode));
    setApprovalState(controller.getStatementElementState(props.langCode));

    const unsubscribeAcl = controller.subscribeToStatementElementAclChanges(
      props.langCode,
      () => {
        setCanEdit(controller.canEditStatementElement(props.langCode));
      },
    );

    const unsubscribeApproval =
      controller.subscribeToStatementElementApprovalChanges(
        props.langCode,
        () => {
          setApprovalState(controller.getStatementElementState(props.langCode));
          setCanEdit(controller.canEditStatementElement(props.langCode));
        },
      );

    return () => {
      unsubscribeAcl();
      unsubscribeApproval();
    };
  }, [controller, props.langCode, isNotAdded, isNotFound, isError]);

  // Use an effect to make sure the active statement element is set correctly
  useEffect(() => {
    if (!loroDoc || !colabDoc) {
      return;
    }

    if (hasFocus) {
      setActiveStatementElement({
        langCode: props.langCode,
        colabDoc: colabDoc,
      });
    } else {
      setActiveStatementElement((current) => {
        if (
          current?.colabDoc.getDocId() === colabDoc.getDocId() &&
          current?.langCode === props.langCode
        ) {
          return null;
        }
        return current;
      });
    }

    // Cleanup: reset active statement element only if this cell is still the active one
    // This prevents a race condition where a new cell sets itself as active before
    // the previous cell's cleanup runs
    return () => {
      if (hasFocus) {
        setActiveStatementElement((current) => {
          if (
            current?.colabDoc.getDocId() === colabDoc.getDocId() &&
            current?.langCode === props.langCode
          ) {
            return null;
          }
          return current;
        });
      }
    };
  }, [hasFocus, loroDoc, colabDoc, setActiveStatementElement, props.langCode]);

  const handleLanguageAdd = useCallback(() => {
    controller?.addLanguage(props.langCode);
    controller?.commit();
  }, [controller, props.langCode]);

  if (isLoading) {
    return (
      <CellWrapper hasFocus={hasFocus}>
        <Skeleton variant="rectangular" width="100%" height={40} />
      </CellWrapper>
    );
  } else if (isNotAdded) {
    return (
      <StmtElementAddCell
        controller={controller}
        hasFocus={hasFocus}
        onAdd={handleLanguageAdd}
        readOnly={readOnly}
      />
    );
    ``;
  } else if (isNotFound) {
    return (
      <CellWrapper hasFocus={hasFocus}>
        <Box sx={{ opacity: 0.5 }}>{t('common.na')}</Box>
      </CellWrapper>
    );
  } else if (isError) {
    return (
      <CellWrapper hasFocus={hasFocus}>
        <Box sx={{ opacity: 0.5 }}>{t('common.error')}</Box>
      </CellWrapper>
    );
  } else {
    return (
      <StmtElementEditCell
        loroDoc={loroDoc as any as LoroDocType}
        ephStoreMgr={ephStoreMgr!}
        textElementContainerId={textElementContainerId!}
        canEdit={canEdit && !readOnly}
        approvalState={approvalState}
        hasFocus={hasFocus}
        langCode={props.langCode}
      />
    );
  }
};

export default RefStmtElementCell;
