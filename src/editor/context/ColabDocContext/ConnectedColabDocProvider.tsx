import React, { useContext, useEffect, useState, useRef } from 'react';
import { getDocServiceConnUrl } from '../../../utils/UrlUtils';
import { LoroWebsocketClient } from 'loro-websocket';
import { LoroAdaptor, LoroEphemeralAdaptor } from 'loro-adaptors/loro';
import {
  ColabLoroDoc,
  SheetLoroDoc,
  StmtLoroDoc,
} from '../../data/ColabLoroDoc';
import { ColabDoc, ConnectedSheetDoc } from '../../data/ColabDoc';
import {
  useOrgUserId,
  useOrganization,
  usePrpls,
  useUserProfile,
  useUserUid,
} from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { Document, SheetDocument } from '../../../api/ColabriAPI';

import ColabDocContext, { ColabDocContextType } from './ColabDocContext';

import { CrdtType } from 'loro-protocol';
import { useColabDocument } from '../../../ui/hooks/useDocuments/useDocuments';
import {
  DocumentType,
  Organization,
  StatementDocument,
} from '../../../api/ColabriAPI';
import ColabEphemeralStoreManager from '../../components/ColabDocEditor/EphemeralStoreManager';
import { getUserDisplayName, UserProfile } from '../../../ui/data/User';
import StatementDocController from '../../controllers/StatementDocController';
import { ConnectedStmtDoc } from '../../data/ColabDoc';
import SheetDocController from '../../controllers/SheetDocController';
import useNotifications from '../../../ui/hooks/useNotifications/useNotifications';

export type ConnectedColabDocProviderProps = {
  docId: string;
  children: React.ReactNode;
};

export function ConnectedColabDocProvider({
  docId,
  children,
}: ConnectedColabDocProviderProps) {
  // Fetch the user and organization
  const org = useOrganization();
  const userId = useOrgUserId();
  const userUid = useUserUid();
  const userProfile = useUserProfile();
  const authPrpls = usePrpls();

  // Fetch the targeted document
  const { document } = useColabDocument(
    org?.id || '',
    docId || '',
    org != null && docId != null,
  );

  // A boolean to track whether we're connected or not.
  const connected = useRef<boolean>(false);
  const disconnectFnRef = useRef<(() => void) | null>(null);

  // The connected doc state.
  const [colabDoc, setColabDoc] = useState<ColabDoc<ColabLoroDoc> | null>(null);

  // The potential error state.
  const [error, setError] = useState<Error | null>(null);

  // Load initial document (via message or REST)
  useEffect(() => {
    if (
      org === null ||
      document === undefined ||
      docId === undefined ||
      userUid === null ||
      userId === null ||
      userProfile === null
    ) {
      return;
    }

    if (
      document.type !== DocumentType.DocumentTypeColabStatement &&
      document.type !== DocumentType.DocumentTypeColabSheet
    ) {
      return;
    }

    // Check if we're NOT currently connected, then connect once
    if (!connected.current) {
      connected.current = true;
      connect(docId, document, userUid, org, userId, userProfile)
        .then((disconnectFn) => {
          disconnectFnRef.current = disconnectFn;
        })
        .catch((error) => {
          console.error('Error connecting to document:', error);
          setError(error as Error);
        });
    }
  }, [document, userId, userProfile, org, userUid, authPrpls]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (disconnectFnRef.current) {
        disconnectFnRef.current();
        connected.current = false;
      }
    };
  }, []);

  // The function to connect.
  const connect = async function (
    docId: string,
    document: Document,
    userUid: string,
    org: Organization,
    userId: string,
    userProfile: UserProfile,
  ): Promise<() => void> {
    // Generate the url to the doc service based on the current url.
    const docServiceUrl = getDocServiceConnUrl();

    // Create the client
    const client = new LoroWebsocketClient({
      url: docServiceUrl + '/' + org.id,
    });

    // Connect to the server
    await client.waitConnected();
    console.log('Client connected!');

    // Generate the room IDs
    const roomId = docId;

    // Join rooms
    // --- Room 1: A Loro Document (%LOR) ---
    const docAdaptor = new LoroAdaptor(undefined, {
      onUpdateError: (
        updates: Uint8Array[],
        errorCode: number,
        reason?: string,
      ) => {
        console.error('Loro Adaptor Update Error here:', errorCode, reason);
      },
    });
    const docRoom = await client.join({
      roomId: roomId,
      crdtAdaptor: docAdaptor,
      onStatusChange: (status) => {
        console.log('Document room status changed:', status);
      },
    });
    console.log('Connected to room ' + docId + '!');

    // --- Room 2: Ephemeral Presence (%EPH) on the SAME socket ---
    const ephAdaptor = new LoroEphemeralAdaptor();
    const presenceRoom = await client.join({
      roomId: roomId, // Can be the same room ID, but different magic bytes
      crdtAdaptor: ephAdaptor,
    });

    // Extract the loroDoc
    const loroDoc = docAdaptor.getDoc() as ColabLoroDoc;

    // Generate a random color for the user
    const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

    // Create the ephemeral store manager
    const ephStoreMgr = new ColabEphemeralStoreManager(
      ephAdaptor.getStore(),
      loroDoc.peerIdStr,
      {
        id: userId,
        name: getUserDisplayName(userProfile),
        avatar: userProfile?.avatarUrl,
        color: userColor,
      },
    );

    // Figure out what kind of document this.
    const loroDocProperties = loroDoc.getMap('properties');
    const docType = loroDocProperties.get('type');

    // Create the appropriate connected document
    let newConnectedDoc: ColabDoc<ColabLoroDoc>;
    if (docType === DocumentType.DocumentTypeColabStatement) {
      newConnectedDoc = new ConnectedStmtDoc(
        loroDoc as StmtLoroDoc,
        new StatementDocController(
          loroDoc as StmtLoroDoc,
          org.id,
          document.owner,
          userId,
          new Set(authPrpls),
        ),
        document as StatementDocument,
        ephStoreMgr,
      );
    } else if (docType === DocumentType.DocumentTypeColabSheet) {
      newConnectedDoc = new ConnectedSheetDoc(
        loroDoc as SheetLoroDoc,
        new SheetDocController(
          loroDoc as SheetLoroDoc,
          org.id,
          document.owner,
          userId,
          new Set(authPrpls),
        ),
        document as SheetDocument,
        ephStoreMgr,
      );
    }
    // An unsupported document type for now
    else {
      throw new Error('Unsupported document type: ' + docType);
    }

    // Start broadcasting the user presence of this user
    const cancelBcUserPresence = ephStoreMgr.broadcastUserPresence();

    // Set the document state
    setColabDoc(newConnectedDoc);

    // Return the disconnect function
    return () => {
      cancelBcUserPresence();
      presenceRoom.leave();
      docRoom.leave();
      docRoom.destroy();
      presenceRoom.destroy();
      client.cleanupRoom(docId, CrdtType.Loro);
      client.cleanupRoom(docId, CrdtType.LoroEphemeralStore);
      client.destroy();
    };
  };

  return (
    <ColabDocContext.Provider value={{ docId, colabDoc, error }}>
      {children}
    </ColabDocContext.Provider>
  );
}
