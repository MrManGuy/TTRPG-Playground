import { Col } from "react-bootstrap"

const AbilityScore = ({saves = [], convertModifier, ...props}) => {
    return <Col xs={2} className="justify-content-center text-center ability_score">
        <div className="ability_score_header">
            <p className="ability_score_mod">{convertModifier(props["values"]["M"])}</p>
            <p className="ability_score_value">{props["values"]["S"]}</p>
        </div>
        <p className="ability_score_name">{props["score"].substring(0, 3)}{saves.includes(props["score"]) ? " - Proficient" : ""}</p>
    </Col>
}

export default AbilityScore