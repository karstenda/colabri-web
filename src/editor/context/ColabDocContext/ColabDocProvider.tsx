import React, { useContext, useEffect, useState, useRef } from 'react';
import { LoroWebsocketClient } from 'loro-websocket';
import { LoroAdaptor, LoroEphemeralAdaptor } from 'loro-adaptors/loro';
import {
  ColabLoroDoc,
  ConnectedColabDoc,
  StmtLoroDoc,
} from '../../data/ColabDoc';
import {
  useOrgUserId,
  useOrganization,
  useUserProfile,
} from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';

import ColabDocContext, { ColabDocContextType } from './ColabDocContext';

import { CrdtType } from 'loro-protocol';
import { useDocument } from '../../../ui/hooks/useDocuments/useDocuments';
import {
  ColabModelType,
  Document,
  Organization,
} from '../../../api/ColabriAPI';
import ColabEphemeralStoreManager from '../../components/ColabDocEditor/EphemeralStoreManager';
import { getUserDisplayName, UserProfile } from '../../../ui/data/User';

export type ColabDocProviderProps = {
  docId: string;
  children: React.ReactNode;
};

export function ColabDocProvider({ docId, children }: ColabDocProviderProps) {
  // Fetch the user and organization
  const org = useOrganization();
  const userId = useOrgUserId();
  const userProfile = useUserProfile();

  // Fetch the targeted document
  const { document } = useDocument(
    org?.id || '',
    docId || '',
    org != null && docId != null,
  );

  // A boolean to track whether we're connected or not.
  const connected = useRef<boolean>(false);
  const disconnectFnRef = useRef<(() => void) | null>(null);

  // The connected doc state.
  const [connectedDoc, setConnectedDoc] = useState<ConnectedColabDoc | null>(
    null,
  );

  // Load initial document (via message or REST)
  useEffect(() => {
    if (
      org === null ||
      document === undefined ||
      docId === undefined ||
      userId === null ||
      userProfile === null
    ) {
      return;
    }

    if (document.type !== ColabModelType.ColabModelStatementType) {
      return;
    }

    // Check if we're NOT currently connected, then connect once
    if (!connected.current) {
      connected.current = true;
      connect(docId, org, userId, userProfile).then((disconnectFn) => {
        disconnectFnRef.current = disconnectFn;
      });
    }
  }, [document, userId, userProfile]);

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
    org: Organization,
    userId: string,
    userProfile: UserProfile,
  ): Promise<() => void> {
    // Create the client
    const client = new LoroWebsocketClient({ url: 'ws://localhost:9001' });

    // Connect to the server
    await client.waitConnected();
    console.log('Client connected!');

    // Generate the room IDs
    const roomId = org?.id + '/' + docId;

    // Join rooms
    // --- Room 1: A Loro Document (%LOR) ---
    const docAdaptor = new LoroAdaptor();
    const docRoom = await client.join({
      roomId: roomId,
      crdtAdaptor: docAdaptor,
    });
    console.log('Connected to room ' + docId + '!');

    // --- Room 2: Ephemeral Presence (%EPH) on the SAME socket ---
    const ephAdaptor = new LoroEphemeralAdaptor();
    const presenceRoom = await client.join({
      roomId: roomId, // Can be the same room ID, but different magic bytes
      crdtAdaptor: ephAdaptor,
    });

    // Extract the loroDoc
    const loroDoc = docAdaptor.getDoc() as StmtLoroDoc;

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

    const newConnectedDoc: ConnectedColabDoc = {
      ...(document as Document),
      loroDoc: docAdaptor.getDoc() as ColabLoroDoc,
      ephStoreMgr: ephStoreMgr,
    };

    // Start broadcasting the user presence of this user
    const cancelBcUserPresence = ephStoreMgr.broadcastUserPresence();

    // Set the document state
    setConnectedDoc(newConnectedDoc);

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
    <ColabDocContext.Provider value={{ docId, colabDoc: connectedDoc }}>
      {children}
    </ColabDocContext.Provider>
  );
}

export function useColabDoc(): ColabDocContextType {
  const colabDocContext = useContext(ColabDocContext);
  if (!colabDocContext) {
    return {
      docId: null,
      colabDoc: null,
    };
  } else {
    return colabDocContext;
  }
}
