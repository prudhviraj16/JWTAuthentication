import React,{useState,useEffect} from 'react'
import axios from 'axios'
import {useSelector,useDispatch} from 'react-redux'
import { loginData } from '../Redux/action';
import './Login.css'
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router' ;


const Login = () => {
 
    const [data,setData] = useState({
        email : '',
        password : ''
      }) 

      const [user,setUser] = useState(null)

      const navigate = useNavigate()


      const dispatch = useDispatch()  
      useEffect(()=>{
        dispatch(loginData(data))
      },[dispatch])


      const handleChange = (e) =>{
        const {name,value} = e.target
    
          setData(prevState=>{
          return {
            ...prevState,
            [name] : value
          }
        })
      }

      const submitHandler = (e) =>{
        e.preventDefault();
        try{
          axios.post('http://localhost:4000/login',data).then(res=>{
            if(res.data.data.accessToken){
              window.localStorage.setItem("token",res.data.data.accessToken)
              window.localStorage.setItem("isLoggedin","true")
            }
          }).catch(err=>console.log(err))

          navigate('/')
        }
        catch(err){
          console.log(err);
        }

      }
      
  return (
    <div className="login">
    <div className="loginWrapper">
      <div className="loginLeft">
        <h3 className="loginLogo">FaceDict</h3>
        <span className="loginDesc">
          Connect with friends and the world around you on Lamasocial.
        </span>
          
      </div>
      <div className="loginRight">
        <form className="loginBox" onSubmit={submitHandler} >
          <input
            placeholder="Email"
            name = "email"
            type="email"
            required
            className="loginInput"
            onChange={handleChange}
          />
          <input
            placeholder="Password"
            type="password"
            name = "password"
            required
            minLength="6" 
            className="loginInput"
            onChange={handleChange} 
          />
            <button className="loginButton" type="submit" onClick={()=>dispatch(loginData(data))}>Log In
            </button>
            <span className="loginForgot">Forgot Password?</span>
            <Link to="/register" style={{display:"flex",alignItems: "center",justifyContent: "center",textDecoration: "none"}}>
              <button className="loginRegisterButton">
                Create a New Account
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login