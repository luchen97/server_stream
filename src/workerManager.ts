import { config } from "./config";
import * as mediasoup from "mediasoup";

let workers: any = [];
let nextMediasoupWorkerIdx = 0;

const initWorker = async () => {
  try {
    const { numWorkers } = config.mediasoup;

    for (let i = 0; i < numWorkers; i++) {
      const workerconfig: any = {
        logLevel: config.mediasoup.worker.logLevel,
        logTags: config.mediasoup.worker.logTags,
        rtcMinPort: config.mediasoup.worker.rtcMinPort,
        rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
      };
      let worker = await mediasoup.createWorker(workerconfig);

      worker.on("died", () => {
        console.error(
          "mediasoup worker died, exiting in 2 seconds... [pid:%d]",
          worker.pid
        );
        setTimeout(() => process.exit(1), 2000);
      });
      // setInterval(async () => {
      //   const usage = await worker.getResourceUsage();

      //   console.log(
      //     "mediasoup Worker resource usage [pid:%d]: %o",
      //     worker.pid,
      //     usage
      //   );
      // }, 12000);
      workers.push(worker);
    }
  } catch (error) {
    console.error(error);
  }
};

const getMediasoupWorker = () => {
  const worker = workers[nextMediasoupWorkerIdx];
  if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0;
  return worker;
};

export { getMediasoupWorker, initWorker };
