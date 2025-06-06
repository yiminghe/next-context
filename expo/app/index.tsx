/// <reference types="react/canary" />

import React from 'react';
import { Text, View } from 'react-native';
import { getNextContext, withPageMiddlewares } from '../source/expo';

export default withPageMiddlewares([])(async (...args) => {
  console.log('arguments', args);
  console.log('context', getNextContext());
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color: 'blue' }}>Hello, Expo!</Text>
    </View>
  );
});
