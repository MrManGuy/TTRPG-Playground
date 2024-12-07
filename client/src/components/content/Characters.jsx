import { Fragment, useState, useEffect } from "react"
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap"
import DOMPurify from 'dompurify';

import CharacterCard from "../structural/CharacterCard"

import raceFeatures from '../../jsons/races.json';
import classFeatures from '../../jsons/classes.json';
import weapons from '../../jsons/weapons.json';
import attributes from '../../jsons/attributes.json';

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
//["Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]
const classList = Object.keys(classFeatures["Main Classes"]);
const abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
const raceList = Object.keys(raceFeatures["Main Races"]);
const baseChoices = {
    "UsingStartingEquipment": true,
    "Class": classList[0],
    "Race": raceList[0],
    "Sub Race": "None", 
    "Ability Scores": {
        "Strength": 10,
        "Dexterity": 10,
        "Constitution": 10,
        "Intelligence": 10,
        "Wisdom": 10,
        "Charisma": 10,
    }, 
    "Skills": [], 
    "Alignment": ["Lawful", "Good"],
    "Equipment": []
}

const Characters = () => {
    const [activeCharacter, setActiveCharacter] = useState('');
    const [creatingCharacter, setCreatingCharacter] = useState(0);
    const [chartacterChoices, setCharacterChoices] = useState(baseChoices);

    const setActive = (id) => {
        sessionStorage.setItem('selectedCharacter', id);
        setActiveCharacter(id);
    }

    const abilityModifier = (score) => Math.floor((score - 10) / 2);

    const filterForItem = (filter_list, properties) => {
        return Object.keys(filter_list).filter(weapon => {
            for(let property of properties){
                if(!filter_list[weapon].Attributes.includes(property)){
                    return false;
                }
            }
        return true;
    })}

    const updateCharacterChoices = (choice, value) => {
        let newCharacterChoices = {...chartacterChoices};
        if(Array.isArray(choice)){
            newCharacterChoices[choice.shift()][choice.shift()] = value
        }else{
            newCharacterChoices[choice] = value;

            if(choice === "Class"){
                for(let skillList of classFeatures["Main Classes"][value]["Proficiencies"]["Skill Choice"]){
                    if(newCharacterChoices["Skills"].length < skillList[0]){
                        newCharacterChoices["Skills"].push(skillList[newCharacterChoices["Skills"].length + 1])
                    }else{
                        newCharacterChoices["Skills"][skillList[0] - 1] = skillList[skillList[0]]
                    }
                }

                for(let equipmentChoice of Object.keys(classFeatures["Main Classes"][value]["Starting Equipment"])){
                    if(equipmentChoice.includes("Choice")){
                        newCharacterChoices["Equipment"][equipmentChoice] = []
                        for(let choices of classFeatures["Main Classes"][value]["Starting Equipment"][equipmentChoice]){
                            let toAdd = ''
                            if(choices[1] === "Any"){
                                if(choices[2].includes("Weapons")){
                                    let properties = choices[2].split(" ").filter(property => property !== "Weapons");
                                    toAdd = filterForItem(weapons, properties)[0]
                                }
                            }else if(typeof choices[0] === "number"){
                                toAdd = choices[choices[0]]
                            }else{
                                toAdd = choices[0]
                            }
                            newCharacterChoices["Equipment"][equipmentChoice].push(toAdd)
                        }
                    }
                }
            }
        }
        setCharacterChoices(newCharacterChoices);
    }

    const updateCharacterEquipment = (choice, value, index) => {
        let newCharacterChoices = {...chartacterChoices};
        newCharacterChoices["Equipment"][choice][index] = value;
        setCharacterChoices(newCharacterChoices)
    }

    const updateCharacterSkills = (event) => {
        let id = parseInt(event.target.id.replace(/\D/g,'')) - 1;
        let value = event.target.value;
        let newCharacterChoices = {...chartacterChoices}

        newCharacterChoices["Skills"][id] = value;
        setCharacterChoices(newCharacterChoices)
    }

    const updateAlignment = (value, index) => {
        let newCharacterChoices = {...chartacterChoices}
        newCharacterChoices["Alignment"][index] = value
        setCharacterChoices(newCharacterChoices)
    }

    const clampAbilities = (e) => {
        let currVal = e.target.value;
        if(currVal > 18){
            e.target.value = 18;
        }else if(currVal < 3){
            e.target.value = 3;
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log('Form submitted:', chartacterChoices);
      };

    useEffect(() => {
        let character = sessionStorage.getItem('selectedCharacter');
        if(character != null){
            setActiveCharacter(character);
        }   
        updateCharacterChoices("Class", chartacterChoices["Class"]);
  
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /*<div 
    className="content" 
    dangerouslySetInnerHTML={
        {__html: DOMPurify.sanitize(
            attributes[classFeatures["Main Classes"]["Artificer"]["Levels"][0]["Features"][0]]["Description"]
            )}}>
    </div>*/
    return <Fragment>
        <Container fluid className="page_body">
            {
            creatingCharacter === 0 ? <Fragment>
            <Button onClick={e => setCreatingCharacter(1)} className="full_width">Create New Character</Button>
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
            <Button variant='danger' onClick={e => setCreatingCharacter(0)} className="full_width">Cancel Character Creation</Button>

            <Form onSubmit={handleSubmit}>
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
                        <Form.Select value={chartacterChoices["Class"]} onChange={e => updateCharacterChoices("Class", e.target.value)}>
                            {classList.map(className => <option key={className} value={className}>{className}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group as={Col} lg={3} controlId="characterCreation.characterRace">
                        <Form.Label>Subrace - Race</Form.Label>
                        <InputGroup className="mb-3">
                            <Form.Select value={chartacterChoices["Sub Race"]} onChange={e => updateCharacterChoices("Sub Race", e.target.value)}>
                            {
                                raceFeatures["Main Races"][chartacterChoices["Race"]]["Sub Races"] !== undefined ? 
                                raceFeatures["Main Races"][chartacterChoices["Race"]]["Sub Races"].map(raceName => <option key={raceName} value={raceName}>{raceName}</option>) :
                                <option value="None">None</option>
                            }
                            </Form.Select>
                            <Form.Select value={chartacterChoices["Race"]} onChange={e => updateCharacterChoices("Race", e.target.value)}>
                                {raceList.map(raceName => <option key={raceName} value={raceName}>{raceName}</option>)}
                            </Form.Select>
                        </InputGroup>
                        
                    </Form.Group>

                    <Form.Group as={Col} lg={3} controlId="characterCreation.characterAlignment">
                        <Form.Label>Alignment</Form.Label>
                        <InputGroup className="mb-3">
                            <Form.Select value={chartacterChoices["Alignment"][0]} onChange={e => updateAlignment(e.target.value, 0)}>
                                {["Lawful", "Neutral", "Chaotic"].map(first => <option key={first}>{first}</option>)}
                            </Form.Select>
                            <Form.Select value={chartacterChoices["Alignment"][1]} onChange={e => updateAlignment(e.target.value, 1)}>
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
                    {abilities.map(ability => {
                        let race_bonus = raceFeatures["Main Races"][chartacterChoices["Race"]]["Ability Score Increase"].includes(ability);
                        let bonus_amount = raceFeatures["Main Races"][chartacterChoices["Race"]]["Ability Score Increase"].filter(score => score === ability).length
                        return <Form.Group key={ability} as={Col} lg={2} controlId={`characterCreation.character${ability}`}>
                                <Form.Label>
                                    {ability} {
                                    (classFeatures["Main Classes"][chartacterChoices["Class"]] != null && classFeatures["Main Classes"][chartacterChoices["Class"]]["Proficiencies"]["Saving Throws"].includes(ability)) 
                                    ? <strong>- Saving Throw</strong>
                                    : null}
                                </Form.Label>
                                <Form.Control type="number" defaultValue={10} onChange={e => {
                                    clampAbilities(e)
                                    if(chartacterChoices["Ability Scores"][ability] !== parseInt(e.target.value)){
                                        updateCharacterChoices(["Ability Scores", ability], parseInt(e.target.value))
                                    }
                                }}/>
                                <p>Modifier: {race_bonus ? 
                                    <Fragment>{abilityModifier(chartacterChoices["Ability Scores"][ability] + bonus_amount)}, Race Bonus: +{bonus_amount}
                                    </Fragment> : 
                                    abilityModifier(chartacterChoices["Ability Scores"][ability])}
                                </p>
                            </Form.Group>
                    })}
                </Row>
                {raceFeatures["Main Races"][chartacterChoices["Race"]]["Race Attributes"].filter(attribute => {
                    if(attributes[attribute]){
                        return attributes[attribute]["Choice"] === true
                    }else{
                        return false
                    }
                }).length > 0 ? //One of the race attributes has a choice
                <Fragment>
                <Form.Label>
                    <h3 className="section_header">Race Selections</h3>
                </Form.Label>
                <Row className="mb-3">
                    {raceFeatures["Main Races"][chartacterChoices["Race"]]["Race Attributes"].filter(attribute => {
                        if(attributes[attribute]){
                            return attributes[attribute]["Choice"] === true
                        }else{
                            return false
                        }
                    }).map(attribute => {
                        let attribute_body = attributes[attribute];
                        return <Form.Group key={attribute} as={Col} lg={3} controlId={`characterCreation.character${attribute}`}>
                                    <Form.Label>{attribute_body["Choice Title"]}</Form.Label>
                                    <Form.Select
                                    onChange={e => updateCharacterChoices(attribute, e.target.value)}
                                    value={chartacterChoices[attribute]}>
                                        {attribute_body["Choices"].map(choice => <option key={choice}>{`${choice}`}</option>)}
                                    </Form.Select>
                                </Form.Group>
                    })}
                </Row>
                </Fragment>
                :
                null
                }
                {/* 
                    Dedicated prompts for whichever class was chosen
                */}
                <Form.Label>
                    <h3 className="section_header">Class Selections</h3>
                </Form.Label>
                    {classFeatures["Main Classes"][chartacterChoices["Class"]] !== undefined ?
                        <Fragment>
                        <Row className="mb-3">
                        <p><strong>Hit Die:</strong> {classFeatures["Main Classes"][chartacterChoices["Class"]]["Hit Die"]}</p>
                        {Object.keys(classFeatures["Main Classes"][chartacterChoices["Class"]]["Proficiencies"]).map(key => {
                            //The proficiency is a choice
                            if(Array.isArray(classFeatures["Main Classes"][chartacterChoices["Class"]]["Proficiencies"][key][0])){
                                let choiceGroups = classFeatures["Main Classes"][chartacterChoices["Class"]]["Proficiencies"][key];
                                return <Fragment key={key.replaceAll(" ", "")}>
                                {choiceGroups.map(group => {
                                    return <Form.Group key={group[0]} as={Col} lg={3} controlId={`characterCreation.character${key.replaceAll(" ", "") + group[0]}`}>
                                            <Form.Label>{key}</Form.Label>
                                            <Form.Select
                                            onChange={e => updateCharacterSkills(e)}
                                            value={chartacterChoices["Skills"][group[0] - 1]}>
                                                {group.slice(1).map(choice => <option key={choice} disabled={chartacterChoices["Skills"].includes(choice)}>{`${choice}`}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                })}
                                </Fragment>
                            }
                            //The proficiency is forced
                            return <p key={key.replaceAll(" ", "")}>
                                <strong>{key}:</strong> {classFeatures["Main Classes"][chartacterChoices["Class"]]["Proficiencies"][key].length !== 0 ? 
                                classFeatures["Main Classes"][chartacterChoices["Class"]]["Proficiencies"][key].join(', ') : 
                                "None"}
                            </p>
                        })}
                        </Row>
                        <Form.Label>
                            <h3 className="section_header">Equipment Selections</h3>
                        </Form.Label>
                        <Form.Group as={Col} lg={3} controlId="characterCreation.equipmentChoice">
                            <Form.Label>Starting Equipment</Form.Label>
                            <div className="inline_radio">
                                <Form.Check
                                    inline
                                    label="Items"
                                    name="equipmentChoice"
                                    type="radio"
                                    id={`equipmentChoice-1`}
                                    checked={chartacterChoices["UsingStartingEquipment"]}
                                    onChange={() => updateCharacterChoices("UsingStartingEquipment", true)}
                                />
                                <Form.Check
                                    inline
                                    label="Gold"
                                    name="equipmentChoice"
                                    type="radio"
                                    id={`equipmentChoice-2`}
                                    checked={!chartacterChoices["UsingStartingEquipment"]}
                                    onChange={() => updateCharacterChoices("UsingStartingEquipment", false)}
                                />
                            </div>
                        </Form.Group>
                        <Row className="mb-3">
                            {chartacterChoices["UsingStartingEquipment"] ? 
                                <Fragment>
                                {Object.keys(classFeatures["Main Classes"][chartacterChoices["Class"]]["Starting Equipment"]).filter(category => category !== "Gold Alternative").map(category => {
                                    if(Array.isArray(classFeatures["Main Classes"][chartacterChoices["Class"]]["Starting Equipment"][category])){
                                        //The category is an array, which means you either get more than one item or you get a choice
                                        return <Fragment key={category.replaceAll(" ", "")}>
                                            {classFeatures["Main Classes"][chartacterChoices["Class"]]["Starting Equipment"][category].map(element => {
                                                if(Array.isArray(element)){
                                                    //The element is an array, this item is a choice
                                                    if(element[1] === "Any"){
                                                        //Chose any of element[1]
                                                        if(element[2].includes("Weapons")){
                                                            let properties = element[2].split(" ").filter(property => property !== "Weapons");
                                                            let propertyMatchedWeapons = filterForItem(weapons, properties)
                                                            for(let i = 3; i < element.length; i++){
                                                                propertyMatchedWeapons.push(element[i])
                                                            }
                                                            return <Form.Group key={element[0]} as={Col} lg={3} controlId={`characterCreation.character${category.replaceAll(" ", "") + element[0]}`}>
                                                                    <Form.Label>{category}</Form.Label>
                                                                    <Form.Select onChange={e => updateCharacterEquipment(category, e.target.value, element[0] - 1)}>
                                                                    {propertyMatchedWeapons.map(weapon => {
                                                                        let quantity = weapon.split(" ")[0].replace(/\D/g,'')
                                                                        if(quantity !== ""){
                                                                            weapon = weapon.split(' ')[1]
                                                                        }
                                                                        return <option key={quantity + weapon} value={weapon}>{`${quantity} ${weapon} - 
                                                                            ${weapons[weapon] !== undefined ? weapons[weapon]["Damage"] : null} 
                                                                            ${weapons[weapon] !== undefined ? weapons[weapon]["Damage Type"] : null}`}
                                                                        </option>
                                                                    })}
                                                                    </Form.Select>
                                                                </Form.Group>
                                                        }
                                                        return <p key={"BROKEN"}>{element[2]} Needs to be implemented</p>
                                                    }else{
                                                        //Chose one of any of the elements in element
                                                        return <Form.Group key={element[0]} as={Col} lg={3} controlId={`characterCreation.character${category.replaceAll(" ", "")}`}>
                                                            <Form.Label>{category}</Form.Label>
                                                            <Form.Select onChange={e => updateCharacterEquipment(category, e.target.value, 0)}>
                                                                {element.map(choice => <option key={choice}>{choice}</option>)}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    }
                                                }
                                                return <Fragment key={element}></Fragment>
                                            })}
                                        </Fragment>
                                    }
                                    
                                    return <p key={category.replaceAll(" ", "")}>{classFeatures["Main Classes"][chartacterChoices["Class"]]["Starting Equipment"][category]}</p>
                                })}
                                </Fragment>
                                :
                                <p>You chose to start with {classFeatures["Main Classes"][chartacterChoices["Class"]]["Starting Equipment"]["Gold Alternative"]} gold</p>
                            }
                        
                        </Row>
                        </Fragment>
                        :
                        <p>This class has not been fleshed out yet</p>
                    }
                    <Button className="full_width" variant="primary" type="submit">
                        Create!
                    </Button>
            </Form>

            </Fragment>
            }
        </Container>
    </Fragment>
}

export default Characters