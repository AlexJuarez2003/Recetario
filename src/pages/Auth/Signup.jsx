import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserProvider";

const Signup = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const {name, value} =  e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  };

  const input = useRef(null);

  // const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const { setUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("token", data.token);

      navigate('/perfil');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  return (<>
  <div className="flex flex-col w-lvw h-lvh justify-center gap-7 items-center bg-amber-100">
    <div className="flex flex-col h-120 justify-around gap-1 w-112.5 items-center bg-white rounded-2xl pt-2 pb-2">
      <h1 className="font-bold text-2xl">Registrarse!</h1>

      <form onSubmit={handleSubmit} className="flex flex-col h-100 justify-around gap-1 w-112.5 items-center">
        <label className="flex flex-col w-3/4 gap-2">
          Nombre:
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Francisco Ríos..." ref={input} className="border-2 rounded p-2" required />
        </label>
        <label className="flex flex-col w-3/4 gap-2">
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="pancho@gmail.com" className="border-2 rounded p-2" required />
        </label>
        <label className="flex flex-col w-3/4 gap-2">
          Contraseña:
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="border-2 rounded p-2" required />
        </label>
        <button type="submit" className="w-1/2 p-2 bg-amber-800 text-white border-2 rounded-2xl cursor-pointer">Registrarse</button>
      </form>
    </div>
  </div>
  </>);
}

export default Signup;