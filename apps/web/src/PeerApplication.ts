
const [PeerService, Controller, Listener] = PeerApplication(new PeerjsClient({ path: "/teachers", port: 9000, host: "localhost" }));

export {PeerService, Controller, Listener};
