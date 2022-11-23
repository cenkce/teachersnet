import { IPeerClient } from "./IPeerClient";
import Peer, { DataConnection, MediaConnection, PeerJSOption } from "peerjs";
import { Subject, Observable, BehaviorSubject, merge, of } from "rxjs";
import { PeerClientState } from "./PeerClientState";
import {
  map,
  mergeMap,
  filter,
  share,
  scan,
  tap,
  takeUntil,
  timeout,
} from "rxjs/operators";
import {
  PeerEvent,
  PeerSignalType,
  instacenOfPeerEvent,
  instacenOfPeerRequest,
} from "./PeerSignal";
import { PeerRequest } from "./PeerRequest";
import { NetworkStatus } from "./NetworkStatus";

type DataConnectionEvents = Parameters<DataConnection["on"]>["0"];
type DataConnectionCallback = Parameters<DataConnection["on"]>["1"];
type DataConnectionArgs = Parameters<DataConnectionCallback>["0"];

type MediaConnectionEvents = Parameters<MediaConnection["on"]>["0"];
type MediaConnectionCallback = Parameters<MediaConnection["on"]>["1"];
type MediaConnectionArgs = Parameters<MediaConnectionCallback>["0"];

type PeerConnectionEvents = Parameters<Peer["on"]>["0"];
type PeerConnectionCallback = Parameters<Peer["on"]>["1"];
type PeerConnectionArgs = Parameters<PeerConnectionCallback>["0"];

function fromPeerEvent(peer: Peer, event: PeerConnectionEvents) {
  return new Observable<PeerConnectionArgs>((subscriber) => {
    const handler: PeerConnectionCallback = (...args) => {
      subscriber.next(...args);
    };
    peer.on(event, handler);

    return () => peer.off(event, handler);
  });
}

function fromDataConnectionEvent(
  conn: DataConnection,
  event: DataConnectionEvents
) {
  return new Observable<DataConnectionArgs>((subscriber) => {
    const handler: DataConnectionCallback = (...args) => {
      subscriber.next(...args);
    };
    conn.on(event, handler);

    return () => conn.off(event, handler);
  });
}

function fromMediaConnectionEvent(
  conn: MediaConnection,
  event: MediaConnectionEvents
) {
  return new Observable<MediaConnectionArgs>((subscriber) => {
    const handler: MediaConnectionCallback = (...args) => {
      subscriber.next(...args);
    };
    conn.on(event, handler);

    return () => conn.off(event, handler);
  });
}

type Options = PeerJSOption;

function instanceOfDataConnection(conn: any): conn is DataConnection {
  return conn.type === "data";
}

function instanceOfMediaConnection(conn: any): conn is MediaConnection {
  return conn.type === "media";
}

export class PeerjsClient implements IPeerClient {
  private peerClient = new Peer(this.options);
  private peerId: string = "";
  private state$ = new BehaviorSubject<PeerClientState>({});

  private updateState$ = this.state$.pipe(
    scan((acc, curr) => {
      return Object.assign({}, acc, curr);
    })
  );
  private handlers$ = new Subject();
  // Peers
  private serverConnect$ = fromPeerEvent(this.peerClient, "open").pipe(
    tap((id) => {
      if (typeof id === "string") {
        this.state$.next({
          peerId: id,
          networkStatus: NetworkStatus.CONNECTED,
        });
      }
    })
  );
  private serverDisconnect$ = fromPeerEvent(
    this.peerClient,
    "disconnected"
  ).pipe(
    tap(() => {
      this.state$.next({ networkStatus: NetworkStatus.DISCONNECTED });
    })
  );
  private serverError$ = fromPeerEvent(this.peerClient, "error").pipe(
    tap(() => {
      // this.state$.next({ networkStatus: NetworkStatus.DISCONNECTED });
    })
  );
  private incomingConnection$ = fromPeerEvent(
    this.peerClient,
    "connection"
  ).pipe(
    mergeMap((conn) => {
      console.log("connection", conn);
      if (!conn || conn instanceof Error || typeof conn === "string") {
        throw new Error("Not connected");
      }
      if (typeof conn === "object" && instanceOfMediaConnection(conn)) {
        return fromMediaConnectionEvent(conn, "stream").pipe(
          map((data) => {
            this.state$.next({ peerStatus: NetworkStatus.CONNECTED });
            return data;
          }),
          takeUntil(
            fromMediaConnectionEvent(conn, "close").pipe(
              tap(() => {
                this.state$.next({ peerStatus: NetworkStatus.DISCONNECTED });
              })
            )
          )
        );
      }
      return fromDataConnectionEvent(conn, "open").pipe(
        mergeMap((id) => {
          this.state$.next({ peerStatus: NetworkStatus.CONNECTED });
          return fromDataConnectionEvent(conn, "data");
        }),
        takeUntil(
          fromDataConnectionEvent(conn, "close").pipe(
            tap(() => {
              this.state$.next({ peerStatus: NetworkStatus.DISCONNECTED });
            })
          )
        )
      );
    })
  );

