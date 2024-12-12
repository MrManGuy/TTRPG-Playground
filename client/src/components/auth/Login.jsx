import { Container, Row, Col } from "react-bootstrap";

import SignUpForm from "./SignUpForm";
import SignInForm from "./SignInForm";

const Login = () => {
    return <Container fluid className="page_body">
        <Row>
            <Col md={1}></Col>
            <SignInForm />
            <Col md={2}></Col>
            <SignUpForm />
        </Row>
    </Container>;
}

export default Login