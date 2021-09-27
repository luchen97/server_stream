import { config } from "./config";
import { nodeServer } from "./servers/nodeServer";
import { initSocketServer } from "./servers/socket";
import { initWorker } from "./workerManager";
import { Server } from "socket.io";
import { EVENTS } from "./events/event";

const httpsServer = nodeServer().httpsServer;
const socketServer = initSocketServer(httpsServer);
httpsServer.listen(config.listenPort, async () => {
    console.log("listening http " + config.listenPort);
});

const main = async () => {
    await initWorker();
};
main();

export { socketServer };
