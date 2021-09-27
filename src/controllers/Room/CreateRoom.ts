import { socketServer } from "../..";
import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../UserNew";
import { getMediasoupWorker } from "../../workerManager";

const createRoomController = async (req: any, res: any) => {
    const roomname = req.body.roomname;
    const password = req.body.password;
    const userId = req.body.userId;
    const username = req.body.username;
    const user = new User(userId, username, true);
    if (roomList.has(roomname)) {
        const message = "Room already exist!";
        const reponse: IResponse = {
            status: 0,
            message,
            data: { roomname, password },
        };
        console.log(message);
        return res.json(reponse);
    } else {
        const room = new Room(roomname, password, getMediasoupWorker(),socketServer);
        await room.initRouter();
        room.addUser(user);
        roomList.set(room.name, room);
        const message = "Room create success!";
        const reponse: IResponse = {
            status: 1,
            message,
            data: { roomname, password },
        };
        console.log(message);
        return res.json(reponse);
    }
};

export { createRoomController };
