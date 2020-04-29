import React from "react";
import { Link, Router } from '@reach/router';
import { UpdateSelectors, UpdateSelectors2 } from "./UpdateForm";

import './basic.css'

const NotFound = () => {
  return(
    <div style={{ color: '#151515' }} >
      <h1> 404; Did not find that page, <br/> perhaps try another? </h1>
    </div>
  )
}

const DemoLink = (props) => (
    <Link to={props.link} style={{ margin: '10px' }} >
      <div style={{ borderRadius: '25px/20px', backgroundColor: 'hsla(200,65%,50%,01)', padding: '5px 15px' }} >
         { props.display }
      </div>
    </Link>
)

const Home = (props) => {
 return (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: '100%' }} >
   <DemoLink link="updateselectors" display="For with updating Selects" />
   <DemoLink link="updateselectors2" display="variation of updating Selects" />
  </div>
 )
}

function App() {
  return (
    <div>
      <Router width='100%'  >
        <UpdateSelectors path="/updateselectors" />
        <UpdateSelectors2 path="/updateselectors2" />
        <NotFound default />
        <Home path="/"/>
      </Router>
    </div>
  );
}

export { App }
