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
    cors: { origin: "*"},
  });

  io.on(EVENTS.SOCKET_CONNECTION, (socket: any) => {
    //room action event
    socket.on(
      EVENTS.CHECK_ROOM_ALREADY,
      (data: { roomname: any; password: any }, callback: Function) =>
        onCheckRoomAlready(data, callback)
    );
    socket.on(
      EVENTS.SOCKET_DISCONNECT,
      (data: { roomname: any; password: any }, callback: Function) =>
        onUserDisconnect(socket)
    );
    socket.on(
      EVENTS.SOCKET_CREATE_ROOM,
      (data: { roomname: any; password: any }, callback: Function) =>
        onCreateRoom(io, data, callback)
    );
    socket.on(
      EVENTS.SOCKET_USER_JOIN_ROOM,
      (
        data: { username: string; roomname: string; password: any },
        callback: Function
      ) => onJoinRoom(io, socket, data, callback)
    );
    socket.on(EVENTS.SOCKET_GET_ROOM_INFO, (data: any, callback: Function) =>
      onGetRoomInfo(socket, data, callback)
    );

    socket.on(EVENTS.SOCKET_EXIT_ROOM, (data: any, callback: Function) =>
      onExitRoom(socket, data, callback)
    );

    socket.on(EVENTS.SOCKET_SEND_MESSAGE, (data: any, callback: Function) =>
      onSendMessage(socket, data, callback)
    );

    socket.on(
      EVENTS.SOCKET_GET_MESSAGE_IN_ROOM,
      (data: any, callback: Function) =>
        onGetMessageInRoom(socket, data, callback)
    );

    socket.on(
      EVENTS.SOCKET_CHANGE_ROOM_PASSWORD,
      (data: any, callback: Function) =>
        onChangeRoomPassword(socket, data, callback)
    );
    // rtc action event
    socket.on(
      RTC_EVENTS.GET_ROUTER_CAPABILITIES,
      (data: any, callback: Function) =>
        onGetRouterRtpCapabilities(socket, data, callback)
    );
    socket.on(RTC_EVENTS.CLOSE_PRODUCER, (data: any, callback: Function) =>
      onCloseProducer(socket, data, callback)
    );
    socket.on(RTC_EVENTS.GET_PRODUCER, (data: any, callback: Function) =>
      onGetProduce(socket, data, callback)
    );
    socket.on(RTC_EVENTS.CREATE_TRANSPORT, (data: any, callback: Function) =>
      onCreateTransport(socket, data, callback)
    );
    socket.on(RTC_EVENTS.CONNECT_TRANSPORT, (data: any, callback: Function) =>
      onConnectTransport(socket, data, callback)
    );
    socket.on(RTC_EVENTS.CREATE_PRODUCE, (data: any, callback: Function) =>
      onCreateProduce(socket, data, callback)
    );
    socket.on(RTC_EVENTS.CREATE_CONSUME, (data: any, callback: Function) =>
      onCreateConsume(socket, data, callback)
    );
    socket.on(
      RTC_EVENTS.GET_PRODUCER_OF_USER_KEY,
      (data: any, callback: Function) =>
        onGetProducerOfuserKey(socket, data, callback)
    );
  });
};

const onGetProducerOfuserKey = (socket: any, data: any, callback: Function) => {
  const { roomname, id } = socket;
  const room: Room = roomList.get(roomname);
  const user:any = Array.from(room.listUser.values()).filter((user: User) => {
    if (user.isKey) {
      return user;
    }
  })[0];

  console.log(user)

  if (!roomList.has(roomname)) {
    const message = "Room not found!";
    const reponse: IResponse = {
      status: 0,
      message,
      data: null,
    };
    console.log(message);
    return callback(reponse);
  } else {
    const producerList: any = [];
    if (!user) {
      const message = "User not found!";
      const reponse: IResponse = {
        status: 0,
        message,
        data: null,
      };
      console.log(message);
      return callback(reponse);
    }
    user.producers.forEach((producer: any) => {
      producerList.push({
        producer_id: producer.id,
        peerName: user.username,
        peerId: user.socketId,
      });
    });
    const message = "User key producer get success!";
    const reponse: IResponse = {
      status: 1,
      message,
      data: producerList,
    };
    console.log(message);
    return callback(reponse);
  }
};

const onCreateRoom = (
  io: any,
  data: { roomname: any; password: any },
  callback: Function
) => {
  const { roomname, password } = data;

  if (roomList.has(roomname)) {
    const message = "Room already exist!";
    const reponse: IResponse = {
      status: 0,
      message,
      data: { roomname, password },
    };
    console.log(message);
    return callback(reponse);
  } else {
    const worker = getMediasoupWorker();
    const room = new Room(roomname, password, worker, io);
    roomList.set(roomname, room);
    const message = `Room: ${roomname} create success!`;
    const reponse: IResponse = {
      status: 1,
      message,
      data: { roomname, password },
    };
    return callback(reponse);
  }
};

