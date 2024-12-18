import {Col, Form} from 'react-bootstrap'

const SimpleGroup = ({label, ...otherProps}) => {
    return <Form.Group as={Col} md={6} lg={4} xl={3} controlId={`characterCreation.${label.replace(' ', '')}`}>
                <Form.Label>
                    {label}
                </Form.Label>
                <Form.Control {...otherProps}/>
            </Form.Group>
}

export default SimpleGroup