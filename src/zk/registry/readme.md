## 注册中心

涉及到三个角色

- provider
- consumer
- monitor

### provider

服务提供者启动时: 向 /dubbo/${service}/providers 目录下写入自己的 URL地址及配置信息

### consumer

服务消费者启动时: 订阅 /dubbo/${service}/providers 目录下的提供者 URL地址及配置信息。

并向 /dubbo/com.foo.BarService/consumers 目录下写入自己的 URL地址及配置信息.

### monitor

监控中心启动时: 订阅 /dubbo/${service} 目录下的所有提供者和消费者 URL地址及配置信息。

