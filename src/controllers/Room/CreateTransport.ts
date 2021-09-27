import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../User";
import { getMediasoupWorker } from "../../workerManager";

const createTransportController = async (req: any, res: any) => {
    try {

        const roomname = req.body.roomname;
        const userId = req.body.userId;

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
        const router = room.router;
        const { params } = await user.createTransport(router);
        const message = `create transport success!`;
        const reponse: IResponse = {
            status: 1,
            message,
            data: params,
        };
        res.json(reponse);
    } catch (err) {
        const message = `create transport fail!`;
        const reponse: IResponse = {
            status: 0,
            message,
            data: err.message,
        };
        res.json(reponse);
    }
};

export { createTransportController };
