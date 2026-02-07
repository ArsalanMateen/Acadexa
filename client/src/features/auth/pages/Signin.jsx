import { useState } from "react";
export default function Signin() {
  const [values, setValues] = useState({"email":"","password":""});
  return <main><h1>Sign in</h1><form><label>email<input type="email" value={values.email} onChange={event => setValues({ ...values, email: event.target.value })} required /></label>
<label>password<input type="password" value={values.password} onChange={event => setValues({ ...values, password: event.target.value })} required /></label></form></main>;
}
