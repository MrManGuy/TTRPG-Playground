import { Fragment, useState, useEffect, useContext } from "react"
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap"
import DOMPurify from 'dompurify';
import { UserContext } from "../../contexts/user";

import CharacterCard from "./CharacterCard"
import SimpleGroup from "./SimpleGroup";
import SelectListGroup from "./SelectListGroup";

import raceFeatures from '../../jsons/races.json';
import classFeatures from '../../jsons/classes.json';
import items from '../../jsons/items.json';
import attributes from '../../jsons/attributes.json';
import choiceLists from '../../jsons/choiceLists.json';
import CharacterView from "./CharacterView";
import UserNotSignedIn from "../auth/UserNotSignedIn";

//["Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]
const classList = Object.keys(classFeatures);
const abilities = choiceLists["Ability"];
const raceList = Object.keys(raceFeatures["Main Races"]);
const baseChoices = {
    "UsingStartingEquipment": true,
    "Game": "DND 5e",
    "Class": classList[0],
    "Sub Class": "None",
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
    "Equipment": {},
    "Rolled Gold": 0
}

const Characters = (props) => {
    const { onRoll } = props;
    const [isDiceRoll, setIsDiceRoll] = useState(false);
    const [activeCharacter, setActiveCharacter] = useState(null);
    const [creatingCharacter, setCreatingCharacter] = useState(false);
    const [viewingCharacter, setViewingCharacter] = useState(false);
    const [characterList, setCharacterList] = useState([]);
    const [characterChoices, setCharacterChoices] = useState(baseChoices);
    const { currentUser } = useContext(UserContext)

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
                newCharacterChoices["Equipment"] = {}
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
                                if(choices[2].includes("Instruments")){
                                    let properties = choices[2].split(" ").filter(property => property !== "Instruments");
                                    toAdd = filterForItem("Instruments", properties)[0]
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

    const changeScreen = (id) => {
        setViewingCharacter(true)
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(JSON.stringify({uid: currentUser.uid, ...characterChoices }))
        const res = await fetch('http://localhost:3001/characters', {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({uid: currentUser.uid, ...characterChoices })
        })
        setCreatingCharacter(false)
      };

    useEffect(() => {
        updateCharacterChoices("Class", characterChoices["Class"]);

        setCharacterList([{
            "Name": 'Test',
            "Owner": 'DV2LIgWhTCf5BpWqEDz4UXBCPnz2',
            "Game": 'DND 5e',
            "id": 'f171d4ec-5508-46f9-b465-e9b869913f64',
            "img": "https://hatrabbits.com/wp-content/uploads/2017/01/random.jpg",
            "Body": {
              "Class": 'Bard',
              "Sub_Class": 'None',
              "Race": 'Dragonborn',
              "Sub_Race": 'None',
              "Stats": {
                "Level": 1,
                "Max_Health": 8,
                "Ability_Scores": {
                    "Strength": {
                        "S": 10,
                        "M": 0
                    },
                    "Dexterity": {
                        "S": 10,
                        "M": 0
                    },
                    "Constitution": {
                        "S": 10,
                        "M": 0
                    },
                    "Intelligence": {
                        "S": 10,
                        "M": 0
                    },
                    "Wisdom": {
                        "S": 10,
                        "M": 0
                    },
                    "Charisma": {
                        "S": 10,
                        "M": 1
                    },
                },
                "Proficiencies": ["Object"],
                "Prof_Bonus": 2,
                "Passive_Perception": 0,
                "AC": 11
              },
              "Attributes": [
                'Bardic Inspiration',
                'Draconic Ancestry',
                'Breath Weapon',
                'Damage Resistance'
              ],
              "Attribute_Choices": { 'Draconic Ancestry': 'Red' },
              "Equipment": [
                'Club',
                "Diplomat's pack",
                'Bagpipes',
                'Leather Armor',
                'Dagger'
              ],
              "Currency": [ 0, 0, 0, 0, 0 ]
            }
          }])

        setActiveCharacter(characterList[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /*<div 
    className="content" 
    dangerouslySetInnerHTML={
        {__html: DOMPurify.sanitize(
            attributes[classFeatures["Artificer"]["Levels"][0]["Features"][0]]["Description"]
            )}}>
    </div>*/
    return   <Fragment>
        <Container fluid className="page_body">
            {currentUser === null ? <UserNotSignedIn /> :
            <Fragment>
            {creatingCharacter === false ?
            <Fragment>
            {viewingCharacter === false ? 
            <Fragment>
            <Button onClick={e => setCreatingCharacter(1)} className="full_width">Create New Character</Button>
            <Row xs={1} sm={1} md={2} lg={3} xl={4} >
                {
                characterList.map(character =>
                    <Col className="pt-2" key={character.id}>
                        <CharacterCard character={character} id={activeCharacter?.id} handleActivation={(id) => setActiveCharacter(characterList.filter(character => character.id === id)[0])} handleView={(id) => changeScreen(id)}/>
                    </Col>
                )
                }
            </Row></Fragment>
            : <CharacterView character={activeCharacter} setViewingCharacter={setViewingCharacter}/>
            }
            </Fragment>
            :<Fragment>
            <Button variant='danger' onClick={e => setCreatingCharacter(false)} className="full_width">Cancel Character Creation</Button>

            <Form onSubmit={handleSubmit}>
                {/* 
                    Main character information
                */}
                <Form.Label>
                    <h2 className="section_header">Base Character Features</h2>
                    <p>Welcome to the TTRPG Character Creator, here you can make a level one character for DND 5e (possibly more TTRPGs in the future but I will not promise that). 
                        As it stands this tool is meant for slightly more experienced players since no descriptions are given. In the future I would like to add feature popups, but for now it makes this a very uncluttered character creator. 
                        Please note that if you are creating a spellcaster, their spells will only be available after character creation. Additionally level ups are available after creation.</p>
                </Form.Label>
                <Row className="mb-3">
                    <SimpleGroup
                        label="Character Name"
                        type="text"
                        required
                        placeholder="Character Name"
                        value={characterChoices["Character Name"]}
                        onChange={e => updateCharacterChoices("Name", e.target.value)}
                    />

                    <SelectListGroup
                        label="Class"
                        options={classList}
                        value={characterChoices["Class"]}
                        onChange={e => updateCharacterChoices("Class", e.target.value)}
                    />

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
                    <h2 className="section_header">Character Abilities</h2>
                    <p>If you want to use values outside of the [3, 18] range, you will have to edit your character after creation</p>
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
                    <h2 className="section_header">Race Selections</h2>
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
                        return <SelectListGroup
                                    key={attribute}
                                    label={attribute_body["Choice Title"]}
                                    options={attribute_list}
                                    value={characterChoices[attribute]}
                                    onChange={e => updateCharacterChoices(attribute, e.target.value)}
                                />
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
                    <h2 className="section_header">Class Selections</h2>
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
                                        return <SelectListGroup
                                                    key={groupID}
                                                    label={`${key} Proficiency ${groupID}`}
                                                    options={group[0] === groupID ? group.slice(1) : group}
                                                    checkLists={characterChoices[key].concat(foundProficiencies)}
                                                    value={characterChoices[key][groupID - 1]}
                                                    onChange={e => updateCharacterList(key, e)}
                                                />
                                    })}
                                </Fragment>
                            }
                            //The proficiency is forced
                            return <Fragment key={key}></Fragment>
                        })}
                        </Row>
                        <Form.Label>
                            <h2 className="section_header">Equipment Selections</h2>
                            <p>If you are adding custom equipment you can ignore this step and add the equipment after character creation</p>
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
                                                            return <SelectListGroup
                                                                        key={element[0]}
                                                                        label={`${category} ${element[0]}`}
                                                                        options={choiceLists[element[2]]}
                                                                        onChange={e => updateCharacterEquipment(category, e.target.value, element[0] - 1)}
                                                                    />
                                                        }
                                                        return <p key={"BROKEN"}>{element[2]} Needs to be implemented</p>
                                                    }else{
                                                        //Chose one of any of the elements in element
                                                        return <SelectListGroup
                                                                    key={element[0]}
                                                                    label={`${category}`}
                                                                    options={element}
                                                                    onChange={e => updateCharacterEquipment(category, e.target.value, 0)}
                                                                />
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
            </Fragment>}
        </Container>
    </Fragment>
}

export default Characters