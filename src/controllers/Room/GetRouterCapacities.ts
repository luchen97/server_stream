import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../User";
import { getMediasoupWorker } from "../../workerManager";

const getRouterCapacitiesController = async (req: any, res: any) => {
    try {
        const { roomname } = req.body;

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
        const routerCapabilities = room.router.rtpCapabilities;

        const message = `get router capacities success!`;
        const reponse: IResponse = {
            status: 1,
            message,
            data: routerCapabilities,
        };
        res.json(reponse);
    } catch (err) {
        const message = `get router capacities fail!`;
        const reponse: IResponse = {
            status: 0,
            message,
            data: err.message,
        };
        res.json(reponse);
    }
};

export { getRouterCapacitiesController };
