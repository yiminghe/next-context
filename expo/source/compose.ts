const storeKey = '__next_context_store';

interface MiddlewareRecord {
  next?: boolean;
  promise: Promise<any>;
}

export function compose(middleware: Function[], context: any, ...args: any[]) {
  // layout page share middleware

  const store: Map<Function, MiddlewareRecord> =
    context[storeKey] || (context[storeKey] = new Map());
  // last called middleware #
  let index = -1;
  return dispatch(0);
  async function dispatch(i: number): Promise<any> {
    if (i <= index)
      return Promise.reject(new Error('middleware called multiple times'));
    index = i;
    let fn = middleware[i];
    if (!fn) return Promise.resolve();
    try {
      const existing = store.get(fn);
      if (existing) {
        await existing.promise;
        if (existing.next) {
          return dispatch(i + 1);
        }
      } else {
        const record: MiddlewareRecord = {} as any;
        record.promise = Promise.resolve(
          fn(
            context,
            async () => {
              record.next = true;
              return dispatch(i + 1);
            },
            ...args,
          ),
        );
        store.set(fn, record);
        return record.promise;
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
