const storeKey = '__next_context_store';

export function compose(middleware: Function[], context: any, ...args: any[]) {
  // layout page share middleware
  const store = context[storeKey] || (context[storeKey] = new Map());
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
      let existingPromise = store.get(fn);
      if (existingPromise) {
        await existingPromise;
        dispatch(i + 1);
      } else {
        existingPromise = Promise.resolve(
          fn(context, dispatch.bind(null, i + 1), ...args),
        );
        store.set(fn, existingPromise);
        return existingPromise;
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
