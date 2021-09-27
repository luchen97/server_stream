import { socketServer } from "../..";
import { RTC_EVENTS } from "../../events/event";
import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../UserNew";
import { getMediasoupWorker } from "../../workerManager";

const createProducerController = async (req: any, res: any) => {
    try {
        const { roomname, userId, producerParams } = req.body;

        if (!roomList.has(roomname)) {
            const message = `not found user in room!`;
            const reponse: IResponse = {
                status: 1,
                message,
                data: null,
            };
            res.json(reponse);
            return;
        }
        const room: Room = roomList.get(roomname);

        const user: User = room.listUser.get(userId);
        const producer = await user.createProducer(
            producerParams.producerTransportId,
            producerParams.rtpParameters,
            producerParams.kind
        );

        room.broadCast(user.socketId, RTC_EVENTS.NEW_PRODUCER, {
            producer_id: producer.id,
            producer_socket_id: user.socketId,
            peerName: user.username,
            peerId: user.socketId,
            isKey: user.isKey,
        });
     
        const message = `create producer success!`;
        const reponse: IResponse = {
            status: 1,
            message,
            data: producer.id,
        };
        res.json(reponse);
    } catch (err) {
        const message = `create producer fail!`;
        const reponse: IResponse = {
            status: 0,
            message,
            data: err.message,
        };
        res.json(reponse);
    }
};

export { createProducerController };
