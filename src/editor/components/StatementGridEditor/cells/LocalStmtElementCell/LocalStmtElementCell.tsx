import { LoroMap } from 'loro-crdt';
import { StmtDocSchema } from '../../../../data/ColabDoc';
import { ConnectedSheetDoc } from '../../../../data/ConnectedColabDoc';
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

export type LocalStmtEditCellProps = {
  field: string;
  rowId: string;
  statement: LoroMap<StmtDocSchema>;
  langCode: string;
};

const LocalStmtEditCell = (props: LocalStmtEditCellProps) => {
  const { t } = useTranslation();
  const setActiveStatementElement = useSetActiveStatementElement();
  const readOnly = useStatementGridEditorReadOnly();
  const activeCell = useActiveCell();
  const hasFocus =
    activeCell?.field === props.field && activeCell?.rowId === props.rowId;

  // The connected document
  const { colabDoc } = useColabDoc();
  if (colabDoc && !(colabDoc instanceof ConnectedSheetDoc)) {
    throw new Error(
      'LocalStmtLangCell can only be used within connected sheet documents.',
    );
  }

  // Get the LoroDoc, controller, and ephStoreMgr
  const loroDoc = colabDoc?.getLoroDoc();
  const controller = colabDoc?.getDocController();
  const ephStoreMgr = colabDoc?.getEphStoreMgr();
  const stmtController = controller?.getLocalStatementController(
    props.statement.id,
  );

  // Get the containerId for the textElement of the targeted statement language

  const contentMap = props.statement.get('content');
  const langElement = contentMap.get(props.langCode);

  let isLoading = false;
  let isNotAdded = false;
  let isNotFound = false;
  let isError = false;

  if (!loroDoc || !ephStoreMgr || !colabDoc || !stmtController) {
    isLoading = true;
  } else if (!langElement || !stmtController.isValid()) {
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
    if (!stmtController || isNotAdded || isNotFound || isError) {
      return;
    }

    setCanEdit(stmtController.canEditStatementElement(props.langCode));
    setApprovalState(stmtController.getStatementElementState(props.langCode));

    const unsubscribeAcl = stmtController.subscribeToStatementElementAclChanges(
      props.langCode,
      () => {
        setCanEdit(stmtController.canEditStatementElement(props.langCode));
      },
    );

    const unsubscribeApproval =
      stmtController.subscribeToStatementElementApprovalChanges(
        props.langCode,
        () => {
          setApprovalState(
            stmtController.getStatementElementState(props.langCode),
          );
          setCanEdit(stmtController.canEditStatementElement(props.langCode));
        },
      );

    return () => {
      unsubscribeAcl();
      unsubscribeApproval();
    };
  }, [stmtController, props.langCode, isNotAdded, isNotFound, isError]);

  // Use an effect to make sure the active statement element is set correctly
  useEffect(() => {
    if (!loroDoc || !colabDoc) {
      return;
    }

    if (hasFocus) {
      setActiveStatementElement({
        stmtContainerId: props.statement.id,
        langCode: props.langCode,
        colabDoc: colabDoc,
      });
    } else {
      setActiveStatementElement((current) => {
        if (
          current?.stmtContainerId === props.statement.id &&
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
            current?.stmtContainerId === props.statement.id &&
            current?.langCode === props.langCode
          ) {
            return null;
          }
          return current;
        });
      }
    };
  }, [
    hasFocus,
    loroDoc,
    colabDoc,
    setActiveStatementElement,
    props.statement.id,
    props.langCode,
  ]);

  const handleLanguageAdd = useCallback(() => {
    stmtController?.addLanguage(props.langCode);
    stmtController?.commit();
  }, [stmtController, props.langCode]);

  if (isLoading) {
    return (
      <CellWrapper hasFocus={hasFocus}>
        <Skeleton variant="rectangular" width="100%" height={40} />
      </CellWrapper>
    );
  } else if (isNotAdded) {
    return (
      <StmtElementAddCell
        controller={stmtController}
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

export default LocalStmtEditCell;
