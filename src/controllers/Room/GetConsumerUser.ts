import { EVENTS } from "../../events/event";
import { IResponse } from "../../models/response.interface";
import { roomList } from "../../roomManager";
import { Room } from "../../RoomNew";
import { User } from "../../UserNew";

const getConsumerUserController = async (req: any, res: any) => {
    const { roomname, userId, producerParams } = req.body;
    console.log(roomname,"getConsumerUserController");
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
    const listUser = room.listUser;
    const listResponse: any = [];
    listUser.forEach((user: User) => {
        const listProducer: any = [];
        if (!user.isKey) {
            user.producers.forEach((producer: any) => {
                listProducer.push({
                    producerId: producer.id,
                    producerType: producer._data.kind,
                });
            });
            listResponse.push({
                username: user.username,
                userId: user.socketId,
                listProducer,
            });
        }
    });

    const message = `ok!`;
    const reponse: IResponse = {
        status: 1,
        message,
        data: listResponse,
    };
    res.json(reponse);
    return;
};

export { getConsumerUserController };
