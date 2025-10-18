import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import connectDb from './config/db.config';
import { App } from './app';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export class Server {
  private port: string | number;
  private appInstance;
  private io: SocketIOServer;

  constructor() {
    this.port = process.env.PORT || 5000;
    this.appInstance = new App().getInstance();
    const httpServer = createServer(this.appInstance);
    
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:3001",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    
    this.setupSocketEvents();
    this.startServer(httpServer);
  }

  private async connectToDatabase() {
    try {
      await connectDb();
      console.log('Database connected successfully');
    } catch (error) {
      console.error(' Error while connecting to the database:', error);
      process.exit(1);
    }
  }

  private setupSocketEvents() {
    this.io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

     
      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-joined", socket.id);
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

    
      socket.on("offer", (data: { roomId: string; offer: RTCSessionDescriptionInit }) => {
        socket.to(data.roomId).emit("offer", data.offer);
        console.log(` Offer sent to room ${data.roomId}`);
      });

      socket.on("answer", (data: { roomId: string; answer: RTCSessionDescriptionInit }) => {
        socket.to(data.roomId).emit("answer", data.answer);
        console.log(`Answer sent to room ${data.roomId}`);
      });

      socket.on("ice-candidate", (data: { roomId: string; candidate: RTCIceCandidateInit }) => {
        socket.to(data.roomId).emit("ice-candidate", data.candidate);
      });

   
      socket.on("chat-message", (data: { roomId: string; sender: string; text: string; time: string }) => {
        socket.to(data.roomId).emit("chat-message", {
          sender: data.sender,
          text: data.text,
          time: data.time
        });
        console.log(`Chat message in room ${data.roomId} from ${data.sender}`);
      });

      
      socket.on("screen-share-started", (data: { roomId: string }) => {
        socket.to(data.roomId).emit("screen-share-started");
        console.log(` Screen share started in room ${data.roomId}`);
      });

      socket.on("screen-share-stopped", (data: { roomId: string }) => {
        socket.to(data.roomId).emit("screen-share-stopped");
        console.log(` Screen share stopped in room ${data.roomId}`);
      });

    
      socket.on("disconnect", () => {
        console.log(" User disconnected:", socket.id);
      });
    });
  }

  private async startServer(httpServer: any) {
    await this.connectToDatabase();
    httpServer.listen(this.port, () => {
      console.log(` AlgoNest Server running at http://localhost:${this.port}`);
      console.log(` WebSocket server is ready`);
    });
  }
}

new Server();