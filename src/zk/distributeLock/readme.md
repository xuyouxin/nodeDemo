### 使用zk做分布式锁的好处

1、zk是现成的应用，可以快速起一个zk服务，不需要额外编码。

blockbuster是自己开发的应用，也可以打包成docker启动。

2、做分布式锁时，zk使用临时节点来实现，这样如果client突然崩溃，分布式锁会自动释放，
不需要额外的工作去清理无效的分布式锁。

blockbuster是基于数据库实现的，如果client突然崩溃，需要有一个进程定时扫描无效的分布式锁
（基于锁定时间）或者出故障时手动清理无效的分布式锁。