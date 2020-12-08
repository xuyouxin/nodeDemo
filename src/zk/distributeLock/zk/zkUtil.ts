import * as zookeeper from 'node-zookeeper-client';
import { Client, CreateMode, Exception } from "node-zookeeper-client";


interface RemoveRecursive {
  removeRecursive(path: string, callback: (error: Error | Exception) => void)
}

type ZKClient = Client & RemoveRecursive;

export class ZKUtil {

  private static client: ZKClient;

  static init() {
    this.client = zookeeper.createClient('localhost:2181') as ZKClient;
    this.client.connect();
  }

  static destroy() {
    this.client.close();
  }

  // 创建父节点
  static async mkdirp(path: string): Promise<boolean> {
    return new Promise(resolve => {
      this.client.mkdirp(path, function (error) {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
    })
  }

  // 创建节点前，得先确保父节点存在
  static async createNode(path: string, data: any = "", createMode: number = CreateMode.PERSISTENT): Promise<boolean> {
    return new Promise(resolve => {
      this.client.create(path, Buffer.from(JSON.stringify(data)), createMode, function (error, path) {
        if (error) {
          resolve(false);
        } else {
          console.log("success");
          resolve(true);
        }
      });
    })
  }

  static async getChildren(path: string): Promise<string[]> {
    return new Promise(resolve => {
      this.client.getChildren(path, function (error, children) {
        if (error) {
          console.log("error>>", error);
          resolve([]);
        } else {
          resolve(children);
        }
      })
    })
  }

  static async getData(path: string): Promise<string> {
    return new Promise(resolve => {
      this.client.getData(path, function (error, data) {
        if (error || !data) {
          console.log("error>>", error);
          resolve("{}");
        } else {
          resolve(data.toString());
        }
      })
    })
  }

  static async setData(path: string, data: any) {
    return new Promise(resolve => {
      this.client.setData(path, Buffer.from(JSON.stringify(data)), function (error) {
        if (error) {
          console.log("error>>", error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  static async exists(path: string): Promise<boolean> {
    return new Promise(resolve => {
      this.client.exists(path, (error, stat) => {
        if (error) {
          throw error;
        }
        if (stat) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
    })
  }

  // 只有当该节点没有子节点时，才能被删除
  static async remove(path: string): Promise<boolean> {
    return new Promise(resolve => {
      this.client.remove(path, (error) => {
        if (error) {
          console.log("error>>", error);
          resolve(false);
        } else {
          resolve(true);
        }
      })
    })
  }

  static async removeRecursive(path: string): Promise<boolean> {
    return new Promise(resolve => {
      this.client.removeRecursive(path, (error) => {
        if (error) {
          console.log("error>>", error);
          resolve(false);
        } else {
          resolve(true);
        }
      })
    })
  }

  static async clearAllData() {
    const children = await this.getChildren("/");
    for (const name of children) {
      if (name != "zookeeper") {
        await this.removeRecursive(`/${name}`);
      }
    }
  }
}