const onJoinRoom = (
  io: any,
  socket: any,
  data: { username: string; roomname: string; password: any },
  callback: Function
) => {
  const { roomname, password, username } = data;
  if (!roomList.has(roomname)) {
    const message = "Room does not exist!";
    const reponse: IResponse = {
      status: 0,
      message,
      data: { roomname, password },
    };
    console.log(message);
    return callback(reponse);
  } else {
    const room: Room = roomList.get(roomname);
    if (room.password !== password) {
      const message = "Password fail!";
      const reponse: IResponse = {
        status: 0,
        message,
        data: { roomname, password },
      };
      console.log(message);
      return callback(reponse);
    } else {
      const message = `user ${username} join room ${room.name} success!`;
      const user: User = new User(io, socket.id, username, false);
      if (room.listUser.size === 0) {
        user.isKey = true;
      }
      room.addUser(user);
      socket.roomname = roomname;
      const reponse: IResponse = {
        status: 1,
        message,
        data: room.getListUser(),
      };
      console.log(message);
      room.broadCast(socket.id, EVENTS.SOCKET_USER_JOIN_ROOM, {
        name: username,
        id: user.socketId,
      });
      return callback(reponse);
    }
  }
};

const onGetRoomInfo = (socket: any, data: any, callback: Function) => {
  const { roomname, id } = socket;
  const room: Room = roomList.get(roomname);
  const message = `get roominfo: ${roomname} success!`;
  const reponse: IResponse = {
    status: 1,
    message,
    data: { name: room.name, password: room.password },
  };
  console.log(message);
  return callback(reponse);
};

const onChangeRoomPassword = (
  socket: any,
  password: any,
  callback: Function
) => {
  const { roomname, id } = socket;
  const room: Room = roomList.get(roomname);
  room.password = password;
  const message = `Password change success!`;
  const reponse: IResponse = {
    status: 1,
    message,
    data: message,
  };
  console.log(message);
  return callback(reponse);
};

const onUserDisconnect = async (socket: any) => {
  const { roomname, id } = socket;
  if (!roomname) return;
  const room: Room = roomList.get(roomname);
  const user: User = room.listUser.get(id);
  await room.removeUser(user.socketId);
  room.broadCast(id, EVENTS.SOCKET_USER_LEFT_ROOM, {
    name: user.username,
    id: user.socketId,
    isKey:user.isKey
  });
  if (room.listUser.size === 0) {
    roomList.delete(roomname);
  }
  console.log(`---disconnect--- name: ${user.username}`);
};

const onExitRoom = async (socket: any, data: any, callback: Function) => {
  const { roomname, id } = socket;

  if (!roomList.has(socket.roomname)) {
    const message = `not currently in a room`;
    const reponse: IResponse = {
      status: 1,
      message,
      data: null,
    };
    console.log(message);
    return callback(reponse);
  }
  const room: Room = roomList.get(roomname);
  const user: User = room.listUser.get(id);
  await room.removeUser(user.socketId);
 
  if (user.isKey) {
    roomList.delete(roomname);
  }
  if (room.listUser.size === 0) {
    roomList.delete(roomname);
  }
  socket.roomname = null;
  const message = `---exit room--- name: ${user.username}`;
  const reponse: IResponse = {
    status: 1,
    message,
    data: null,
  };
  console.log(message);
  return callback(reponse);
};

const onCreateTransport = async (
  socket: any,
  data: any,
  callback: Function
) => {
  try {
    if (!roomList.has(socket.roomname)) return;
    const { roomname, id } = socket;
    const room: Room = roomList.get(roomname);
    const user: User = room.listUser.get(id);
    const router = room.router;
    const { params } = await user.createTransport(router);
    const message = `create transport success!`;
    const reponse: IResponse = {
      status: 1,
      message,
      data: params,
    };
    console.log(message);
    return callback(reponse);
  } catch (err) {
    const message = `create transport fail!`;
    const reponse: IResponse = {
      status: 0,
      message,
      data: err.message,
    };
    console.log(message);
    return callback(reponse);
  }
};

const onConnectTransport = async (
  socket: any,
  data: any,
  callback: Function
) => {
  if (!roomList.has(socket.roomname)) return;
  const { roomname, id } = socket;
  const room: Room = roomList.get(roomname);
  const user: User = room.listUser.get(id);
  const { transport_id, dtlsParameters } = data;
  await user.connectTransport(transport_id, dtlsParameters);
  callback("success");
};

