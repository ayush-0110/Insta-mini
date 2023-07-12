import { React } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Main({ username, setUsername, email, setEmail, phone, setPhone }) {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
  
    axios.post('https://multiii.onrender.com/enter', {
      username: username,
      email: email,
      phone: phone
    })
    .then(response => {
      console.log(response.data);
      navigate("/home");
    })
    .catch(error => {
      console.error("An error occurred while registering the user:", error);
    });
  };
  
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f1faf5",
      }}
    >
      <div
        style={{
          width: "50%",
          height: "60%",
          backgroundColor: "#e1f5fe",
          padding: "20px",
          border: "5px solid #0080ff",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
       
          // maxHeight: '90%',
        }}
      >
        <div style={{height:'10%'}}>

        <h1 className="heading1">Welcome!!</h1>
        </div>
        <form className="login__form" onSubmit={handleRegister}>
          <label htmlFor="username" className="labels">
            Enter your Name
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="input"
            required
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <label htmlFor="email" className="labels">
            Enter your Email
          </label>
          <input
            type="email"
            name="email"
            className="input"
            id="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <label htmlFor="phone" className="labels">
            Enter your Phone number(with country code. Eg. +1)
          </label>
          <input
            type="tel"
            name="phone"
            className="input"
            id="phone"
            required
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
          />

          <div className="button-container">
            <button type="submit" className="btn1">
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Main;
