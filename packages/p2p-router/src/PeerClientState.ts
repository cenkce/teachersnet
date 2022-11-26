import { NetworkStatus } from "./NetworkStatus";
export type PeerClientState = {
  peerStatus?: NetworkStatus;
  networkStatus?: NetworkStatus;
  outgoingConnectionsCount?: number;
  incomingConnectionsCount?: number;
  peers?: any[];
  peerId?: string;
};

export function createInitialPeerClientState(){
  return {
    peerStatus: NetworkStatus.IDLE,
    networkStatus: NetworkStatus.IDLE,
    outgoingConnectionsCount: 0,
    incomingConnectionsCount: 0,
    peers: [],
  } as PeerClientState
}