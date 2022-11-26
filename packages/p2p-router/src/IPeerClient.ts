import { Observable } from "rxjs/internal/Observable";
import { PeerEvent } from "./PeerSignal";
import { PeerRequest } from "./PeerRequest";
import { PeerClientState } from "./PeerClientState";

export interface IPeerClient {
  sink(): {
    events$: Observable<PeerEvent>,
    requests$: Observable<PeerRequest>,
    open$: Observable<any>,
    changeState$: Observable<PeerClientState>
  };
  getConnectionsCount(): number;
  dispose():void;
  disconnectPeer(id: string): void;
  createRequest(req: Omit<PeerRequest["payload"], "targetPeerId">): PeerRequest;
  createEvent(req: Omit<PeerEvent["payload"], "targetPeerId">): PeerEvent;
  connectPeer: (id:string) => (() => void) | undefined;
  emit(req: PeerRequest): void;
}
