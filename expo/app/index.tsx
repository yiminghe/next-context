/// <reference types="react/canary" />

import React, { cache } from 'react';
import { Text, View } from 'react-native';
// import { getNextContext, withPageMiddlewares } from '../source/expo';

const cached = cache<() => { x?: string }>(() => ({}));

const Page = async () => {
  cached().x = 'hello';
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color: 'blue' }}>
        Hello, Expo!: {cached().x}
      </Text>
    </View>
  );
};

// withPageMiddlewares([])
export default Page;
