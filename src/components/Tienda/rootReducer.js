import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import dataReducer from "./dataReducer"


const persistConfig = {
key:"root",
storage,
whitelist:['data']
}

const rootReducer = combineReducers({
data:dataReducer
})

export default persistReducer(persistConfig, rootReducer)