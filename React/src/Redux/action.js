import axios from 'axios'

export const FETCH_LOGIN_REQUEST  = 'FETCH_LOGIN_REQUEST'

export const FETCH_LOGIN_SUCCESS = 'FETCH_LOGIN_SUCCESS'

export const FETCH_LOGIN_FAILURE = 'FETCH_LOGIN_FAILURE'

export const loginRequested = () =>({
    type : FETCH_LOGIN_REQUEST
})


export const loginSuccess = (user) => ({
    type : FETCH_LOGIN_SUCCESS,
    payload : user
})


export const loginFailure = (error) => ({
    type : FETCH_LOGIN_FAILURE,
    payload : error
})

export const loginData = (data) => {
    return async (dispatch) => {
        try{
            dispatch(loginRequested())
            let res = await axios.post("http://localhost:4000/login",data)
            dispatch(loginSuccess(res.data.data))
        }
        catch(err){
            dispatch(loginFailure(err.message))
        }
    }
}