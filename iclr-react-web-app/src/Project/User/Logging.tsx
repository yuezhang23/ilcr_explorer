import * as client from "./client";
import { useEffect, useState } from "react";
import { useDispatch} from "react-redux";
import { setCurrentUser } from "../Reducers/userReducer";
import axios from "axios";
axios.defaults.withCredentials = true;

function Logging({ children } : {children: any}) {
  const [logging, setLogging] = useState(true);
  const dispatch = useDispatch();

  const fetchUser = async() => {
    try {
      setLogging(false);
      const user = await client.profile();
      dispatch(setCurrentUser(user));
    } catch (error: any) {
      console.log(error.response.data)
    }
  }

  
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      {!logging && children}
    </>
  );
}

export default Logging;