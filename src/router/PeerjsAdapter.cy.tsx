import { combineLatest, filter, Subscription } from "rxjs";
import { NetworkStatus } from "../router/NetworkStatus";
import { Get } from "./createControllerFactory";
import { PeerApplication } from "./PeerApplication";
import { PeerClientState } from "./PeerClientState";
import { PeerjsClient } from "./PeerjsAdapter";
import { PeerSignalType } from "./PeerSignal";

const [PeerService, Controller, Listener] = PeerApplication(
  new PeerjsClient({ path: "/teachers", port: 9000, host: "localhost" })
);
export { PeerService, Controller, Listener };
const sink = PeerService.sink();

describe("", () => {
  let subs: Subscription;

  it("should connect to a peer", async () => {
    function handler(state: PeerClientState) {
      if (state.networkStatus !== undefined) {
        expect(state.networkStatus === NetworkStatus.CONNECTED).to.be.true;
        subs.unsubscribe();
      }
    }
    subs = sink.changeState$.subscribe(handler);
  });

  it("should connect to the peer", (done) => {
    const [PeerService1] = PeerApplication(
      new PeerjsClient({ path: "/teachers", port: 9000, host: "localhost" })
    );
    const [PeerService2] = PeerApplication(
      new PeerjsClient({ path: "/teachers", port: 9000, host: "localhost" })
    );
    subs = combineLatest([
      PeerService1.sink().changeState$,
      PeerService2.sink().changeState$,
    ])
      .pipe(
        filter(([state1, state2]) => {
          return (
            state1.networkStatus === NetworkStatus.CONNECTED &&
            state2.networkStatus === NetworkStatus.CONNECTED
          );
        })
      )
      .subscribe(([state1, state2]) => {
        if (
          state2.outgoingConnectionsCount === 1 &&
          state2.peerStatus === NetworkStatus.CONNECTED
        ) {
          expect(PeerService1.getConnectionsCount() === 1).to.be.true;
          expect(PeerService2.getConnectionsCount() === 1).to.be.true;
          expect(state1.outgoingConnectionsCount === undefined).to.be.true;
          expect(
            state2.outgoingConnectionsCount === 1 &&
              state2.peerStatus === NetworkStatus.CONNECTED
          ).to.be.true;
          done();
          subs.unsubscribe();
        } else if (
          state1.peerId &&
          state1.networkStatus === NetworkStatus.CONNECTED &&
          state2.networkStatus === NetworkStatus.CONNECTED
        ) {
          PeerService2.connectPeer(state1.peerId);
        }
      });
  });

  it("should send data to the peer", (done) => {
    const [PeerService1, Controller] = PeerApplication(
      new PeerjsClient({ path: "/teachers", port: 9000, host: "localhost" })
    );
    const [PeerService2] = PeerApplication(
      new PeerjsClient({ path: "/teachers", port: 9000, host: "localhost" })
    );

    const MockController = Controller()(
      Get("/", (req, resp, next) => {
        console.log("req 1: ", req);
        next()
      })
    );

    MockController.subscribe((req) => {
      console.log("MockController.subscribe : ", req);
    });

    PeerService1.sink().requests$.subscribe((data) => {
      expect(data.payload.body.name === "test user").to.be.true;
      done();
    });
    subs = combineLatest([
      PeerService1.sink().changeState$,
      PeerService2.sink().changeState$,
    ])
      .pipe(
        filter(([state1, state2]) => {
          return (
            state1.networkStatus === NetworkStatus.CONNECTED &&
            state2.networkStatus === NetworkStatus.CONNECTED
          );
        })
      )
      .subscribe(([state1, state2]) => {
        if (
          state2.outgoingConnectionsCount === 1 &&
          state2.peerStatus === NetworkStatus.CONNECTED
        ) {
          expect(PeerService1.getConnectionsCount() === 1).to.be.true;
          expect(PeerService2.getConnectionsCount() === 1).to.be.true;
          expect(state1.outgoingConnectionsCount === undefined).to.be.true;
          expect(
            state2.outgoingConnectionsCount === 1 &&
              state2.peerStatus === NetworkStatus.CONNECTED
          ).to.be.true;
          subs.unsubscribe();
          PeerService2.emit({
            type: PeerSignalType.REQUEST,
            payload: {
              body: { name: "test user" },
              method: "GET",
              path: "/",
              targetPeerId: state1.peerId || "",
            },
          });
        } else if (
          state1.peerId &&
          state1.networkStatus === NetworkStatus.CONNECTED &&
          state2.networkStatus === NetworkStatus.CONNECTED
        ) {
          PeerService2.connectPeer(state1.peerId);
        }
      });
  });
});
