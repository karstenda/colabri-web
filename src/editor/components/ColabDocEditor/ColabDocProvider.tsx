import React, { useContext, useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import ColabDocContext, { ColabDocContextType } from './ColabDocContext';
import {
  ColabDocReceiveInitMessage,
  ColabDocReceiveMessage,
  ColabDocSendUpdateMessage,
} from '../../data/ColabDocMessage';
import { ColabDoc } from '../../data/ColabDoc';
import { useOrgUserId } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { ColabDocSendLoadMessage } from '../../data/ColabDocMessage';
import { LoroDoc } from 'loro-crdt';

export type ColabDocProviderProps = {
  docId: string;
  children: React.ReactNode;
};

export function ColabDocProvider({ docId, children }: ColabDocProviderProps) {
  const userId = useOrgUserId();

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    `ws://localhost:3000/ws/doc/${docId}`,
    {
      shouldReconnect: () => true,
    },
  );

  const [document, setDocument] = useState<ColabDoc | null>(null);
  const isReady = useRef(false);

  // Load initial document (via message or REST)
  useEffect(() => {
    if (!userId) return;

    console.log(
      'Requesting document load for docId:',
      docId,
      'userId:',
      userId,
    );
    const loadMessage: ColabDocSendLoadMessage = {
      type: 'load',
      peer: userId + '/p1',
      user: userId,
    };
    sendJsonMessage(loadMessage);
  }, [docId, userId]);

  // Handle incoming messages
  useEffect(() => {
    // Get the last message
    if (!lastJsonMessage) {
      return;
    }
    const msg = lastJsonMessage as ColabDocReceiveMessage;

    // Log the message for debugging
    console.log('Received message:', msg);

    switch (msg.type) {
      case 'init':
        const initMsg = msg as ColabDocReceiveInitMessage;

        // Deserialize the ColabDoc
        const loroDocBase64 = initMsg.colabDoc.loroDoc;
        const loroDocData = Uint8Array.from(atob(loroDocBase64), (c) =>
          c.charCodeAt(0),
        );
        const loroDoc = new LoroDoc();
        loroDoc.import(loroDocData);
        const colabDoc: ColabDoc = {
          ...initMsg.colabDoc,
          loroDoc: loroDoc,
        };

        // Set the document state
        setDocument(colabDoc);
        isReady.current = true;
        break;

      case 'update':
        // Make sure we're ready
        if (!isReady.current || !userId || !document) {
          return;
        }

        // Base64 decode the delta
        const delta = Uint8Array.from(atob(msg.delta), (c) => c.charCodeAt(0));

        // Apply the remote change
        document.loroDoc.import(delta);

        break;
    }
  }, [lastJsonMessage]);

  // Function to broadcast local edits
  const updateColabDoc = (delta: Uint8Array<ArrayBufferLike>) => {
    // Make sure we're ready
    if (!isReady.current || !userId || !document) {
      return;
    }

    // Base64 encode the delta
    const deltaBase64 = btoa(String.fromCharCode(...Array.from(delta)));

    // Generate the update message
    const msg: ColabDocSendUpdateMessage = {
      type: 'update',
      delta: deltaBase64,
      user: userId,
      peer: `${document.loroDoc.peerId}`,
    };

    // Send the message
    sendJsonMessage(msg);
  };

  return (
    <ColabDocContext.Provider
      value={{ docId, colabDoc: document, updateColabDoc }}
    >
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
      updateColabDoc: null,
    };
  } else {
    return colabDocContext;
  }
}
