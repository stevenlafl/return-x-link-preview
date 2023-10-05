import { useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h2>
        Welcome to your
        <a href="https://www.plasmo.com" target="_blank">
          {" "}
          Plasmo
        </a>{" "}
        Extension!2
      </h2>
      <input onChange={(e) => setData(e.target.value)} value={data} />
      <a href="https://docs.plasmo.com" target="_blank" onClick={(event) => { event.preventDefault(); sendToBackground({
            name: "getMetadata",
            body: {
              url: "https://t.co/fTW2Jch8YH"
            }
          }).then(e => {
            console.log(e)
          })
        }}>
        View Docs
      </a>
    </div>
  )
}

export default IndexPopup
