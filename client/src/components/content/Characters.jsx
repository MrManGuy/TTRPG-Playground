import { Fragment, useState, useEffect } from "react"
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap"

import CharacterCard from "../structural/CharacterCard"

import raceFeatures from '../../jsons/races.json';
import classFeatures from '../../jsons/classes.json';
import weapons from '../../jsons/weapons.json';

let characterList = [{
    "id": 1,
    "name": "Char 1"
},
{
    "id": 2,
    "name": "Steve"
},
{
    "id": 3,
    "name": "Gobado"
},
{
    "id": 4,
    "name": "Test"
}]

const classList = ["Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]
const abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]
const raceList = ["Aasimar", "Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Tiefling"]

const Characters = () => {
    const [activeCharacter, setActiveCharacter] = useState('')
    const [creatingCharacter, setCreatingCharacter] = useState(0)

    const [selectedClass, setSelectedClass] = useState('Artificer')

    const setActive = (id) => {
        sessionStorage.setItem('selectedCharacter', id);
        setActiveCharacter(id);
    }

    const clampAbilities = (e) => {
        let currVal = e.target.value
        if(currVal > 18){
            e.target.value = 18
        }else if(currVal < 3){
            e.target.value = 3
        }
    }

    useEffect(() => {
        let character = sessionStorage.getItem('selectedCharacter')
        if(character != null){
            setActiveCharacter(character)
        }
    }, [])

    return <Fragment>
        <Container fluid className="page_body">
            {
            creatingCharacter === 0 ? <Fragment>
            <Button onClick={e => setCreatingCharacter(1)}>Create New Character</Button>
            <Row xs={1} sm={1} md={2} lg={3} xl={4} >
                {
                characterList.map(character =>
                    <Col className="pt-2" key={character.id}>
                        <CharacterCard {...character} handleActivation={(id) => setActive(id)}/>
                    </Col>
                )
                }
            </Row></Fragment>
            :<Fragment>
            <Button variant='danger' onClick={e => setCreatingCharacter(0)}>Cancel Character Creation</Button>

            <Form>
                {/* 
                    Main character information
                */}
                <Form.Label>
                    <h3 className="section_header">Base Character Features</h3>
                </Form.Label>
                <Row className="mb-3">
                    <Form.Group as={Col} lg={3} controlId="characterCreation.characterName">
                        <Form.Label>
                            Character Name
                        </Form.Label>
                        <Form.Control type="text" placeholder="Character Name" />
                    </Form.Group>

                    <Form.Group as={Col} lg={3} controlId="characterCreation.characterClass">
                        <Form.Label>Class</Form.Label>
                        <Form.Select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                            {classList.map(className => <option key={className} value={className}>{className}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group as={Col} lg={3} controlId="characterCreation.characterRace">
                        <Form.Label>Race</Form.Label>
                        <Form.Select>
                            {raceList.map(raceName => <option key={raceName}>{raceName}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group as={Col} lg={3} controlId="characterCreation.characterAlignment">
                        <Form.Label>Alignment</Form.Label>
                        <InputGroup className="mb-3">
                            <Form.Select>
                                {["Lawful", "Neutral", "Chaotic"].map(first => <option key={first}>{first}</option>)}
                            </Form.Select>
                            <Form.Select>
                                {["Good", "Neutral", "Evil"].map(last => <option key={last}>{last}</option>)}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>
                </Row>
                {/* 
                    Raw "rolls" for abilities
                */}
                <Form.Label>
                    <h3 className="section_header">Character Abilities</h3>
                    <h4 className="section_subheader">If you want to use values outside of the [3, 18] range, you will have to edit your character after creation</h4>
                </Form.Label>
                <Row className="mb-3">
                    {abilities.map(ability => 
                        <Form.Group key={ability} as={Col} lg={2} controlId={`characterCreation.character${ability}`}>
                            <Form.Label>
                                {ability} {
                                (classFeatures[selectedClass] != null && classFeatures[selectedClass]["Proficiencies"]["SavingThrows"].includes(ability)) 
                                ? <strong>- Saving Throw</strong>
                                : null}
                            </Form.Label>
                            <Form.Control type="number" defaultValue={10} onChange={e => clampAbilities(e)}/>
                        </Form.Group>
                    )}
                </Row>
                {/* 
                    Dedicated prompts for whichever class was chosen
                */}
                <Form.Label>
                    <h3 className="section_header">Class Selections</h3>
                </Form.Label>
                    {classFeatures["MainClasses"][selectedClass] !== undefined ?
                        <Fragment>
                        <Row className="mb-3">
                        <p><strong>Hit Die:</strong> {classFeatures["MainClasses"][selectedClass]["Hit Die"]}</p>
                        {Object.keys(classFeatures["MainClasses"][selectedClass]["Proficiencies"]).map(key => {
                            //The proficiency is a choice
                            if(Array.isArray(classFeatures["MainClasses"][selectedClass]["Proficiencies"][key][0])){
                                let choiceGroups = classFeatures["MainClasses"][selectedClass]["Proficiencies"][key]
                                return <Fragment key={key.replaceAll(" ", "")}>
                                {choiceGroups.map(group => {
                                    return <Form.Group key={group[0]} as={Col} lg={3} controlId={`characterCreation.character${key.replaceAll(" ", "") + group[0]}`}>
                                            <Form.Label>{key}</Form.Label>
                                            <Form.Select>
                                                {group.slice(1).map(choice => <option key={choice}>{`${choice}`}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                })}
                                </Fragment>
                            }
                            //The proficiency is forced
                            return <p key={key.replaceAll(" ", "")}>
                                <strong>{key}:</strong> {classFeatures["MainClasses"][selectedClass]["Proficiencies"][key].length !== 0 ? classFeatures["MainClasses"][selectedClass]["Proficiencies"][key].join(', ') : "None"}
                            </p>
                        })}
                        </Row>
                        <Row className="mb-3">
                        {Object.keys(classFeatures["MainClasses"][selectedClass]["Starting Equipment"]).map(category => {
                            if(Array.isArray(classFeatures["MainClasses"][selectedClass]["Starting Equipment"][category])){
                                //The category is an array, which means you either get more than one item or you get a choice
                                return <Fragment key={category.replaceAll(" ", "")}>
                                    {classFeatures["MainClasses"][selectedClass]["Starting Equipment"][category].map(element => {
                                        if(Array.isArray(element)){
                                            //The element is an array, this item is a choice
                                            if(element[1] === "Any"){
                                                //Chose any of element[1]
                                                if(element[2].includes("Weapons")){
                                                    let properties = element[2].split(" ").filter(property => property !== "Weapons")
                                                    let propertyMatchedWeapons = Object.keys(weapons).filter(weapon => {
                                                        for(let property of properties){
                                                            if(!weapons[weapon].Attributes.includes(property)){
                                                                return false
                                                            }
                                                        }
                                                        return true
                                                    })
                                                    return <Form.Group key={element[0]} as={Col} lg={3} controlId={`characterCreation.character${category.replaceAll(" ", "") + element[0]}`}>
                                                            <Form.Label>{category}</Form.Label>
                                                            <Form.Select>
                                                            {propertyMatchedWeapons.map(weapon => <option key={weapon}>{`${weapon} - ${weapons[weapon]["Damage"]} ${weapons[weapon]["Damage Type"]}`}</option>)}
                                                            </Form.Select>
                                                        </Form.Group>
                                                }
                                                return <p key={"BROKEN"}>{element[2]} Needs to be implemented</p>
                                            }else{
                                                //Chose one of any of the elements in element
                                                return <Form.Group as={Col} lg={3} controlId={`characterCreation.character${category.replaceAll(" ", "")}`}>
                                                    <Form.Label>{category}</Form.Label>
                                                    <Form.Select>
                                                        {element.map(choice => <option key={choice}>{choice}</option>)}
                                                    </Form.Select>
                                                </Form.Group>
                                            }
                                        }
                                        return <Fragment key={element}></Fragment>
                                    })}
                                </Fragment>
                            }

                            return <p key={category.replaceAll(" ", "")}>{classFeatures["MainClasses"][selectedClass]["Starting Equipment"][category]}</p>
                        })}
                        </Row>
                        </Fragment>
                        :
                        <p>This class has not been fleshed out yet</p>
                    }
            </Form>

            </Fragment>
            }
        </Container>
    </Fragment>
}

export default Characters