  private events$ = this.incomingConnection$.pipe<any, PeerEvent>(
    map<unknown, Record<string, any> | MediaStream | RTCIceConnectionState>(
      (data) => {
        console.log("events : ", data);
        return typeof data === "string" ? JSON.parse(data) : data;
      }
    ),
    filter((data) => instacenOfPeerEvent(data))
  );
  private requests$ = this.incomingConnection$.pipe<any, PeerRequest>(
    map((data) => {
      console.log("data : ", data);
      return data as any;
    }),
    filter((data) => instacenOfPeerRequest(data) || data)
  );

  private status = NetworkStatus.IDLE;
  private peerConnection?: DataConnection;
  private disposals: (() => void)[] = [];

  constructor(private options: Options) {
    const serverSubscription = merge(
      this.serverConnect$,
      this.serverError$,
      this.serverDisconnect$
    ).subscribe();
    this.incomingConnection$.subscribe();
    this.disposals.push(serverSubscription.unsubscribe, this.incomingConnection$.subscribe().unsubscribe);
  }

  close() {
    this.peerConnection?.close();
  }

  createRequest(
    payload: Omit<PeerRequest["payload"], "targetPeerId">
  ): PeerRequest {
    return {
      type: PeerSignalType.REQUEST,
      payload: {
        params: null,
        ...payload,
        targetPeerId: this.peerId,
      },
    };
  }

  createEvent(payload: Omit<PeerEvent["payload"], "targetPeerId">): PeerEvent {
    return {
      type: PeerSignalType.EVENT,
      payload: {
        ...payload,
        targetPeerId: this.peerId,
      },
    };
  }

  ready() {
    return this.state$.getValue().networkStatus === NetworkStatus.CONNECTED
      ? of(true)
      : this.state$.pipe(
          timeout({
            each: 30 * 1000,
          }),
          filter((state) => {
            if (state.networkStatus === NetworkStatus.CONNECTED) {
              return true;
            }

            return false;
          }),
          map(() => {
            return true;
          })
        );
  }

  disconnectPeer(id: string) {
    // this.getConnections()[id].
  }

  /**
   * Connects to a peer
   * @param id
   * @returns
   */
  connectPeer(id: string) {
    const destroy$ = new Subject();
    const subscription = this.ready()
      .pipe(
        takeUntil(destroy$),
        map((val) => {
          destroy$.complete();
          if (!val) return;
          this.peerConnection = this.peerClient.connect(id, {
            reliable: true,
          });
          this.state$.next({
            peerStatus: NetworkStatus.CONNECTING,
          });
          this.peerConnection.on("open", () => {
            console.log("opened : ", this.peerClient.connections);
            this.state$.next({
              peerStatus: NetworkStatus.CONNECTED,
              outgoingConnectionsCount: Object.keys(this.peerClient.connections)
                .length,
            });
          });
          this.peerConnection.on("data", (data) => {
            console.log("on data ;", data);
          });
          this.peerConnection.on("close", () => {
            this.state$.next({
              peerStatus: NetworkStatus.DISCONNECTED,
              outgoingConnectionsCount: Object.keys(this.peerClient.connections)
                .length,
            });
          });
        })
      )
      .subscribe();

    const clear = () => {
      subscription.unsubscribe();
      destroy$.next(false);
      this.peerClient.disconnect();
      this.peerClient.destroy();
    };

    this.disposals.push(clear);

    // To dispose the connection
    return clear
  }

  sink() {
    return {
      events$: this.events$.pipe(share()),
      requests$: this.requests$.pipe(share()),
      open$: this.serverConnect$.pipe(share()),
      changeState$: this.updateState$.pipe(share()),
    };
  }

  private getConnections() {
    return this.peerClient.connections as { [key: string]: DataConnection[] };
  }

  getConnectionsCount() {
    return Object.keys(this.getConnections()).length;
  }

  dispose(): void {
    this.peerClient.destroy();
    this.disposals.map((unloadFn) => {
      unloadFn();
    })
  }

  emit(signal: Omit<PeerRequest, "targetId"> | PeerEvent, targetId: string | null = null, chunked: boolean = true) {
    const connections = this.getConnections();

    if (targetId && connections[targetId]) {
      connections[targetId].forEach((conn) => {
        conn.send(signal, chunked);
      });
      return true;
    }
    Object.keys(connections).forEach((peerid) => {
      connections[peerid].forEach((conn) => {
        conn.send(signal, chunked);
      });
    });

    return true
  }
}
