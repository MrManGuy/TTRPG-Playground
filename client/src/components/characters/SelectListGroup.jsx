import {Col, Form} from 'react-bootstrap'

const SelectListGroup = ({label, options = undefined, checkLists = [], ...otherProps}) => {
    if(options === undefined){
        options = ["None"]
    }


    return <Form.Group as={Col} md={6} lg={4} xl={3} controlId={`characterCreation.${label.replace(' ', '')}`}>
                <Form.Label>
                    {label.replace(/\d/g,'')}
                </Form.Label>
                <Form.Select {...otherProps}>
                    {options.map(option => <option key={option} disabled={checkLists.includes(option)} value={option}>{option}</option>)}
                </Form.Select>
            </Form.Group>
}

export default SelectListGroup