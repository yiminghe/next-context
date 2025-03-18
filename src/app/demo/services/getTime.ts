import { cache } from 'next-context';

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}
export const getTime = cache(async function () {
  const time = 10 + Math.floor(Math.random() * 10);
  await sleep(time);
  return time;
});

export async function testTime() {
  const [t3, t4] = await Promise.all([getTime(), getTime()]);
  const t1 = await getTime();
  const t2 = await getTime();
  return { t1, t2, t3, t4 };
}
