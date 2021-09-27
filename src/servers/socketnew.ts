import { Server } from "socket.io";
import { EVENTS, RTC_EVENTS } from "../events/event";
import { IResponse } from "../models/response.interface";
import { Room } from "../Room";
import { roomList } from "../roomManager";
import { User } from "../User";
import { getMediasoupWorker } from "../workerManager";

const initSocketServer = (httpsServer: any) => {
    const io = new Server(httpsServer, {
        allowEIO3: true,
        cors: { origin: "*" },
    });

    io.on(EVENTS.SOCKET_CONNECTION, (socket: any) => {
        //room action event
      
        socket.on(EVENTS.SOCKET_DISCONNECT, (data: { roomname: any; password: any }, callback: Function) =>
            onUserDisconnect(socket)
        );
        
       
    });

    return io;
};

const onUserDisconnect = async (socket: any) => {
    roomList.forEach((room: Room, key) => {
        if (room.listUser.has(socket.id)) {
            const user:User = room.listUser.get(socket.id);
            user.transports.forEach((transport:any) => {
                transport.close()
            });
            room.removeUser(socket.id);
            room.broadCast(socket.id, EVENTS.SOCKET_USER_LEFT_ROOM, {
                name: user.username,
                id: user.socketId,
                isKey: user.isKey,
            });
            if (room.listUser.size === 0) {
                roomList.delete(room.name);
            }
        }
    });
    // const { roomname, id } = socket;
    // if (!roomname) return;
    // const room: Room = roomList.get(roomname);
    // const user: User = room.listUser.get(id);
    // await room.removeUser(user.socketId);
    // room.broadCast(id, EVENTS.SOCKET_USER_LEFT_ROOM, {
    //   name: user.username,
    //   id: user.socketId,
    //   isKey:user.isKey
    // });
    // if (room.listUser.size === 0) {
    //   roomList.delete(roomname);
    // }
    // console.log(`---disconnect--- name: ${user.username}`);
};

export { initSocketServer };
