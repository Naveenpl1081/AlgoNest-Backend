import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import connectDb from './config/database';
import { App } from './app';

export class Server {
  private port: string | number;
  private appInstance;

  constructor() {
    this.port = process.env.PORT || 5000;
    this.appInstance = new App().getInstance();
  }

  private async connectToDatabase() {
    try {
      await connectDb();
    } catch (error) {
      console.error('Error while connecting to the database:', error);
      process.exit(1);
    }
  }

  public async start() {
    await this.connectToDatabase();
    this.appInstance.listen(this.port, () => {
      console.log(`AlgoNest Server running at http://localhost:${this.port}`);
    });
  }
}

new Server().start();
