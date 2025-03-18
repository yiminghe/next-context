import { getNextContext } from 'next-context';

export default function ExtraContextInfo() {
  const { type, extraContent } = getNextContext();
  return (
    <>
      <div>from: {extraContent?.from || 'from: default extra context'}</div>
      <div>type: {type}</div>
    </>
  );
}
