import React from "react";
import { UpdateSelectors, UpdateSelectors3 } from "./UpdateForm.jsx";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom"

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
        <DemoLink link="updateselectors3" display="No selector nesting" />
        </div>
    )
}

function App() {
    return (
        <div>
        <BrowserRouter width='100%'>
            <Routes>
                <Route path="/updateselectors"  element={<UpdateSelectors3 />} />
                <Route path="/updateselectors3" element={<UpdateSelectors />} />
                <Route default  element={<NotFound />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </BrowserRouter>
        </div>
    );
}

export { App }
