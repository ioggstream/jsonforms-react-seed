import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { combineReducers, createStore, Reducer, AnyAction } from 'redux';
import { Actions, jsonformsReducer, JsonFormsState } from '@jsonforms/core';
import {
  materialCells,
  materialRenderers
} from '@jsonforms/material-renderers';
import RatingControl from './RatingControl';
import ratingControlTester from './ratingControlTester';
import MarkdownControl from './MarkdownControl';
import markdownControlTester from './markdownControlTester';

import { devToolsEnhancer } from 'redux-devtools-extension';
const yaml = require("js-yaml");
const refParser = require("json-schema-ref-parser");


const initState: JsonFormsState = {
  jsonforms: {
    cells: materialCells,
    renderers: materialRenderers
  }
};

const rootReducer: Reducer<JsonFormsState, AnyAction> = combineReducers({
  jsonforms: jsonformsReducer()
});
const store = createStore(rootReducer, initState, devToolsEnhancer({}));

const p = new URLSearchParams(window.location.search).get("q") || "form-3";
const schema_url = p + '/schema.yaml'
const uischema_url = p + '/uischema.yaml'

const fetchYaml = async (url: string, dereference: boolean = false) => {
  const text = await (await fetch(url)).text();
  const y = yaml.safeLoad(text);
  console.debug(url, y);

  if (!dereference)
    return y;

  try {
    const schema = await refParser.dereference(y);
    return schema;
  } catch (err) {
    console.error("Cannot dereference", err);
    throw err;
  }
}

fetchYaml(schema_url)
  .then((schema_yaml) => {
    refParser.dereference(schema_yaml, (err: any, schema: any) => {
      if (err) {
        console.error(err);
        throw err;
      }
      console.log(schema);
      fetchYaml(uischema_url, true)
        .then((uischema) => {
          const data = uischema._meta?.data || {};
          store.dispatch(Actions.init(data, schema, uischema));
        });
    });
  });


// Register custom renderer for the Redux tab
store.dispatch(Actions.registerRenderer(ratingControlTester, RatingControl));
store.dispatch(Actions.registerRenderer(markdownControlTester, MarkdownControl));

ReactDOM.render(<App store={store} />, document.getElementById('root'));
registerServiceWorker();
