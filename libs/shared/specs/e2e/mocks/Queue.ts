import * as crypto from 'crypto';

// some helper functions
function id() {
  return crypto.randomBytes(16).toString('hex');
}

function now() {
  return new Date().toISOString();
}

function nowPlusSecs(secs: number) {
  return new Date(Date.now() + secs * 1000).toISOString();
}

// the Queue class itself
export class Queue {
  public name: string;
  public visibility: number;
  public delay: number;
  public maxRetries: number;
  public deadQueue: Queue;

  private messages: any[] = [];

  constructor(name: string, opts: any) {
    if (!name) {
      throw new Error('Provide a queue name');
    }

    opts = opts || {};

    this.name = name;
    this.visibility = opts.visibility || 30;
    this.delay = opts.delay || 0;

    if (opts.deadQueue) {
      this.deadQueue = opts.deadQueue;
      this.maxRetries = opts.maxRetries || 5;
    }
  }

  createIndexes(callback: Function) {
    // this.col.createIndex({deleted: 1, visible: 1}, (err, indexname) => {
    //   if (err) {
    //     return callback(err);
    //   }
    //   this.col.createIndex({ack: 1}, {unique: true, sparse: true}, innerErr => {
    //     if (innerErr) {
    //       return callback(innerErr);
    //     }
    //     callback(null, indexname);
    //   });
    // });
  }

  add(payload: any, opts: any, callback?: Function) {
    if (!callback) {
      callback = opts;
      opts = {};
    }

    const delay = opts.delay || this.delay;
    const msg = {
      payload,
      _id: id(),
      visible: delay ? nowPlusSecs(delay) : now()
    };

    this.messages.push(msg);
    const results: any[] = [msg];

    callback(null, (results[0]._id as any).toString());
  }

  get(opts: any, callback?: Function) {
    if (!callback) {
      callback = opts;
      opts = {};
    }

    const visibility = opts.visibility || this.visibility;
    // const query = {
    //   visible: {$lt: now()},
    //   deleted: null
    // };
    // const sort = {
    //   _id: 1
    // };
    // const update = {
    //   $inc: {tries: 1},
    //   $set: {
    //     ack: id(),
    //     visible: nowPlusSecs(visibility),
    //     firstClaimed: now()
    //   }
    // };

    // if (opts.user) {
    //   (update.$set as any).user = opts.user;
    // }

    // self.col.findOneAndUpdate(
    //   query,
    //   update,
    //   {sort: sort, returnOriginal: false},
    //   (err, result) => {
    // {

    // find relevant messages of this Queue
    // const result = {
    //   lastErrorObject: {n: 1, updatedExisting: true},
    //   value: {
    //     _id: id(), // '5d89cd2d8b75dc678d89eeef',
    //     visible: update.$set.visible,
    //     payload: '{"body": "test" }',
    //     ack: update.$set.ack,
    //     firstClaimed: update.$set.firstClaimed,
    //     tries: 1
    //   },
    //   ok: 1
    // };

    //     if (err) {
    //       return callback(err);
    //     }

    let msg: any = this.messages.slice(-1)[0];

    if (!msg) {
      return callback();
    }

    msg.tries = 1;
    msg.firstClaimed = now();
    msg.ack = id();
    msg.visible = nowPlusSecs(visibility);
    if (msg._id) {
      msg.id = msg._id.toString();
      delete msg._id;
    }

    // if we have a deadQueue, then check the tries, else don't
    if (this.deadQueue) {
      // check the tries
      if (msg.tries > this.maxRetries) {
        // So:
        // 1) add this message to the deadQueue
        // 2) ack this message from the regular queue
        // 3) call ourself to return a new message (if exists)
        this.deadQueue.add(msg, addErr => {
          if (addErr) {
            return callback(addErr);
          }

          this.ack(msg.ack, ackErr => {
            if (ackErr) {
              return callback(ackErr);
            }

            this.get(callback);
          });
        });
        return;
      }
    }

    callback(null, msg);
  }

  ping(ack: any, opts: any, callback: Function) {
    if (!callback) {
      callback = opts;
      opts = {};
    }

    const visibility = opts.visibility || this.visibility;
    const query = {
      ack: ack,
      visible: {$gt: now()},
      deleted: null
    };
    const update = {
      $set: {
        visible: nowPlusSecs(visibility)
      }
    };

    // this.col.findOneAndUpdate(
    //   query,
    //   update,
    //   {returnOriginal: false},
    //   (err, msg) => {
    //     if (err) {
    //       return callback(err);
    //     }

    //     if (!msg.value) {
    //       return callback(
    //         new Error('Queue.ping(): Unidentified ack  : ' + ack)
    //       );
    //     }

    //     callback(null, msg.value._id.toHexString());
    //   }
    // );
  }

  ack(ack: any, callback: Function) {
    // const query = {
    //   ack: ack,
    //   visible: {$gt: now()},
    //   deleted: null
    // };
    // const update = {
    //   $set: {
    //     deleted: now()
    //   }
    // };
    // this.col.findOneAndUpdate(
    //   query,
    //   update,
    //   {returnOriginal: false},
    //   (err, msg) => {
    //     if (err) {
    //       return callback(err);
    //     }
    //     if (!msg.value) {
    //       return callback(new Error('Queue.ack(): Unidentified ack : ' + ack));
    //     }
    //     callback(null, msg.value._id.toHexString());
    //   }
    // );

    // find message by ack
    let msg = this.messages.find(m => m.ack === ack);

    if (!msg) {
      return callback(new Error('Queue.ack(): Unidentified ack : ' + ack));
    }
    msg.deleted = now();

    callback(null, msg.id.toString());
  }

  clean(callback: Function) {
    const query = {
      deleted: {$exists: true}
    };

    this.messages = [];

    //  this.col.deleteMany(query, callback);
  }

  total(callback: Function) {
    // this.col.count((err, count) => {
    //   if (err) {
    //     return callback(err);
    //   }
    //   callback(null, count);
    // });
  }

  size(callback: Function) {
    // const query = {
    //   visible: {$lt: now()},
    //   deleted: null
    // };

    // this.col.count(query, (err, count) => {
    //   if (err) {
    //     return callback(err);
    //   }

    //   callback(null, count);
    // });

    return callback(null, this.messages.length);
  }

  inFlight(callback: Function) {
    const query = {
      visible: {$gt: now()},
      ack: {$exists: true},
      deleted: null
    };

    // this.col.count(query, (err, count) => {
    //   if (err) {
    //     return callback(err);
    //   }

    //   callback(null, count);
    // });
  }

  done(callback: Function) {
    // const query = {
    //   deleted: {$exists: true}
    // };

    // self.col.count(query, (err, count) => {
    //   if (err) {
    //     return callback(err);
    //   }

    //   callback(null, count);
    // });
    callback(null, 0);
  }
}
