import items from '../../jsons/items.json'

const Item = ({name, amount, props}) => {
    return <div>
            <p>{amount} - {name}</p>
        </div>
}

export default Item