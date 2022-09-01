import React from 'react'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import { BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Home from './components/Home'
import {useSelector} from 'react-redux'

const App = () => {

  const object  = useSelector((state)=>state)
  console.log(object,"object in appjs")
  const {user} = object
  console.log(user,"user in appjs")
  console.log(object.user)
  const loggedIn = window.localStorage.getItem("isLoggedin")
  // window.localStorage.setItem("accessToken","Bearer "+ JSON.stringify(object.user.accessToken))

  return (
    <Router>
      <Routes>
          <Route path="/" element={loggedIn?<Home/>:<Login/>}/>
          <Route path="/login" element={user?<Home/>:<Login />}/>
          <Route path="/register" element={<Register/>}/>
      </Routes> 
    </Router>
  )
}

export default App