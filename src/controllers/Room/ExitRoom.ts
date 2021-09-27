import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../UserNew";
import { getMediasoupWorker } from "../../workerManager";

const exitRoomController = async (req: any, res: any) => {
    const roomname = req.body.roomname;
    const userId = req.body.userId;
    
    if (!roomList.has(roomname)) {
        const message = "Room not found!";
        const reponse: IResponse = {
            status: 0,
            message,
            data: null,
        };
        return res.json(reponse);
    } else {
        const room: Room = roomList.get(roomname);
        room.removeUser(userId)
        const mess = `Exit success!`;
        const reponse: IResponse = {
            status: 1,
            message:mess,
            data: room.listMessage,
        };
        return res.json(reponse);
    }
};

export { exitRoomController };
