import { socketServer } from "../..";
import { RTC_EVENTS } from "../../events/event";
import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../UserNew";
import { getMediasoupWorker } from "../../workerManager";

const closeProducerController = async (req: any, res: any) => {
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

        user.closeProducer(producerParams.producerId);

        const message = `close producer success!`;
        const reponse: IResponse = {
            status: 1,
            message,
            data: null,
        };
        res.json(reponse);
    } catch (err) {
        const message = `close producer fail!`;
        const reponse: IResponse = {
            status: 0,
            message,
            data: err.message,
        };
        res.json(reponse);
    }
};

export { closeProducerController };
