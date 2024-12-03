import { Fragment, useState, useEffect } from "react"
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap"

import CharacterCard from "../structural/CharacterCard"

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

const classFeatures = {
    "Artificer": {
        'HitDie': '1d8',
        'Proficiencies': {
            'Armor': ['Light', 'Medium', 'Shields'],
            'Weapons': ['Simple'],
            'Tools': ["Thieves' tools", "Tinker's tools"],
            'SavingThrows': ['Constitution', 'Intelligence'],
            'SkillPool': ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand']
        },
        "SpellSlots": [2, 2, 0, 0, 0, 0],
    },
    "Barbarian": {
        'HitDie': '1d12',
        'Proficiencies': {
            'Armor': ['Light', 'Medium', 'Shields'],
            'Weapons': ['Simple', 'Martial'],
            'Tools': [],
            'SavingThrows': ['Strength', 'Constitution'],
            'SkillPool': ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival']
        },
        "SpellSlots": [0, 0, 0, 0, 0, 0],
    }
}

const raceList = ["Aasimar", "Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Tiefling"]
const raceFeatures = {
    "Aasimar": {
        "AbilityScoreIncrease": ["2,1","1,1,1"],
        "CreatureType": "Humanoid",
        "SizeOptions": ["Medium", "Small"],
        "Speed": 30,
        "Darkvision": true,
        "Resistances": ["Necrotic", "Radiant"],
        "Languages": ["Common", "Other"]
        //TODO: Healing Hands, Light Berard, & Celesital Revelation
    },
    "Dragonborn": {
        "AbilityScoreIncrease": ["Strength", "Strength", "Charisma"],
        "CreatureType": "Humanoid",
        "SizeOptions": ["Medium"],
        "Speed": 30,
        "Darkvision": false,
        "Resistances": [],
        "Languages": ["Common", "Draconic"],
        "DragonColor": ["Black", "Blue", "Brass", "Bronze", "Copper", "Gold", "Green", "Red", "Silver", "White"]
        //TODO: Breath weapon, associated damage resistance
    },
    "Dwarf": {
        "AbilityScoreIncrease": ["Constitution", "Constitution"],
        "CreatureType": "Humanoid",
        "SizeOptions": ["Medium"],
        "Speed": 25,
        "Darkvision": true,
        "Resistances": ["Poison"],
        "Proficiencies": {
            "SavingThrows": ["Poison"],
            "Weapons": ["Battleaxe", "Handaxe", "Light hammer", "Warmhammer"],
            "Tools": ["smith's tools", "brewer's supplies", "mason's tools"] //TODO: Choose 1
        },
        "Languages": ["Common", "Dwarvish"]
        //TODO: Subraces, stonecunning
    },
    "Elf":{
        "AbilityScoreIncrease": ["Dexterity", "Dexterity"],
        "CreatureType": "Humanoid",
        "SizeOptions": ["Medium"],
        "Speed": 30,
        "Darkvision": true,
        "Proficiencies": {
            "SavingThrows": ["Charmed"],
            "Skills": ["Perception"]
        },
        "Languages": ["Common", "Elvish"]
        //TODO: Magic cannot put you to sleep, trance, subraces
    }, 
    "Gnome": {
        "AbilityScoreIncrease": ["Intelligence", "Intelligence"],
        "CreatureType": "Humanoid",
        "SizeOptions": ["Small"],
        "Speed": 25,
        "Darkvision": true,
        "Proficiencies": {
            "SavingThrows": ["Intelligence", "Wisdom", "Charisma"],
            "Skills": ["Perception"]
        },
        "Languages": ["Common", "Gnomish"]
        //TODO: Subraces
    }, 
    "Goliath": {
        "AbilityScoreIncrease": ["Strength", "Strength", "Constitution"],
        "CreatureType": "Humanoid",
        "SizeOptions": ["Medium"],
        "Speed": 30,
        "Darkvision": false,
        "Resistances": ["Cold"],
        "Proficiencies": {
            "Skills": ["Athletics"]
        },
        "Languages": ["Common", "Giant"]
        //TODO: Powerful Build, Stone's endurance
    }, 
    "Halfling": {
        "AbilityScoreIncrease": ["Dexterity", "Dexterity"],
        "CreatureType": "Humanoid",
        "SizeOptions": ["Small"],
        "Speed": 25,
        "Darkvision": false,
        "Proficiencies": {
            "SavingThrows": ["Frightened"]
        },
        "Languages": ["Common", "Halfling"]
        //TODO: Lucky, Nimble, subraces
    }, 
    "Human": {
        "AbilityScoreIncrease": ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"],
        "CreatureType": "Humanoid",
        "SizeOptions": ["Medium"],
        "Speed": 30,
        "Darkvision": false,
        "Languages": ["Common", "Other"]
        //TODO: Variant
    },
    "Tiefling": {
        "AbilityScoreIncrease": ["Charisma", "Charisma"],
        "CreatureType": "Humanoid",
        "SizeOptions": ["Medium"],
        "Speed": 30,
        "Darkvision": true,
        "Resistances": ["Fire"],
        "Languages": ["Common", "Infernal"]
        //TODO: Bloodlines
    }
}

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
            creatingCharacter === 0 ? <>
            <Button onClick={e => setCreatingCharacter(1)}>Create New Character</Button>
            <Row xs={1} sm={1} md={2} lg={3} xl={4} >
                {
                characterList.map(character =>
                    <Col className="pt-2" key={character.id}>
                        <CharacterCard {...character} handleActivation={(id) => setActive(id)}/>
                    </Col>
                )
                }
            </Row></>
            :<>
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
                            {raceList.map(raceName => <option>{raceName}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group as={Col} lg={3} controlId="characterCreation.characterAlignment">
                        <Form.Label>Alignment</Form.Label>
                        <InputGroup className="mb-3">
                            <Form.Select>
                                {["Lawful", "Neutral", "Chaotic"].map(first => <option>{first}</option>)}
                            </Form.Select>
                            <Form.Select>
                                {["Good", "Neutral", "Evil"].map(last => <option>{last}</option>)}
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
                    {abilities.map(attribute => 
                        <Form.Group as={Col} lg={2} controlId={`characterCreation.character${attribute}`}>
                            <Form.Label>
                                {attribute} {
                                (classFeatures[selectedClass] != null && classFeatures[selectedClass].Proficiencies.SavingThrows.includes(attribute)) 
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
                <Row className="mb-3">
                    {classFeatures[selectedClass] !== undefined ?
                        <>
                        <p><strong>Hit Die:</strong> {classFeatures[selectedClass].HitDie}</p>
                        <ul>
                            {Object.keys(classFeatures[selectedClass].Proficiencies).map(key => (
                                <li key={key}>
                                    <strong>{key}:</strong> {classFeatures[selectedClass].Proficiencies[key].length !== 0 ? classFeatures[selectedClass].Proficiencies[key].join(', ') : "None"}
                                </li>
                            ))}
                        </ul>
                        </>
                        :
                        <p>This class has not been fleshed out yet</p>
                    }
                </Row>
            </Form>

            </>
            }
        </Container>
    </Fragment>
}

export default Characters