import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../Reducers/userReducer";
import iclrReducer from "../Reducers/iclrReducer"
import pubDataReducer from "../Reducers/pubDataReducer"
import predictionReducer from "../Reducers/predictionReducer"
import promptTemplateReducer from "../Reducers/promptTemplateReducer"

export interface ProjectState {
  userReducer: {
    currentUser: any;
  }
  iclrReducer: {
    currentIclr: any[]
    currentIclrName: string
  }
  pubDataReducer: {
    pubData: any[]
  }
  predictionReducer: {
    currentPreds: any[]
  }
  promptTemplateReducer: {
    promptTemplates: any[]
  }
}

const store = configureStore({
  reducer: {
    userReducer,
    iclrReducer,
    pubDataReducer,
    predictionReducer,
    promptTemplateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['iclr/setIclr', 'prediction/setCurrentPreds'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.metareviews', 'payload.rebuttal'],
        // Ignore these paths in the state
        ignoredPaths: ['iclrReducer.currentIclr', 'predictionReducer.currentPreds'],
      },
    }),
});

export default store;