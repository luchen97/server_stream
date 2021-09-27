import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../User";
import { getMediasoupWorker } from "../../workerManager";

const getProducerInRoomController = async (req: any, res: any) => {
    try {
        const { roomname } = req.body;

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
        const producerList = room.getProducerListForPeer();

        const message = `get list producer success!`;
        const reponse: IResponse = {
            status: 1,
            message,
            data: producerList,
        };
        res.json(reponse);
    } catch (err) {
        const message = `get list producer fail!`;
        const reponse: IResponse = {
            status: 0,
            message,
            data: err.message,
        };
        res.json(reponse);
    }
};

export { getProducerInRoomController };
