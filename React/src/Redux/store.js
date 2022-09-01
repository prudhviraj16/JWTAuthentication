import {createStore,applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import reduxThunk from 'redux-thunk'
import loginReducer from './reducer';



const store = createStore(loginReducer,
    applyMiddleware(reduxThunk,createLogger()))

export default store