import { Col } from "react-bootstrap"

const StatSquare = ({size = 2, ...props}) => {
    return <Col xs={size} className="justify-content-center text-center">
        <div className="stat_square">
            <p className="stat_square_value">{props.value}</p>
            <p className="stat_square_title">{props.title}</p>
        </div>
    </Col>
}

export default StatSquare