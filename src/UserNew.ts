import { socketServer } from ".";
import { config } from "./config";
import { RTC_EVENTS } from "./events/event";
import { roomList } from "./roomManager";

class User {
    socketId: string;
    transports: any;
    consumers: any;
    producers: any;
    username: string;
    isKey: boolean;
    constructor(id: string, username: string, isKey: boolean) {
        this.socketId = id;
        this.username = username;
        this.isKey = isKey;
        this.transports = new Map();
        this.consumers = new Map();
        this.producers = new Map();
    }

    createTransport = async (router: any) => {
        const { maxIncomingBitrate, initialAvailableOutgoingBitrate, listenIps } = config.mediasoup.webRtcTransport;
        const transport = await router.createWebRtcTransport({
            listenIps: listenIps,
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitrate,
        });
        if (maxIncomingBitrate) {
            try {
                await transport.setMaxIncomingBitrate(maxIncomingBitrate);
            } catch (error) {}
        }

        this.transports.set(transport.id, transport);
        return {
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            },
        };
    };

    connectTransport = async (transportId: any, dtlsParameters: any) => {
        if (!this.transports.has(transportId)) return;
        await this.transports.get(transportId).connect({
            dtlsParameters: dtlsParameters,
        });
    };

    createProducer = async (producerTransportId: any, rtpParameters: any, kind: any) => {
        let producer = await this.transports.get(producerTransportId).produce({
            kind,
            rtpParameters,
        });
        this.producers.set(producer.id, producer);

        producer.on("transportclose", () => {
            console.log("transportclose");
            producer.close();
            this.producers.delete(producer.id);
        });

        return producer;
    };

    createConsumer = async (consumerTransportId: any, producerId: any, rtpCapabilities: any) => {
        const consumerTransport = this.transports.get(consumerTransportId);
        let consumer: any = null;
        try {
            consumer = await consumerTransport.consume({
                producerId: producerId,
                rtpCapabilities,
                paused: false, //producer.kind === 'video',
            });
        } catch (error) {
            console.error("consume failed", error);
            return;
        }

        // if (consumer.type === "simulcast") {
        //   await consumer.setPreferredLayers({
        //     spatialLayer: 1,
        //     temporalLayer: 4,
        //   });
        // }

        this.consumers.set(consumer.id, consumer);

        consumer.on("transportclose", () => {
            this.consumers.delete(consumer.id);
        });

        consumer.on("producerclose", () => {
            this.consumers.delete(consumer.id);
            // console.log(`---consumer closed--- due to producerclose event  name:${this.peers.get(socket_id).name} consumer_id: ${consumer.id}`)
            // // tell client consumer is dead
            socketServer.to(this.socketId).emit(RTC_EVENTS.CLOSE_CONSUME, {
                consumerId: consumer.id,
            });
        });

        return {
            consumer,
            params: {
                producerId: producerId,
                id: consumer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                type: consumer.type,
                producerPaused: consumer.producerPaused,
            },
        };
    };

    closeProducer = (producerId: string) => {
        if (!producerId || !this.producers) {
            return;
        }
        try {
            this.producers.get(producerId).close();
        } catch (e) {
            console.warn(e);
        }
        this.producers.delete(producerId);
    };
}

export { User };
