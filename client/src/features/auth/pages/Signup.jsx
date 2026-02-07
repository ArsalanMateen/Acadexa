import { useState } from "react";
export default function Signup() {
  const [values, setValues] = useState({"name":"","email":"","password":""});
  return <main><h1>Create account</h1><form><label>name<input type="text" value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} required /></label>
<label>email<input type="email" value={values.email} onChange={event => setValues({ ...values, email: event.target.value })} required /></label>
<label>password<input type="password" value={values.password} onChange={event => setValues({ ...values, password: event.target.value })} required /></label></form></main>;
}