const onCreateConsume = async (socket: any, data: any, callback: Function) => {
  const { roomname, id } = socket;

  if (!roomList.has(roomname)) {
    const message = `Room not found!`;
    const reponse: IResponse = {
      status: 0,
      message,
      data: null,
    };
    console.log(message);
    return callback(reponse);
  }
  const { consumerTransportId, producerId, rtpCapabilities } = data;
  const room: Room = roomList.get(socket.roomname);
  const user: User = room.listUser.get(id);
  const params = await user.createConsumer(
    consumerTransportId,
    producerId,
    rtpCapabilities
  );
  const message = `Consume create success!`;
  const reponse: IResponse = {
    status: 1,
    message,
    data: params,
  };
  console.log(message);
  return callback(reponse);
};

const onCreateProduce = async (socket: any, data: any, callback: Function) => {
  const { roomname, id } = socket;
  if (!roomList.has(roomname)) {
    const message = `Room not found!`;
    const reponse: IResponse = {
      status: 0,
      message,
      data: null,
    };
    console.log(message);
    return callback(reponse);
  }
  const { producerTransportId, rtpParameters, kind } = data;
  const room: Room = roomList.get(socket.roomname);
  const user: User = room.listUser.get(id);
  const producer = await user.createProducer(
    producerTransportId,
    rtpParameters,
    kind
  );
  console.log("producer", producer.id);
  room.broadCast(id, RTC_EVENTS.NEW_PRODUCER, [
    {
      producer_id: producer.id,
      producer_socket_id: id,
      peerName: user.username,
      peerId: user.socketId,
      isKey:user.isKey
    },
  ]);
  const message = `Producer create success!`;
  const reponse: IResponse = {
    status: 1,
    message,
    data: {
      producerId: producer.id,
      producer,
      username: user.username,
      socketId: user.socketId,
    },
  };

  return callback(reponse);
};

const onGetProduce = (socket: any, data: any, callback: Function) => {
  const { roomname, id } = socket;
  if (!roomList.has(roomname)) {
    const message = `Room not found!`;
    const reponse: IResponse = {
      status: 0,
      message,
      data: null,
    };
    console.log(message);
    return callback(reponse);
  }
  const room: Room = roomList.get(socket.roomname);
  const producerList = room.getProducerListForPeer(id);
  // room.send(id,RTC_EVENTS.NEW_PRODUCER,producerList)
  console.log(producerList);
  const message = `get GetProduce success!`;
  const reponse: IResponse = {
    status: 1,
    message,
    data: producerList,
  };
  console.log(message);
  return callback(reponse);
};

const onGetRouterRtpCapabilities = (
  socket: any,
  data: any,
  callback: Function
) => {
  const room: Room = roomList.get(socket.roomname);
  const routerCapabilities = room.router.rtpCapabilities;
  try {
    const message = `get RouterRtpCapabilities success!`;
    const reponse: IResponse = {
      status: 1,
      message,
      data: routerCapabilities,
    };
    console.log(message);
    return callback(reponse);
  } catch (e) {
    const message = `get RouterRtpCapabilities fail!`;
    const reponse: IResponse = {
      status: 0,
      message,
      data: e.message,
    };
    console.log(message);
    return callback(reponse);
  }
};

const onCloseProducer = (socket: any, data: any, callback: Function) => {
  const { roomname, id } = socket;
  if (!roomList.has(roomname)) {
    const message = `Room not found!`;
    const reponse: IResponse = {
      status: 0,
      message,
      data: null,
    };
    console.log(message);
    return callback(reponse);
  }
  const { producer_id } = data;
  const room: Room = roomList.get(roomname);
  const user: User = room.listUser.get(id);
  user.closeProducer(producer_id);
  // room.broadCast(id, RTC_EVENTS.UPDATE_CONSUME, null);
  const message = `---producer close--- name: ${user.username}`;
  const reponse: IResponse = {
    status: 1,
    message,
    data: null,
  };
  console.log(message);
  return callback(reponse);
};

const onGetMessageInRoom = (socket: any, data: any, callback: Function) => {
  const { roomname, id } = socket;
  if (!roomList.has(roomname)) {
    const message = `Room not found!`;
    const reponse: IResponse = {
      status: 0,
      message,
      data: null,
    };
    console.log(message);
    return callback(reponse);
  }
  const room: Room = roomList.get(roomname);
  const message = `---get message success--- `;
  const reponse: IResponse = {
    status: 1,
    message,
    data: room.listMessage,
  };
  console.log(message);
  return callback(reponse);
};

const onSendMessage = (socket: any, message: any, callback: Function) => {
  const { roomname, id } = socket;
  const room: Room = roomList.get(roomname);
  room.addMessage(socket.id, message);
};

const onCheckRoomAlready = (data: any, callback: Function) => {
  console.log(data);
  if (roomList.has(data.roomname)) {
    const message = `Room already exist!`;
    const reponse: IResponse = {
      status: 1,
      message,
      data: true,
    };
    callback(reponse);
  } else {
    const message = `Room is null!`;
    const reponse: IResponse = {
      status: 1,
      message,
      data: false,
    };
    callback(reponse);
  }
};

export { initSocketServer };
