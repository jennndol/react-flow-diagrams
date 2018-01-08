import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import undoableReducer from '../reducers';
import GraphContainer from '../containers/GraphContainer';

const store = createStore(undoableReducer);

const FlowDiagramApp = props => (
  <Provider store={store}>
    <GraphContainer />
  </Provider>
);

export default FlowDiagramApp;