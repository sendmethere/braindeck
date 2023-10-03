import dynamic from 'next/dynamic';
import React from 'react';

const DynamicComponentWithNoSSR = dynamic(
  () => import('./braindeck'),
  { ssr: false }
);

export default function Page() {
  return (
    <div>
      <DynamicComponentWithNoSSR />
    </div>
  );
}