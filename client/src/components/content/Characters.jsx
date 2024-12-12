import { Fragment, useState, useEffect } from "react"
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap"
import DOMPurify from 'dompurify';

import CharacterCard from "../structural/CharacterCard"

import raceFeatures from '../../jsons/races.json';
import classFeatures from '../../jsons/classes.json';
import items from '../../jsons/items.json';
import attributes from '../../jsons/attributes.json';
import choiceLists from '../../jsons/choiceLists.json';

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
const classList = Object.keys(classFeatures);
const abilities = choiceLists["Ability"];
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
    "Skill": [], 
    "Alignment": ["Lawful", "Good"],
    "Equipment": [],
    "Rolled Gold": 0
}

const Characters = (props) => {
    const { onRoll } = props;
    const [isDiceRoll, setIsDiceRoll] = useState(false);
    const [activeCharacter, setActiveCharacter] = useState('');
    const [creatingCharacter, setCreatingCharacter] = useState(0);
    const [characterChoices, setCharacterChoices] = useState(baseChoices);

    //Manage Page Dice
    const rollAbility = async (ability) => {
        setIsDiceRoll(true);
        let result = await onRoll("4d6")
        let smallest = 7
        for(let dice of result["sets"][0]["rolls"]){
            if(dice.value < smallest){
                smallest = dice.value
            }
        }
        updateCharacterChoices(["Ability Scores", ability], result["sets"][0]["total"] - smallest)
    }   

    const rollGold = async () => {
        let result = await onRoll(classFeatures[characterChoices["Class"]]["Starting Equipment"]["Gold Alternative"].replace("x10", ""))
        result = result["sets"][0]["total"]
        if(characterChoices["Class"] !== "Monk"){
            result *= 10
        }

        updateCharacterChoices("Rolled Gold", result)
    }

    const setActive = (id) => {
        sessionStorage.setItem('selectedCharacter', id);
        setActiveCharacter(id);
    }

    const abilityModifier = (score) => Math.floor((score - 10) / 2);

    const getAbilityBonus = (ability) => {
        let main_race = raceFeatures["Main Races"][characterChoices["Race"]]["Ability Score Increase"].filter(score => score === ability).length
        let sub_race = raceFeatures["Sub Races"][characterChoices["Race"]]?.[characterChoices["Sub Race"]]?.["Ability Score Increase"].filter(score => score === ability).length
        main_race = main_race === undefined ? 0 : main_race
        sub_race = sub_race === undefined ? 0 : sub_race
        return main_race + sub_race
    }

    const findAttributeProficiencies = (key) => {
        key = key.split(" ")[0]
        //Find proficiencies in race
        let found = []
        for(let attribute of raceFeatures["Main Races"][characterChoices["Race"]]["Race Attributes"]){
            let attribute_body = attributes[attribute]
            let proficiencies = attribute_body?.["Effects"]?.["Proficiencies"]?.[key]
            if(proficiencies !== undefined){
                for(let proficiency of proficiencies){
                    if(!found.includes(proficiency)){
                        found.push(proficiency)
                    }
                }
            }
        }
        //Find proficiencies in subrace
        if(characterChoices["Sub Race"] !== "None"){
            for(let attribute of raceFeatures["Sub Races"][characterChoices["Race"]][characterChoices["Sub Race"]]["Attributes"]){
                let attribute_body = attributes[attribute]
                let proficiencies = attribute_body?.["Effects"]?.["Proficiencies"]?.[key]
                if(proficiencies !== undefined){
                    for(let proficiency of proficiencies){
                        if(!found.includes(proficiency)){
                            found.push(proficiency)
                        }
                    }
                }
            }
        }
        return found;
    }

    const filterForItem = (filter_list, properties) => {
        filter_list = items[filter_list]
        return Object.keys(filter_list).filter(item => {
            for(let property of properties){
                if(!filter_list[item].Attributes.includes(property)){
                    return false;
                }
            }
        return true;
    })}

    const filterForChoice = (filter_list) => {
        if(filter_list !== undefined){
            return filter_list.filter(attribute => {
                if(attributes[attribute]){
                    return attributes[attribute]["Choice"] === true
                }else{
                    return false
                }
            })
        }else{
            return []
        }
    }

    const updateCharacterChoices = (choice, value) => {
        let newCharacterChoices = {...characterChoices};
        if(Array.isArray(choice)){
            newCharacterChoices[choice.shift()][choice.shift()] = value
        }else{
            newCharacterChoices[choice] = value;
            if(choice === "Race"){
                newCharacterChoices["Sub Race"] = "None"
            }

            if(choice === "Class"){
                for(let proficiency of Object.keys(classFeatures[value]["Proficiencies"])){
                    if(Array.isArray(classFeatures[value]["Proficiencies"][proficiency][0])){
                        newCharacterChoices[proficiency] = []
                        for(let choiceGroup of classFeatures[value]["Proficiencies"][proficiency]){
                            let index = choiceGroup[0]
                            if(choiceGroup[1] === "Any"){
                                choiceGroup = [''].concat(choiceLists[choiceGroup[2]])
                            }

                            if(newCharacterChoices[proficiency].length < index){
                                newCharacterChoices[proficiency].push(choiceGroup[newCharacterChoices[proficiency].length + 1])
                            }else{
                                newCharacterChoices[proficiency][index - 1] = choiceGroup[index]
                            }
                        }
                    }
                }

                for(let equipmentChoice of Object.keys(classFeatures[value]["Starting Equipment"])){
                    if(equipmentChoice.includes("Choice")){
                        newCharacterChoices["Equipment"][equipmentChoice] = []
                        for(let choices of classFeatures[value]["Starting Equipment"][equipmentChoice]){
                            let toAdd = ''
                            if(choices[1] === "Any"){
                                if(choices[2].includes("Weapons")){
                                    let properties = choices[2].split(" ").filter(property => property !== "Weapons");
                                    toAdd = filterForItem("Weapons", properties)[0]
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
        let newCharacterChoices = {...characterChoices};
        newCharacterChoices["Equipment"][choice][index] = value;
        setCharacterChoices(newCharacterChoices)
    }

    const updateCharacterList = (listName, event) => {
        let id = parseInt(event.target.id.replace(/\D/g,'')) - 1;
        let value = event.target.value;
        let newCharacterChoices = {...characterChoices}

        newCharacterChoices[listName][id] = value;
        setCharacterChoices(newCharacterChoices)
    }

    const updateAlignment = (value, index) => {
        let newCharacterChoices = {...characterChoices}
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const res = await fetch('/', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(characterChoices)
        })
        console.log('Form submitted:', characterChoices);
      };

    useEffect(() => {
        let character = sessionStorage.getItem('selectedCharacter');
        if(character != null){
            setActiveCharacter(character);
        }
        updateCharacterChoices("Class", characterChoices["Class"]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /*<div 
    className="content" 
    dangerouslySetInnerHTML={
        {__html: DOMPurify.sanitize(
            attributes[classFeatures["Artificer"]["Levels"][0]["Features"][0]]["Description"]
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
                    <Form.Group as={Col} md={6} lg={4} xl={3} controlId="characterCreation.characterName">
                        <Form.Label>
                            Character Name
                        </Form.Label>
                        <Form.Control type="text" placeholder="Character Name" />
                    </Form.Group>

                    <Form.Group as={Col} md={6} lg={4} xl={3} controlId="characterCreation.characterClass">
                        <Form.Label>Class</Form.Label>
                        <Form.Select value={characterChoices["Class"]} onChange={e => updateCharacterChoices("Class", e.target.value)}>
                            {classList.map(className => <option key={className} value={className}>{className}</option>)}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group as={Col} md={6} lg={4} xl={3}>
                        <Form.Label>Subrace - Race</Form.Label>
                        <InputGroup className="mb-3">
                            <Form.Select value={characterChoices["Sub Race"]} id={"characterCreation.characterSubRace"} onChange={e => updateCharacterChoices("Sub Race", e.target.value)}>
                            {
                                raceFeatures["Main Races"][characterChoices["Race"]]["Sub Races"] !== undefined ? 
                                raceFeatures["Main Races"][characterChoices["Race"]]["Sub Races"].map(raceName => <option key={raceName} value={raceName}>{raceName}</option>) :
                                <option value="None">None</option>
                            }
                            </Form.Select>
                            <Form.Select value={characterChoices["Race"]} id={"characterCreation.characterRace"} onChange={e => updateCharacterChoices("Race", e.target.value)}>
                                {raceList.map(raceName => <option key={raceName} value={raceName}>{raceName}</option>)}
                            </Form.Select>
                        </InputGroup>
                        
                    </Form.Group>

                    <Form.Group as={Col} md={6} lg={4} xl={3}>
                        <Form.Label>Alignment</Form.Label>
                        <InputGroup className="mb-3">
                            <Form.Select value={characterChoices["Alignment"][0]} id={"characterCreation.characterAlignment1"} onChange={e => updateAlignment(e.target.value, 0)}>
                                {["Lawful", "Neutral", "Chaotic"].map(first => <option key={first}>{first}</option>)}
                            </Form.Select>
                            <Form.Select value={characterChoices["Alignment"][1]} id={"characterCreation.characterAlignment2"}onChange={e => updateAlignment(e.target.value, 1)}>
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
                        let bonus_amount = getAbilityBonus(ability);
                        return <Form.Group key={ability} as={Col} md={6} lg={4} xl={2} controlId={`characterCreation.character${ability}`}>
                                <Form.Label>
                                    {ability} {
                                    (classFeatures[characterChoices["Class"]] != null && classFeatures[characterChoices["Class"]]["Proficiencies"]["Saving Throws"].includes(ability)) 
                                    ? <strong>- Saving Throw</strong>
                                    : null}
                                </Form.Label>
                                <InputGroup className="mb-3">
                                    <Form.Control type="number" value={characterChoices["Ability Scores"][ability]} onChange={e => {
                                        if(!isDiceRoll){
                                            clampAbilities(e)
                                            if(characterChoices["Ability Scores"][ability] !== parseInt(e.target.value)){
                                                updateCharacterChoices(["Ability Scores", ability], parseInt(e.target.value))
                                            }
                                        }else{
                                            setIsDiceRoll(false)
                                        }
                                    }}/>
                                    <Button onClick={() => rollAbility(ability)}>Roll</Button>
                                    </InputGroup>
                                <p>Modifier: {bonus_amount > 0 ? 
                                    <Fragment>{abilityModifier(characterChoices["Ability Scores"][ability] + bonus_amount)}, Race Bonus: + {bonus_amount}
                                    </Fragment> : 
                                    abilityModifier(characterChoices["Ability Scores"][ability])}
                                </p>
                                
                            </Form.Group>
                    })}
                </Row>
                {filterForChoice(raceFeatures["Main Races"][characterChoices["Race"]]["Race Attributes"]).length > 0 
                || filterForChoice(raceFeatures["Sub Races"][characterChoices["Race"]]?.[characterChoices["Sub Race"]]?.["Attributes"]).length > 0 ? 
                //One of the race attributes has a choice
                <Fragment>
                <Form.Label>
                    <h3 className="section_header">Race Selections</h3>
                </Form.Label>
                <Row className="mb-3">
                    {filterForChoice(raceFeatures["Main Races"][characterChoices["Race"]]["Race Attributes"]).concat(
                        filterForChoice(raceFeatures["Sub Races"][characterChoices["Race"]]?.[characterChoices["Sub Race"]]?.["Attributes"])
                    ).map(attribute => {
                        let attribute_body = attributes[attribute];
                        let attribute_list = attribute_body["Choices"]
                        if(attribute_body["Choices"].length === 1){
                            attribute_list = choiceLists[attribute_body["Choices"][0].split(' ')[1]]
                        }
                        return <Form.Group key={attribute} as={Col} lg={3} controlId={`characterCreation.character${attribute}`}>
                                    <Form.Label>{attribute_body["Choice Title"]}</Form.Label>
                                    <Form.Select
                                    onChange={e => updateCharacterChoices(attribute, e.target.value)}
                                    value={characterChoices[attribute]}>
                                        {attribute_list.map(choice => <option key={choice}>{`${choice}`}</option>)}
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
                    {classFeatures[characterChoices["Class"]] !== undefined ?
                        <Fragment>
                        <Row className="mb-3">
                        {Object.keys(classFeatures[characterChoices["Class"]]["Proficiencies"]).map(key => {
                            //The proficiency is a choice
                            if(Array.isArray(classFeatures[characterChoices["Class"]]["Proficiencies"][key][0])){
                                let choiceGroups = classFeatures[characterChoices["Class"]]["Proficiencies"][key];
                                let foundProficiencies = findAttributeProficiencies(key)
                                return <Fragment key={key}>
                                    {choiceGroups.map(group => {
                                        let groupID = group[0]
                                        if(group[1] === "Any"){
                                            group = choiceLists[group[2]]
                                        }
                                        return <Form.Group key={groupID} as={Col} md={6} lg={4} xl={3} controlId={`characterCreation.character${key + groupID}`}>
                                                <Form.Label>{key} Proficiency</Form.Label>
                                                <Form.Select
                                                onChange={e => updateCharacterList(key, e)}
                                                value={characterChoices[key][groupID - 1]}>
                                                    {group[0] === groupID ? group.slice(1).map(choice => <option key={choice} disabled={characterChoices[key].includes(choice) || foundProficiencies.includes(choice)}>{`${choice}`}</option>)
                                                    : group.map(choice => <option key={choice} disabled={characterChoices[key].includes(choice) || foundProficiencies.includes(choice)}>{`${choice}`}</option>)}
                                                </Form.Select>
                                            </Form.Group>
                                    })}
                                </Fragment>
                            }
                            //The proficiency is forced
                            return <Fragment key={key}></Fragment>
                        })}
                        </Row>
                        <Form.Label>
                            <h3 className="section_header">Equipment Selections</h3>
                        </Form.Label>
                        <Form.Group as={Col} md={6} lg={4} xl={3}>
                            <Form.Label>Starting Equipment</Form.Label>
                            <div className="inline_radio">
                                <Form.Check
                                    inline
                                    label="Items"
                                    name="characterCreation.equipmentChoice"
                                    type="radio"
                                    id={`equipmentChoice-1`}
                                    checked={characterChoices["UsingStartingEquipment"]}
                                    onChange={() => updateCharacterChoices("UsingStartingEquipment", true)}
                                />
                                <Form.Check
                                    inline
                                    label="Gold"
                                    name="characterCreation.equipmentChoice"
                                    type="radio"
                                    id={`equipmentChoice-2`}
                                    checked={!characterChoices["UsingStartingEquipment"]}
                                    onChange={() => updateCharacterChoices("UsingStartingEquipment", false)}
                                />
                            </div>
                        </Form.Group>
                        <Row className="mb-3">
                            {characterChoices["UsingStartingEquipment"] ? 
                                <Fragment>
                                {Object.keys(classFeatures[characterChoices["Class"]]["Starting Equipment"]).filter(category => category !== "Gold Alternative").map(category => {
                                    if(Array.isArray(classFeatures[characterChoices["Class"]]["Starting Equipment"][category])){
                                        //The category is an array, which means you either get more than one item or you get a choice
                                        return <Fragment key={category.replaceAll(" ", "")}>
                                            {classFeatures[characterChoices["Class"]]["Starting Equipment"][category].map(element => {
                                                if(Array.isArray(element)){
                                                    //The element is an array, this item is a choice
                                                    if(element[1] === "Any"){
                                                        //Chose any of element[1]
                                                        if(element[2].includes("Weapons")){
                                                            let properties = element[2].split(" ").filter(property => property !== "Weapons");
                                                            let propertyMatchedWeapons = filterForItem("Weapons", properties)
                                                            for(let i = 3; i < element.length; i++){
                                                                propertyMatchedWeapons.push(element[i])
                                                            }
                                                            return <Form.Group key={element[0]} as={Col} md={6} lg={4} xl={3} controlId={`characterCreation.character${category.replaceAll(" ", "") + element[0]}`}>
                                                                    <Form.Label>{category}</Form.Label>
                                                                    <Form.Select onChange={e => updateCharacterEquipment(category, e.target.value, element[0] - 1)}>
                                                                    {propertyMatchedWeapons.map(weapon => {
                                                                        let quantity = weapon.split(" ")[0].replace(/\D/g,'')
                                                                        if(quantity !== ""){
                                                                            weapon = weapon.split(' ')[1]
                                                                        }
                                                                        return <option key={quantity + weapon} value={weapon}>{`${quantity} ${weapon} - 
                                                                            ${items["Weapons"][weapon] !== undefined ? items["Weapons"][weapon]["Damage"] : null} 
                                                                            ${items["Weapons"][weapon] !== undefined ? items["Weapons"][weapon]["Damage Type"] : null}`}
                                                                        </option>
                                                                    })}
                                                                    </Form.Select>
                                                                </Form.Group>
                                                        }else if(element[2].includes("Instrument")){
                                                            return <Form.Group key={element[0]} as={Col} md={6} lg={4} xl={3} controlId={`characterCreation.character${category.replaceAll(" ", "") + element[0]}`}>
                                                                    <Form.Label>{category}</Form.Label>
                                                                    <Form.Select onChange={e => updateCharacterEquipment(category, e.target.value, element[0] - 1)}>
                                                                    {choiceLists[element[2]].map(choice => {
                                                                        return <option key={choice} value={choice}>{choice}</option>
                                                                    })}
                                                                    </Form.Select>
                                                                </Form.Group>
                                                        }
                                                        return <p key={"BROKEN"}>{element[2]} Needs to be implemented</p>
                                                    }else{
                                                        //Chose one of any of the elements in element
                                                        return <Form.Group key={element[0]} as={Col} md={6} lg={4} xl={3} controlId={`characterCreation.character${category.replaceAll(" ", "")}`}>
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
                                    
                                    return <p key={category.replaceAll(" ", "")}>{classFeatures[characterChoices["Class"]]["Starting Equipment"][category]}</p>
                                })}
                                </Fragment>
                                :
                                <p>You chose to start with <Button onClick={() => rollGold()}>{characterChoices["Rolled Gold"] !== 0 ? characterChoices["Rolled Gold"] : classFeatures[characterChoices["Class"]]["Starting Equipment"]["Gold Alternative"]}</Button> gold</p>
                            }
                        
                        </Row>
                        </Fragment>
                        :
                        <p>This class has not been fleshed out yet</p>
                    }
                    <Button className="full_width mb-3" variant="primary" type="submit">
                        Create!
                    </Button>
            </Form>

            </Fragment>
            }
        </Container>
    </Fragment>
}

export default Characters