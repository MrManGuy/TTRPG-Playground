import { Fragment } from "react"
import { Button, Row, Col, Form, InputGroup } from "react-bootstrap"

const SessionJoin = ({createSession, joinSession, ...props}) => {
    return <Fragment>
            <Row className="justify-content-sm-center mb-3">
                <Col lg="2">
                    <InputGroup >
                        <InputGroup.Text id="session-id">Session ID</InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Only needed for joining"
                            aria-label="Session ID"
                            aria-describedby="session-id"
                            value={props.id}
                            onChange={(e) => props.setId(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>
            <Row className="justify-content-sm-center mb-3">
                <Col lg="2">
                    <InputGroup >
                        <InputGroup.Text id="session-pin">Session PIN</InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Required"
                            aria-label="Session Pin"
                            aria-describedby="session-pin"
                            value={props.pin}
                            onChange={(e) => props.setPin(e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>
            <Row className="justify-content-sm-center">
                <Col md={2} lg={1}>
                    <Button style={{width:"100%"}} onClick={(e) => createSession()}>Start Session</Button>
                </Col>
                <Col md={2} lg={1}>
                    <Button style={{width:"100%"}} onClick={(e) => joinSession()}>Join Session</Button>
                </Col>
            </Row>
        </Fragment>
}

export default SessionJoin