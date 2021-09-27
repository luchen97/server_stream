import * as express from "express";
import { changeRoomPasswordController } from "../controllers/Room/ChangeRoomPassword";
import { checkRoomExistenceController } from "../controllers/Room/CheckRoomExistenceController";
import { closeProducerController } from "../controllers/Room/CloseProducer";
import { connectTransportController } from "../controllers/Room/ConnectTransport";
import { createConsumerController } from "../controllers/Room/CreateConsumer";
import { createProducerController } from "../controllers/Room/CreateProducer";
import { createRoomController } from "../controllers/Room/CreateRoom";
import { createTransportController } from "../controllers/Room/CreateTransport";
import { exitRoomController } from "../controllers/Room/ExitRoom";
import { getConsumerUserController } from "../controllers/Room/GetConsumerUser";
import { getKeyUserController } from "../controllers/Room/GetKeyUser";
import { getMessageInRoomController } from "../controllers/Room/GetMessageInRoom";
import { getProducerInRoomController } from "../controllers/Room/GetProducerInRoom";
import { getRoomInfoController } from "../controllers/Room/GetRoomInfo";
import { getRouterCapacitiesController } from "../controllers/Room/GetRouterCapacities";
import { joinRoomController } from "../controllers/Room/JoinRoom";
import { sendMessageController } from "../controllers/Room/SendMessage";


const routers = express.Router();

routers.post("/createRoom", createRoomController);
routers.post("/createTransport", createTransportController);
routers.post("/connectTransport", connectTransportController);
routers.post("/closeProducer", closeProducerController);
routers.post("/createProducer", createProducerController);
routers.post("/createConsumer", createConsumerController);
routers.post("/getProducerInRoom", getProducerInRoomController);
routers.post("/getRouterCapacities", getRouterCapacitiesController);
routers.post("/checkRoomExistence", checkRoomExistenceController);
routers.post("/joinRoom", joinRoomController);
routers.post("/getRoomInfo", getRoomInfoController);
routers.post("/changeRoomPassword", changeRoomPasswordController);
routers.post("/getMessageInRoom", getMessageInRoomController);
routers.post("/sendMessage", sendMessageController);
routers.post("/exitRoom", exitRoomController);
routers.post("/getConsumerUser", getConsumerUserController);
routers.post("/getKeyUser", getKeyUserController);

export { routers };
