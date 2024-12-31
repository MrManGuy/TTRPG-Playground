import express from 'express'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid';
import { 
    getClassAttributes, 
    getRaceAttributes, 
    getAttributeChoices, 
    getStartingEquipment, 
    getProficiencies, 
    getAbilityIncrease, 
    abilityModifier, 
    calculateStartingHealth, 
    calculatePassivePerception, 
    calculateArmorClass,
    calculateMoveSpeed
} from './dndManager.js'

const api = express();

api.use(cors({origin: 'http://localhost:3000', credentials: true}));
api.use(express.json());

api.post('/characters', (req, res) => {
    //Create the character object that will be stored in the database
    const character = {
        "Name": req.body.Name,
        "Owner": req.body.uid,
        "Game": req.body.Game,
        "id": uuidv4(),
        "img": req.body?.imageURL 
    }

    if(character["Game"] === "DND 5e"){
        const attributes = getClassAttributes(req.body["Class"], req.body["Sub Class"], 1).concat(getRaceAttributes(req.body["Race"], req.body["Sub Race"]))
        const attribute_choices = getAttributeChoices(req.body, attributes)
        const ability_scores = {...req.body["Ability Scores"]}
        
        for(let score of Object.keys(ability_scores)){
            let newScore = ability_scores[score] + getAbilityIncrease(req.body["Race"], req.body["Sub Race"], score)
            let modifer = abilityModifier(newScore)
            ability_scores[score] = {
                "S": newScore,
                "M": modifer
            }
        }

        const starting_health = calculateStartingHealth(req.body["Class"], ability_scores["Constitution"]["M"])

        const proficiencies = getProficiencies(attributes, req.body["Class"], req.body["Skill"], req.body?.["Tool"])
        const profBonusList = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]
        let equipment = []
        let currency = [0, 0, 0, 0, 0]
        if(req.body["UsingStartingEquipment"] === true){
            equipment = getStartingEquipment(req.body["Class"], req.body["Equipment"])
        }else{
            currency[3] = req.body["Rolled Gold"]
        }


        const character5e = {
            "Class": req.body["Class"],
            "Sub_Class": req.body["Sub Class"],
            "Race": req.body["Race"],
            "Sub_Race": req.body["Sub Race"],
            "Stats": {
                "Level": 1,
                "Max_Health": starting_health,
                "Current_Health": starting_health,
                "Temp_Health": 0,
                "Ability_Scores": ability_scores,
                "Proficiencies": proficiencies,
                "Prof_Bonus": profBonusList[0],
                "Passive_Perception": calculatePassivePerception(proficiencies, ability_scores["Wisdom"]["M"], profBonusList[0]),
                "AC": calculateArmorClass(equipment, ability_scores["Dexterity"]["M"]),
                "MS": calculateMoveSpeed(req.body["Race"])
            },
            "Attributes": attributes,
            "Attribute_Choices": attribute_choices,
            "Equipment": equipment,
            "Currency": currency
        }

        character["Body"] = character5e
    }

    console.log(character)
    res.send(character)
})

export default api;