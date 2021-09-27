import { config } from "./config";
import { ETransportState, EVENTS, TRANSPORT_EVENTS } from "./events/event";
import { User } from "./UserNew";

class Room {
    userKey: User;
    router: any;
    listUser: any;
    password: string;
    listMessage: Array<any>;
    name: string;
    worker: any;
    userOnRoom: Array<any>;
    io: any;
    constructor(name: string, password: string, worker: any, io: any) {
        this.router = null;
        this.userKey = null;
        this.listUser = new Map();
        this.userOnRoom = [];
        this.password = password;
        this.listMessage = [];
        this.name = name;
        this.worker = worker;
        this.io = io;
    }

    initRouter = async () => {
        const mediaCodecs = config.mediasoup.router.mediaCodecs;
        this.router = await this.worker.createRouter({ mediaCodecs });
    };

    addUser = (user: User) => {
        this.listUser.set(user.socketId, user);
    };

    removeUser = (userId: string) => {
        this.listUser.delete(userId);
    };

    getProducerListForPeer() {
        const producerList: any = [];
        this.listUser.forEach((user: User) => {
            user.producers.forEach((producer: any) => {
                producerList.push({
                    producerId: producer.id,
                    peername: user.username,
                    peerId: user.socketId,
                    isKey: user.isKey,
                });
            });
        });
        return producerList;
    }

    broadCast(socketId: any, event: string, data: any) {
        for (let otherID of Array.from(this.listUser.keys()).filter((id) => id !== socketId)) {
            this.send(otherID, event, data);
        }
    }

    send(socketId: any, event: string, data: any) {
        this.io.to(socketId).emit(event, data);
    }

    addMessage(socketId: string, message: string) {
        const user: User = this.listUser.get(socketId);
        const data: any = { id: socketId, message, name: user.username };
        this.listMessage.push(data);
        this.sendAll(EVENTS.INCOMMING_MESSAGE, this.listMessage);
    }

    sendAll(name: string, data: any) {
        for (let otherID of Array.from(this.listUser.keys())) {
            this.send(otherID, name, data);
        }
    }
}

export { Room };
