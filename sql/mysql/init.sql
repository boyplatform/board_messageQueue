CREATE DATABASE `board_messagequeue` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_bin */;

drop table if exists MessageQueueIndex;

/*==============================================================*/
/* Table: MessageQueueIndex                                     */
/*==============================================================*/
create table MessageQueueIndex
(
   indexGuid            varchar(255) not null,
   queueNodeInfo        varchar(255),
   queueNodeIp          varchar(100),
   state                varchar(100) default '2' comment '0=inactive-the queue is inactived by person manually
            1=actived-the queue is actived by person manually
            2=starting-the queue is init and prepare to running
            3=running-the messages under queue has been processing
            4=success-All the messages under queue have been processed
            5=failed-Some messages under queue have been failed
            6=terminated-the queue is terminated during its running
            7=restart-restart a terminated or failed queue
            8=nodeWait-The queue can logically run, there is no enough node for its running now and it will be assign to a new joiness node when the node become enough base on platform meta data setting.
            9=on-hold-The queue is on hold and will not be run until it receives the queue off hold command.
            10=on-ice-The queue is stopped.',
   queueToolType        varchar(100) comment 'The column is used to define queue tool type.
            0=nodejs queue-fun
            1=Radis
            2=others',
   createTime           timestamp not null default CURRENT_TIMESTAMP,
   primary key (indexGuid)
);

alter table MessageQueueIndex comment 'This table is used to save all types'' message queue''s inde';

drop table if exists DymaticTrafficShaping;

/*==============================================================*/
/* Table: DymaticTrafficShaping                                 */
/*==============================================================*/
create table DymaticTrafficShaping
(
   queueIndexGuid       varchar(255),
   maxSpeedRate         float,
   minSpeedRate         float,
   avergeSpeedRate      float,
   state                varchar(100) default '2' comment 'property redundancy column
            0=inactive-the queue is inactived by person manually
            1=actived-the queue is actived by person manually
            2=starting-the queue is init and prepare to running
            3=running-the messages under queue has been processing
            4=success-All the messages under queue have been processed
            5=failed-Some messages under queue have been failed
            6=terminated-the queue is terminated during its running
            7=restart-restart a terminated or failed queue
            8=nodeWait-The queue can logically run, there is no enough node for its running now and it will be assign to a new joiness node when the node become enough base on platform meta data setting.
            9=on-hold-The queue is on hold and will not be run until it receives the queue off hold command.
            10=on-ice-The queue is stopped.',
   currentTotalDataSize float comment 'The total data size under current queue.',
   createTime           datetime comment '队列索引创建时间',
   revokeTime           datetime comment '队列索引回收时间',
   updateTime           timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   defaultExecuteSec    int not null default 7,
   lastStartTime        datetime,
   lastEndTime          datetime
);

alter table DymaticTrafficShaping add constraint FK_Reference_2 foreign key (queueIndexGuid)
      references MessageQueueIndex (indexGuid);


drop table if exists Message;

/*==============================================================*/
/* Table: Message                                               */
/*==============================================================*/
create table Message
(
   messageAction        int comment '1=insert
            2=update
            3=delete
            4=select
            5=SP Execution
            6=fwrite
            7=fread
            8=cacheWrite
            9=cacheRead
            10=webApi Invoke
            11=dll Api invoke',
   messageActionType    varchar(255) comment '0=diskdb
            1=diskFile
            2=Memory
            3=Third party WebApi
            4=Third party dll Api
            5= others
            ',
   messageActionStatement text comment 'used to save message action''s statement',
   state                int default 0 comment '0=entered-first add in
            1=processing-during processing
            2=success-processed successfully
            3=failed-processed failed
            4=blocking-during processing, met issue and blocked',
   timeSpan             timestamp default CURRENT_TIMESTAMP comment 'time span for this message',
   messageActionToolType varchar(100) comment '0=mssql
            1=mysql
            2=oracle
            3=hadoop
            4=memcache
            5=redis
            6=httpRequest
            7=dllRequest',
   messageId            bigint not null auto_increment,
   queueIndexGuid       varchar(255) not null,
   primary key (messageId)
);

alter table Message comment 'This table was used to save diff message under queue.';


drop table if exists tempDiskFile;

/*==============================================================*/
/* Table: tempDiskFile                                          */
/*==============================================================*/
create table tempDiskFile
(
   tempDiskFileId       bigint not null auto_increment,
   tempDiskFileGuid     varchar(255),
   tempDiskFilePath     varchar(255),
   reqDiskFileUrl       varchar(255),
   ttl                  bigint comment 'gac ttl',
   fileNameWithExt      text,
   status               bigint comment '0=init
            1=received
            2=transferred',
   createTime           datetime,
   updateTime           timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   transferTime         datetime,
   primary key (tempDiskFileId)
);
