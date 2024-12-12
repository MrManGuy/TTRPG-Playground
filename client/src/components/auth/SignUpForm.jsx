import { Form, Col, Button } from "react-bootstrap"
import { useState } from "react";
import { createAuthUserWithEmailAndPassword, createUserDocumentFromAuth, } from "../../utils/firebase/firebase";

const defaultFormFields = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
}

const SignUpForm = () => {
    const [formFields, setFormFields] = useState(defaultFormFields);
    const { displayName, email, password, confirmPassword } = formFields

    const resetFormFields = () => {
        setFormFields(defaultFormFields);
    };

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormFields({ ...formFields, [name]: value })
    }

    const signUpUser = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const { user } = await createAuthUserWithEmailAndPassword(email, password);
            await createUserDocumentFromAuth(user, { displayName });
            resetFormFields();
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                alert('Cannot create user, email already in use');
            } else {
                console.log('user creation encountered an error', error);
            }
        }
    }

    return <Col md={4}>
        <h2 className="login_header">
            I do not have an account
        </h2>
        <h3 className="login_subheader">
            Sign up with your email and password
        </h3>
        <Form onSubmit={signUpUser}>
            <Form.Group className="mb-3">
                    <Form.Label>Display Name</Form.Label>
                    <Form.Control type="text" name="displayName" onChange={handleChange} value={displayName} required></Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" onChange={handleChange} value={email} required></Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password" onChange={handleChange} value={password} required></Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" name="confirmPassword" onChange={handleChange} value={confirmPassword} required></Form.Control>
            </Form.Group>
            <Button className="mb-3" variant="primary" type="submit">Sign up</Button>
        </Form>
    </Col>
}

export default SignUpForm