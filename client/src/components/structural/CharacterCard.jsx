import { Card, Button } from "react-bootstrap"

const CharacterCard = (props) => {
    const selected = Number(sessionStorage.getItem('selectedCharacter')) === props.id

    return <Card className="character_card">
    <Card.Img variant="top" src="/512x256.jpg" className="card_image"/>
    <Card.Body>
      <Card.Title className="card_text">{props.name}</Card.Title>
      <Card.Text className="card_text">
        Level | Class | Race {console.log(props)}
      </Card.Text>
      <Button variant="dark" disabled={selected} onClick={e => props.handleActivation(props.id)}>Set as active</Button>
      <Button className="right_float" variant="dark" onClick={e => props.handleActivation(props.id)}>View Character</Button>
    </Card.Body>
  </Card>
}

export default CharacterCard