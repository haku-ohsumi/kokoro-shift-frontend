import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const ReadAll = () => {
  const [allItems, setAllItems] = useState()

  useEffect(() =>{
    const getAllItems = async() => {
      const response = await fetch("http://localhost:5050")
      const jsonResponse = await response.json()
      setAllItems(jsonResponse)
    }
    getAllItems()
  },[])

  return (
    <div className="grid-container-in">
      {allItems && allItems.allItems.map(item =>
        <div className="card">
          <Link to={`/item/${item._id}`} key={item._id}>
            <img src={require(`../../images${item.image}`)} alt="item"/>
              <div>
                <h2>¥{item.price}</h2>
                <h3>{item.title}</h3>
                <p>{item.description.substring(0, 80)}</p>
              </div>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ReadAll