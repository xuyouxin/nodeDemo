import { appendString, readString, writeString } from "../util/utils";

export enum PropagationType {
  REQUIRED,
  PROPAGATION_SUPPORTS,
  PROPAGATION_MANDATORY,
  PROPAGATION_REQUIRES_NEW,
  PROPAGATION_NOT_SUPPORTED,
  PROPAGATION_NEVER,
}

export type TransactionalOptions = {
  readOnly?: boolean;
  propagation?: PropagationType;
}

export function Transactional(options?: TransactionalOptions) {

  options = options || {};
  options.propagation = options.propagation || PropagationType.REQUIRED;
  options.readOnly = options.readOnly || false;

  return (target: any, name: string, descriptor: PropertyDescriptor) => {

    const method = descriptor.value;

    const transactionType = options.readOnly ? "只读事务" : "事务";

    descriptor.value = function (args: any[]) {

      let result;

      const transactionContent = readString("a.txt");

      switch (options.propagation) {
        case PropagationType.REQUIRED: // 支持当前事务，如果当前没有事务，就新建一个事务
          if (existsTrasaction(transactionContent)) {
            appendString(`------在当前事务中执行------\n`, "a.txt");
            result = method.call(this, args);
          } else {
            writeString(`------开始${transactionType}------\n`, "a.txt");
            result = method.call(this, args);
            appendString(`------结束${transactionType}------\n`, "a.txt");
          }
          break;
        case PropagationType.PROPAGATION_SUPPORTS: // 支持当前事务，如果当前没有事务，就以非事务方式执行
          if (existsTrasaction(transactionContent)) {
            appendString(`------在当前事务中执行------\n`, "a.txt");
            result = method.call(this, args);
          } else {
            appendString(`------以非事务方式执行------\n`, "a.txt");
            result = method.call(this, args);
          }
          break;
        case PropagationType.PROPAGATION_MANDATORY: // 支持当前事务，如果当前没有事务，就抛出异常
          if (existsTrasaction(transactionContent)) {
            appendString(`------在当前事务中执行------\n`, "a.txt");
            result = method.call(this, args);
          } else {
            throw new Error("当前没有事务")
          }
          break;
        case PropagationType.PROPAGATION_REQUIRES_NEW: // 新建事务，如果当前存在事务，把当前事务挂起
          break;
        case PropagationType.PROPAGATION_NOT_SUPPORTED: // 以非事务方式执行操作，如果当前存在事务，就把当前事务挂起
          appendString(`------以非事务方式执行------\n`, "a.txt");
          result = method.call(this, args);
          break;
        case PropagationType.PROPAGATION_NEVER: // 以非事务方式执行，如果当前存在事务，则抛出异常
          if (existsTrasaction(transactionContent)) {
            throw new Error("当前存在事务")
          } else {
            appendString(`------以非事务方式执行------\n`, "a.txt");
            result = method.call(this, args);
          }
          break;
      }

      return result;
    };
  }
}

function existsTrasaction(transactionContent: string) {
  return transactionContent.startsWith("------开始") && !(transactionContent.startsWith("------开始") && transactionContent.includes("------结束"))
}
