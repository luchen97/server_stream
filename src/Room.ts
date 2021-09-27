import { config } from "./config";
import { ETransportState, EVENTS, TRANSPORT_EVENTS } from "./events/event";
import { User } from "./User";

class Room {
  userKey:User;
  router: any;
  listUser: any;
  password: string;
  listMessage: Array<any>;
  io: any;
  name: string;
  worker: any;
  userOnRoom: Array<any>;
  constructor(name: string, password: string, worker: any, io: string) {
    this.router = null;
    this.userKey=null;
    this.listUser = new Map();
    this.userOnRoom = [];
    this.password = password;
    this.listMessage = [];
    this.io = io;
    this.name = name;
    this.worker = worker;
    this.initRouter();
  }

  initRouter = async () => {
    const mediaCodecs = config.mediasoup.router.mediaCodecs;
    this.router = await this.worker.createRouter({ mediaCodecs });
  };

  addUser = (user: User) => {
    this.userOnRoom.push({ socketId: user.socketId, username: user.username });
    this.listUser.set(user.socketId, user);
  };

  removeUser = (socketId: string) => {
    this.listUser.delete(socketId);
  };

  getUserOnRoom = () => {
    return this.userOnRoom;
  };

  getListUser = () => {
    return { roomname: this.name, users: JSON.stringify([...this.listUser]) };
  };

  createTransport = async (socketId: string) => {
    const { maxIncomingBitrate, initialAvailableOutgoingBitrate, listenIps } =
      config.mediasoup.webRtcTransport;
    const transport = await this.router.createWebRtcTransport({
      listenIps: listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate,
    });
    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate);
      } catch (error) {}
    }

    // transport.on(
    //   TRANSPORT_EVENTS.STATE_CHANGE,
    //   (dtlsState: ETransportState) => {
    //     if (dtlsState === ETransportState.CLOSED) {
    //       //   console.log(
    //       //     "---transport close--- " +
    //       //       this.peers.get(socket_id).name +
    //       //       " closed"
    //       //   );
    //       transport.close();
    //     }
    //   }
    // );

    // transport.on(TRANSPORT_EVENTS.CLOSE, () => {});
    this.listUser.get(socketId).addTransport(transport);
    return {
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    };
  };

  connectPeerTransport = async (
    socketId: any,
    transportId: any,
    dtlsParameters: any
  ) => {
    if (!this.listUser.has(socketId)) return;
    const user = this.listUser.get(socketId);
    await user.connectTransport(transportId, dtlsParameters);
  };

  getProducerListForPeer(socketId: string) {
    const producerList: any = [];
    this.listUser.forEach((user: User) => {
      user.producers.forEach((producer: any) => {
        producerList.push({
          producer_id: producer.id,
          peerName: user.username,
          peerId: user.socketId,
          isKey:user.isKey
        });
      });
    });
    return producerList;
  }

  broadCast(socketId: any, name: string, data: any) {
    for (let otherID of Array.from(this.listUser.keys()).filter(
      (id) => id !== socketId
    )) {
      this.send(otherID, name, data);
    }
  }

  send(socketId: any, name: string, data: any) {
    this.io.to(socketId).emit(name, data);
  }

  sendAll(name: string, data: any) {
    for (let otherID of Array.from(this.listUser.keys())) {
      this.send(otherID, name, data);
    }
  }

  addMessage(socketId: string, message: string) {
    const user: User = this.listUser.get(socketId);
    const data: any = { id: socketId, message, name: user.username };
    this.listMessage.push(data);
    this.sendAll(EVENTS.INCOMMING_MESSAGE, this.listMessage);
  }
}

export { Room };
