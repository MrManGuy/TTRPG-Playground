import { Card, Button } from "react-bootstrap"

const CharacterCard = ({character, ...props}) => {
    const selected = props.id === character.id

    return <Card className="character_card">
    <Card.Img variant="top" src={character["img"] === undefined ? "/512x256.jpg" : character["img"]} className="card_image"/>
    <Card.Body>
      <Card.Title className="card_text">{character["Name"]}</Card.Title>
      <Card.Text className="card_text">
        {character["Body"]["Stats"]["Level"]} | {character["Body"]["Class"]} | {character["Body"]["Race"]}
      </Card.Text>
      <Button variant="dark" disabled={selected} onClick={e => props.handleActivation(character.id)}>
      {selected ? "Active Character" : "Set as Active"}</Button>
      <Button className="right_float" variant="dark" onClick={e => props.handleView(character)}>View Character</Button>
    </Card.Body>
  </Card>
}

export default CharacterCard