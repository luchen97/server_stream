import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../User";
import { getMediasoupWorker } from "../../workerManager";

const createConsumerController = async (req: any, res: any) => {
    try {
        const { roomname, userId, consumerParams } = req.body;

        if (!roomList.has(roomname)) {
            const message = `not found user in room!`;
            const reponse: IResponse = {
                status: 0,
                message,
                data: null,
            };
            res.json(reponse);
            return;
        }

        const room: Room = roomList.get(roomname);
        const user: User = room.listUser.get(userId);
        const consumer = await user.createConsumer(
            consumerParams.consumerTransportId,
            consumerParams.producerId,
            consumerParams.rtpCapabilities
          );

        const message = `create consumer success!`;
        const reponse: IResponse = {
            status: 1,
            message,
            data: consumer,
        };
        res.json(reponse);
    } catch (err) {
        const message = `create consumer fail!`;
        const reponse: IResponse = {
            status: 0,
            message,
            data: err.message,
        };
        res.json(reponse);
    }
};

export { createConsumerController };
