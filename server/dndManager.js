
import raceFeatures from './public/src/jsons/races.json' with { type: "json" };
import classFeatures from './public/src/jsons/classes.json' with { type: "json" };
import itemsList from './public/src/jsons/items.json' with { type: "json" };
import attributeList from './public/src/jsons/attributes.json' with { type: "json" };
import choiceLists from './public/src/jsons/choiceLists.json' with { type: "json" };

export const getClassAttributes = (className, subClassName, level) => {
    const classJSON = classFeatures[className]
    let output = []
    for(let i = 0; i < level; i++){
        for(let attr of classJSON["Levels"][i]["Attributes"]){
            output.push(attr)
        }
    }
    return output
}

export const getRaceAttributes = (raceName, subRaceName) => {
    let raceAttrs = raceFeatures["Main Races"][raceName]["Race Attributes"]
    if(subRaceName !== "None"){
        for(let attr of raceFeatures["Sub Races"][raceName][subRaceName]["Attributes"]){
            raceAttrs.push(attr)
        }
    }
    return raceAttrs
}

export const getAttributeChoices = (body, attributes) => {
    let output = {}
    for(let attr of attributes){
        if(attributeList?.[attr]?.["Choice"] === true){
            output[attr] = body[attr]
        }
    }
    return output
}

export const getStartingEquipment = (className, inputEquipment) => {
    let equipment = []
    for(let itemList of Object.keys(inputEquipment)){
        for(let item of inputEquipment[itemList]){
            equipment.push(item)
        }
    }
    for(let item of classFeatures[className]?.["Starting Equipment"]?.["Forced Items"]){
        equipment.push(item)
    }
    return equipment
}

export const getProficiencies = (attributes, className, skill = [], tool = []) => {
    let proficiencies = classFeatures[className]["Proficiencies"]
    for(let i = 0; i < skill.length; i++){
        proficiencies["Skill"][i] = skill[i]
    }

    for(let i = 0; i < tool.length; i++){
        proficiencies["Tool"][i] = tool[i]
    }

    for(let attr of attributes){
        let nestedProfs = attributeList[attr]?.["Effects"]?.["Proficiencies"]
        if(nestedProfs !== undefined){
            for(let key of Object.keys(nestedProfs)){
                for(let element of nestedProfs[key]){
                    proficiencies[key].push(element)
                }
            }
        }
    }
    return proficiencies
}

export const getAbilityIncrease = (raceName, subRaceName, ability) => {
    let main_race = raceFeatures["Main Races"][raceName]["Ability Score Increase"].filter(score => score === ability).length
    let sub_race = raceFeatures["Sub Races"][raceName]?.[subRaceName]?.["Ability Score Increase"].filter(score => score === ability).length
    main_race = main_race === undefined ? 0 : main_race
    sub_race = sub_race === undefined ? 0 : sub_race
    return main_race + sub_race
}

export const abilityModifier = (score) => {
    return Math.floor((score - 10) / 2);
}

export const calculateStartingHealth = (className, modifier) => {
    return parseInt(classFeatures[className]["Hit Die"].replace('1d', '')) + modifier
}

export const calculatePassivePerception = (proficiencies, wisdom, profBonus) => {
    if(proficiencies["Skill"].includes("Perception")){
        wisdom += profBonus
    }
    return wisdom + 10
}

export const calculateArmorClass = (equipment, dexterity) => {
    let ac = 10 + dexterity
    for(let item of equipment){
        let foundItem = itemsList["Armors"]?.[item]
        if(foundItem === undefined){
            continue
        }
        if(foundItem["Attributes"].includes("Light Armor")){
            ac = Math.max(ac, foundItem["AC"] + dexterity)
        }else if(foundItem["Attributes"].includes("Medium Armor")){
            ac = Math.max(ac, foundItem["AC"] + Math.min(2, dexterity))
        }else if(foundItem["Attributes"].includes("Heavy Armor")){
            ac = Math.max(ac, foundItem["AC"])
        }
    }
    return ac
}

export const calculateMoveSpeed = (race) => {
    let moveSpeed = raceFeatures["Main Races"][race]["Speed"]
    return moveSpeed
}