import {
  EphemeralStore,
  EphemeralStoreEvent,
  Value,
  ContainerID,
} from 'loro-crdt';

type CursorEphemeralPayload = {
  anchor: Uint8Array | null;
  focus: Uint8Array | null;
  user: {
    name: string;
    color: string;
  } | null;
};

export type UserPresence = {
  name: string;
  color: string;
  id: string;
  avatar?: string;
};

/**
 * A wrapper around the EphemeralStore to manage presence syncing across multiple containers in the colabdoc.
 */
export default class EphemeralStoreManager {
  // The underlying ephemeral store that this manager wraps around.
  private ephemeralStore: EphemeralStore<Record<string, Value>>;

  // The peer ID of the local user
  private peerId: string;

  // The user presence object
  private userPresence: UserPresence;

  // Constructor
  constructor(
    ephemeralStore: EphemeralStore<Record<string, Value>>,
    peerId: string,
    userPresence: UserPresence,
  ) {
    this.ephemeralStore = ephemeralStore;
    this.peerId = peerId;
    this.userPresence = userPresence;
  }

  // Broadcast user presence at regular intervals
  public broadcastUserPresence(pingIntervalMs: number = 20000) {
    // Set the user presence every pingIntervalMs milliseconds
    const interval = setInterval(() => {
      const userPresenceKey = `user/${this.peerId}`;
      this.ephemeralStore.set(userPresenceKey, this.userPresence);
    }, pingIntervalMs);

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }

  // Get the user presence for a specific peer ID
  public getUserPresence(peerId: string) {
    const userPresenceKey = `user/${peerId}`;
    const presence = this.ephemeralStore.get(userPresenceKey);
    return presence as UserPresence;
  }

  // Utility function to parse and ensure the key in the ephemeral store corresponds to a cursor event for the specified container.
  private parseCursorEventFor(
    key: string,
    containerID: ContainerID,
  ): { type: string; containerID: ContainerID; peerId: string } | null {
    // Split the key to check if it belongs to the cursor store
    const keyParts = key.split('/');

    // Check the parts
    if (keyParts.length < 3) {
      return null;
    } else if (keyParts[0] !== 'cursor') {
      return null;
    } else if (keyParts[1] === containerID.toString()) {
      return {
        type: keyParts[0],
        containerID,
        peerId: keyParts[2],
      };
    }
    return null;
  }

  /**
   * Let's bind the ephemeral store to a cursor store for a specific container.
   *
   * @param containerID
   * @param cursorStore
   * @returns A cleanup function to unbind the stores.
   */
  public bindCursorStore(
    containerID: ContainerID,
    cursorStore: EphemeralStore,
  ): () => void {
    // Sync initial state from ephemeral store to cursor store
    const containerPrefix = `cursor/${containerID.toString()}/`;
    this.ephemeralStore.keys().forEach((key) => {
      if (key.startsWith(containerPrefix)) {
        const keyParts = this.parseCursorEventFor(key, containerID);
        // Don't sync our own cursor back to ourselves
        if (keyParts && keyParts.peerId !== this.peerId) {
          const value = this.ephemeralStore.get(key);
          cursorStore.set(keyParts.peerId, value as CursorEphemeralPayload);
        }
      }
    });

    // Subscribe for changes in the ephemeral store to update the cursor store
    const unsubscribeFromEphemeralStore = this.ephemeralStore.subscribe(
      (event: EphemeralStoreEvent) => {
        // Join the updated and added keys
        const keysToSet = [...event.updated, ...event.added];

        // Iterarate over the updated and added keys
        keysToSet.forEach((key) => {
          // Make sure we only take cursor events for the specified container into account.
          const keyParts = this.parseCursorEventFor(key, containerID);
          // We don't want to process our own cursor events
          if (!keyParts || keyParts.peerId === this.peerId) {
            return;
          }
          // Get the value from the ephemeral store
          const value = this.ephemeralStore.get(key);
          // Set the value in the cursor store
          cursorStore.apply(value as Uint8Array);
        });

        // Iterate over the removed keys
        event.removed.forEach((key) => {
          // Make sure we only take cursor events for the specified container into account.
          const keyParts = this.parseCursorEventFor(key, containerID);
          // We don't want to process our own cursor events
          if (!keyParts || keyParts.peerId === this.peerId) {
            return;
          }
          cursorStore.delete(keyParts.peerId);
        });
      },
    );

    // Subscribe for changes in the cursor store to update the ephemeral store
    const unsubscribeFromCursorStore = cursorStore.subscribeLocalUpdates(
      (bytes) => {
        // Check if there's already a user presence key in the ephemeral store before we ommit our cursor presence
        const userPresenceKey = `user/${this.peerId}`;
        if (!this.ephemeralStore.get(userPresenceKey)) {
          this.ephemeralStore.set(userPresenceKey, this.userPresence);
        }
        // Generate the ephemeral store key for the cursor presence
        const cursorEphemeralKey = `cursor/${containerID.toString()}/${
          this.peerId
        }`;
        // Set the value in the ephemeral store
        this.ephemeralStore.set(cursorEphemeralKey, bytes);
      },
    );

    // Cleanup function on unmount
    return () => {
      unsubscribeFromCursorStore();
      unsubscribeFromEphemeralStore();
    };
  }
}
