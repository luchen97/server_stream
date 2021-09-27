import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../User";
import { getMediasoupWorker } from "../../workerManager";

const checkRoomExistenceController = async (req: any, res: any) => {
    const { roomname } = req.body;
    console.log("vaodaydddd",roomname, roomList.has(roomname));
    if (roomList.has(roomname)) {
        res.send(true);
    } else {
        res.send(false);
    }
};

export { checkRoomExistenceController };
