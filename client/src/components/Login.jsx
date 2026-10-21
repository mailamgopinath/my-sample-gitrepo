import React from "react";
import { Link } from "react-router-dom";
function Login()
{
    return (
        <>
          <div>
                <div>
                    <h1>Login Page</h1>
                </div>
                <div>
                    <form>
                        <div>
                            <label htmlFor="email">User Email</label>
                            <input type="email" name="email" placeholder="Enter User Email"/>
                        </div>
                        <div>
                            <label htmlFor="password">User Password</label>
                            <input type="password" name="password" placeholder="Enter User password"/>
                        </div>
                        <div>
                            <button type="submit">Login Now</button>
                        </div>
                    </form>
                    <div>
                        <button><Link to='/register'>If U Have No Account Please Register Now</Link></button>
                    </div>
                </div>
          </div>
        </>
    )
}
export default Login;