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
import ColabDocContext from './ColabDocContext';
import { useColabDocument } from '../../../ui/hooks/useDocuments/useDocuments';
import {
  DocumentType,
  SheetDocument,
  StatementDocument,
} from '../../../api/ColabriAPI';
import { LoroDoc, PeerID, VersionVector } from 'loro-crdt';
import SheetDocController from '../../controllers/SheetDocController';
import StatementDocController from '../../controllers/StatementDocController';
import { useStatementVersion } from '../../../ui/hooks/useStatements/useStatements';

export type FrozenColabDocProviderProps = {
  docId: string;
  version: number;
  versionV: Record<string, number>;
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
  const { document, isLoading: isDocumentLoading } = useColabDocument(
    org?.id || '',
    docId || '',
    org != null && docId != null,
  );

  // Fetch the targeted version of the document
  const loadedDocument =
    org != null && docId != null && !isDocumentLoading && document;
  const { binary: stmtBinary, error: stmtError } = useStatementVersion(
    org?.id || '',
    docId || '',
    version,
    versionV,
    loadedDocument && document.type === DocumentType.DocumentTypeColabStatement,
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
      // TODO
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
        new VersionVector(
          new Map(Object.entries(versionV) as [PeerID, number][]),
        ),
      );
      setColabDoc(colabSheetDoc);
    }
    // If it's a statement document, we create a frozen statement doc
    else if (document.type === DocumentType.DocumentTypeColabStatement) {
      // Base64 decoding of the binary statement content
      if (!stmtBinary) {
        return;
      }
      const decodedStmtBinary = Uint8Array.from(atob(stmtBinary), (c) =>
        c.charCodeAt(0),
      );

      // Construct the loroDoc
      const loroDoc = new LoroDoc() as StmtLoroDoc;
      loroDoc.import(decodedStmtBinary);

      // Create the doc controller
      const docStmtController = new StatementDocController(
        loroDoc,
        org.id,
        document.owner,
        userId,
        new Set(authPrpls),
      );

      // Create the frozen statement doc
      const colabStmtDoc = new FrozenStmtDoc(
        loroDoc,
        docStmtController,
        document as StatementDocument,
        version,
        new VersionVector(
          new Map(Object.entries(versionV) as [PeerID, number][]),
        ),
      );
      setColabDoc(colabStmtDoc);
    }
  }, [document, org, userId, authPrpls, stmtBinary]);

  return (
    <ColabDocContext.Provider value={{ docId, colabDoc, error }}>
      {children}
    </ColabDocContext.Provider>
  );
}
