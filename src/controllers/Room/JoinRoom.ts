import { EVENTS } from "../../events/event";
import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../UserNew";
import { getMediasoupWorker } from "../../workerManager";

const joinRoomController = async (req: any, res: any) => {
    const roomname = req.body.roomname;
    const password = req.body.password;
    const userId = req.body.userId;
    const username = req.body.username;
    const user = new User(userId, username, false);
    if (!roomList.has(roomname)) {
        const message = "Room not found!";
        const reponse: IResponse = {
            status: 0,
            message,
            data: { roomname, password },
        };
        return res.json(reponse);
    } else {
        const room = roomList.get(roomname);
        room.addUser(user);
        room.broadCast(userId, EVENTS.SOCKET_USER_JOIN_ROOM, {
            name: username,
            id: user.socketId,
          });
        const message = "Join room success!";
        const reponse: IResponse = {
            status: 1,
            message,
            data: { roomname, password },
        };
        return res.json(reponse);
    }
};

export { joinRoomController };
