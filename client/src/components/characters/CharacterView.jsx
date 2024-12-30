import { Button, Row, Col } from "react-bootstrap"
import AbilityScore from "./AbilityScore"
import skillList from '../../jsons/Skills.json';
import raceFeatures from '../../jsons/races.json'
import attributes from '../../jsons/attributes.json'
import StatSquare from "./StatSquare";
import { Fragment } from "react";

const CharacterView = ({character, mode, ...props}) => {
    const convertModifier = (value) => {
        if(value > 0){
            value = "+" + value
        }else if(value < 0){
            value = "-" + value
        }
        return value
    }

    const convertDescription = (desc) => {
        let lists = desc.split('<ul>')
        let intro = lists[0].replace("</p>", "")
        return <div>
            <p>{intro}</p>
            {lists.slice(1).map(elementList => {
                let sections = elementList.split("</ul>")
                let elements = sections[0].split("<li>").slice(1)
                console.log(elements)
                return <Fragment key={elementList}><ul>
                    {elements.map(element => {
                        return <li key={element}>{element.replace("</li>", "")}</li>
                    })}
                </ul>{sections[1] !== "" ? <p>{sections[1].replace("<p>", "")}</p> : null}</Fragment>
            })}</div>
    }

    if(character === null || character?.["Body"] === undefined){
        return <p>No character chosen, please go to characters and create a character or select one</p>
    }
     return <div className="character_sheet">
     {mode !== "toolbar" ? <Button variant='danger' onClick={e => props.setViewingCharacter(null)} className="full_width">Character Home</Button> : null}
        <Row>
            {Object.keys(character["Body"]["Stats"]["Ability_Scores"]).map(score => 
            <AbilityScore 
                key={score}
                saves={character["Body"]["Stats"]["Proficiencies"]["Saving Throws"]} 
                score={score} 
                values={character["Body"]["Stats"]["Ability_Scores"][score]} 
                convertModifier={convertModifier}/>
            )}
        </Row>
        <hr/>
        <Row className="mb-2">
            <StatSquare 
                title="Initiative"
                value={convertModifier(character["Body"]["Stats"]["Ability_Scores"]["Dexterity"]["M"])}   
                size={3}
            />
            <StatSquare 
                title="Prof Bonus"
                value={convertModifier(character["Body"]["Stats"]["Prof_Bonus"])}   
                size={3}
            />
            <StatSquare 
                title="Armor Class"
                value={character["Body"]["Stats"]["AC"]}   
                size={3}
            />
            <StatSquare 
                title="Move Speed"
                value={character["Body"]["Stats"]["MS"]}   
                size={3}
            />
            {mode === "toolbar" ? <hr/> : null}
            <StatSquare 
                title="Max HP"
                value={character["Body"]["Stats"]["Max_Health"]}
                size={3}
            />
            <StatSquare 
                title="Health"
                value={character["Body"]["Stats"]["Current_Health"]}
                size={6}
            />
            <StatSquare 
                title="Temp HP"
                value={character["Body"]["Stats"]["Temp_Health"]}
                size={3}
            />
        </Row>
        <hr/>
        <Row className="mb-2">
            <Col xs={mode === "toolbar" ? 6  : 3} className="overflow_col">
            <h3 className="section_header">Skills</h3>
            <table>
                <thead>
                    <tr>
                        <td>Skill</td>
                        <td>Bonus</td>
                        <td>Ability</td>
                        <td>Prof</td>
                    </tr>
                </thead>
                <tbody>
                {Object.keys(skillList).map(skill => {
                    let bonus = character["Body"]["Stats"]["Ability_Scores"][skillList[skill]["A"]]["M"]
                    let prof = false
                    if(character["Body"]["Stats"]["Proficiencies"]?.["Skill"]?.includes(skill)){
                        prof = true
                        bonus += character["Body"]["Stats"]["Prof_Bonus"]
                    }
                    bonus = convertModifier(bonus)
                    return <tr key={skill}>
                        <td>{skill}</td>
                        <td>{bonus}</td>
                        <td>{skillList[skill]["A"].substring(0, 3)}</td>
                        <td>{prof === true ? <input type="checkbox" disabled checked/> : ""}
                        </td>
                    </tr>
                })}
                </tbody>
            </table>
            <hr/>
            </Col>
            <Col xs={mode === "toolbar" ? 6  : 3} className="overflow_col">
            <h3 className="section_header">Proficiencies</h3>
            <ul className="basic_list">
                {Object.keys(character["Body"]["Stats"]["Proficiencies"]).filter(set => {
                   if(set === "Skill" || set === "Saving Throws" || character["Body"]["Stats"]["Proficiencies"][set].length === 0){
                        return false
                   }
                   return true
                }).map(set => {
                    let profs = character["Body"]["Stats"]["Proficiencies"]
                    return <li key={set}>
                        {set}
                        <ul>
                            <li>{profs[set].join(", ")}</li>
                        </ul>
                    </li>
                })}
            </ul>
            <hr/>
            <h3 className="section_header">Passives</h3>
            <p>Passive Perception (Wis) - {10 + character["Body"]["Stats"]["Passive_Perception"]}</p>
            <hr/>
            </Col>
            <Col xs={mode === "toolbar" ? 6  : 3} className="overflow_col">
                <h3 className="section_header">Class Features</h3>
                {character["Body"]["Attributes"].filter(attr => {
                    return !raceFeatures["Main Races"][character["Body"]["Race"]]["Race Attributes"].includes(attr) && 
                    !raceFeatures["Sub Races"][character["Body"]["Race"]]?.[character["Body"]["Sub_Race"]]?.["Attributes"].includes(attr)
                }).map(attr => {
                    return <div className="attribute_block" key={attr}>
                        <h4 className="attribute_block_title">{attr}</h4>
                        {attributes?.[attr]?.["Description"] === undefined ? `Missing Description` : convertDescription(attributes[attr]["Description"])}
                        </div>
                })}
                <hr/>
            </Col>
            <Col xs={mode === "toolbar" ? 6  : 3} className="overflow_col">
                <h3 className="section_header">Race Features</h3>
                {character["Body"]["Attributes"].filter(attr => {
                    return raceFeatures["Main Races"][character["Body"]["Race"]]["Race Attributes"].includes(attr) || 
                    raceFeatures["Sub Races"][character["Body"]["Race"]]?.[character["Body"]["Sub_Race"]]?.["Attributes"].includes(attr)
                }).map(attr => {
                    return <div className="attribute_block" key={attr}>
                        <h4 className="attribute_block_title">{attr}</h4>
                        {attributes?.[attr]?.["Description"] === undefined ? `Missing Description` : convertDescription(attributes[attr]["Description"])}
                        </div>
                })}
                <hr/>
            </Col>
        </Row>
    </div>
}

export default CharacterView