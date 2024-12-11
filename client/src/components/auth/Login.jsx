import { Button, Container } from "react-bootstrap";
import { signInWithGooglePopup, creatUserDocumentFromAuth } from "../../utils/firebase/firebase";

const Login = () => {
    const logGoogleUser = async () => {
        const { user } = await signInWithGooglePopup();
        const userDoc = await creatUserDocumentFromAuth(user)
    }

    return <Container fluid className="page_body">
        <Button onClick={logGoogleUser}>Login</Button>
    </Container>;
}

export default Login