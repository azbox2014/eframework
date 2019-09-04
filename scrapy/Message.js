class Message {
  constructor(opts) {
    this.type = opts.type;             //cmd: 进程指令，task：爬网任务
    this.name = opts.name;             //任务名称
    this.info = opts.info;
  }
}

module.exports = Message;