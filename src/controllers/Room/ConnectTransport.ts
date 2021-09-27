import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../User";
import { getMediasoupWorker } from "../../workerManager";

const connectTransportController = async (req: any, res: any) => {
    try {
        const { roomname, userId, connectTransport } = req.body;
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
        await user.connectTransport(connectTransport.transportId, connectTransport.dtlsParameters);
        const message = `connect transport success!`;
        const reponse: IResponse = {
            status: 1,
            message,
            data: null,
        };
        res.json(reponse);
    } catch (err) {
        const message = `connect transport fail!`;
        const reponse: IResponse = {
            status: 0,
            message,
            data: err.message,
        };
        res.json(reponse);
    }
};

export { connectTransportController };
