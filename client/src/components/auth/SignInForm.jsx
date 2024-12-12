import { Form, Col, Button } from "react-bootstrap"
import { useState } from "react";

import { signInWithGooglePopup, signInAuthUserWithEmailAndPassword} from "../../utils/firebase/firebase";

const defaultFormFields = {
    email: '',
    password: ''
}

const SignInForm = () => {
    const [formFields, setFormFields] = useState(defaultFormFields);
    const { email, password } = formFields

    const signInWithGoogle = async () => {
        await signInWithGooglePopup();
    }

    const resetFormFields = () => {
        setFormFields(defaultFormFields);
    };

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormFields({ ...formFields, [name]: value })
    }

    const loginUser = async (event) => {
        event.preventDefault();

        try{
            await signInAuthUserWithEmailAndPassword(email, password)
            resetFormFields()
        }catch(error){
            switch(error.code){
                case "auth/wrong-password":
                    alert("Incorrect password or email")
                    break
                case "auth/user-not-found":
                    alert("No user found with this email")
                    break;
                default:
                    console.log(error)
            }
        }
    }

    return <Col md={4}>
        <h2 className="login_header">
            Already have an account?
        </h2>
        <h3 className="login_subheader">
            Login with your email and password
        </h3>
        <Form onSubmit={loginUser}>
            <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" onChange={handleChange} value={email} required></Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password" onChange={handleChange} value={password} required></Form.Control>
            </Form.Group>
            <Button className="mb-3" variant="primary" type="submit">Login</Button>
            <hr/>
            <Button className="mb-3" variant="success" type="button" onClick={signInWithGoogle}>Login With Google</Button>
        </Form>
    </Col>
}

export default SignInForm