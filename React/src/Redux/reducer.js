import { FETCH_LOGIN_FAILURE,FETCH_LOGIN_SUCCESS,FETCH_LOGIN_REQUEST } from "./action";

const initialState = {
    user : null,
    isFetching : false,
    error : false
}

const loginReducer = (state=initialState,action) =>{
    switch(action.type){
        case FETCH_LOGIN_REQUEST :
            return {
                ...state,
                user:null,
                isFetching : true,
                error : false
            }
        case FETCH_LOGIN_SUCCESS : 
            return {
                ...state,
                user : action.payload,
                isFetching : false,
                error : false
            }
        case FETCH_LOGIN_FAILURE : 
            return {
                ...state,
                user : null,
                isFetching : false,
                error : true
            }
        
        default : 
            return state 
    }
}

export default loginReducer