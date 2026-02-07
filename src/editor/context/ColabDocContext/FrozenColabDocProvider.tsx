import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  ColabLoroDoc,
  SheetLoroDoc,
  StmtLoroDoc,
} from '../../data/ColabLoroDoc';
import { ColabDoc, FrozenSheetDoc, FrozenStmtDoc } from '../../data/ColabDoc';
import {
  useOrgUserId,
  useOrganization,
  usePrpls,
} from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import ColabDocContext, { ColabDocContextType } from './ColabDocContext';
import { useDocument } from '../../../ui/hooks/useDocuments/useDocuments';
import {
  DocumentType,
  SheetDocument,
  StatementDocument,
} from '../../../api/ColabriAPI';
import { LoroDoc, PeerID, VersionVector } from 'loro-crdt';
import SheetDocController from '../../controllers/SheetDocController';
import StatementDocController from '../../controllers/StatementDocController';

export type FrozenColabDocProviderProps = {
  docId: string;
  version: number;
  versionV: Map<string, number>;
  children: React.ReactNode;
};

export function FrozenColabDocProvider({
  docId,
  version,
  versionV,
  children,
}: FrozenColabDocProviderProps) {
  // Fetch the user and organization
  const org = useOrganization();
  const userId = useOrgUserId();
  const authPrpls = usePrpls();

  // Fetch the targeted document
  const { document } = useDocument(
    org?.id || '',
    docId || '',
    org != null && docId != null,
  );

  // The connected doc state.
  const [colabDoc, setColabDoc] = useState<ColabDoc<ColabLoroDoc> | null>(null);

  // The potential error state.
  const [error, setError] = useState<Error | null>(null);

  // Cleanup on unmount only
  useEffect(() => {
    if (!document || !org || !userId || !authPrpls) {
      return;
    }

    // If it's a sheet document, we create a frozen sheet doc
    if (document.type === DocumentType.DocumentTypeColabSheet) {
      const loroDoc = new LoroDoc() as SheetLoroDoc;
      const docSheetController = new SheetDocController(
        loroDoc,
        org.id,
        document.owner,
        userId,
        new Set(authPrpls),
      );
      const colabSheetDoc = new FrozenSheetDoc(
        loroDoc,
        docSheetController,
        document as SheetDocument,
        version,
        new VersionVector(versionV as Map<PeerID, number>),
      );
      setColabDoc(colabSheetDoc);
    }
    // If it's a statement document, we create a frozen statement doc
    else if (document.type === DocumentType.DocumentTypeColabStatement) {
      const loroDoc = new LoroDoc() as StmtLoroDoc;
      const docStmtController = new StatementDocController(
        loroDoc,
        org.id,
        document.owner,
        userId,
        new Set(authPrpls),
      );
      const colabStmtDoc = new FrozenStmtDoc(
        loroDoc,
        docStmtController,
        document as StatementDocument,
        version,
        new VersionVector(versionV as Map<PeerID, number>),
      );
      setColabDoc(colabStmtDoc);
    }
  }, [document, org, userId, authPrpls]);

  return (
    <ColabDocContext.Provider value={{ docId, colabDoc, error }}>
      {children}
    </ColabDocContext.Provider>
  );
}
