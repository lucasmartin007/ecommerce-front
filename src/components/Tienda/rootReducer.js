import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import cartReducer from './cartReducer'
import loginReducer from "./loginReducer"


const persistConfig = {
key:"root",
storage,
whitelist:['login', 'itemsCarrito']
}

const rootReducer = combineReducers({
login:loginReducer,
cart:cartReducer
})

export default persistReducer(persistConfig, rootReducer)