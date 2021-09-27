import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../UserNew";
import { getMediasoupWorker } from "../../workerManager";

const getMessageInRoomController = async (req: any, res: any) => {
    const roomname = req.body.roomname;
    const password = req.body.password;
    if (!roomList.has(roomname)) {
        const message = "Room not found!";
        const reponse: IResponse = {
            status: 0,
            message,
            data: { roomname, password },
        };
        return res.json(reponse);
    } else {
        const room: Room = roomList.get(roomname);
        const message = `Get message success!`;
        const reponse: IResponse = {
            status: 1,
            message,
            data: room.listMessage,
        };
        return res.json(reponse);
    }
};

export { getMessageInRoomController };
