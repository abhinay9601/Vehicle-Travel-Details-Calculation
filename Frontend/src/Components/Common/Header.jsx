import React from 'react'
import { Container, Navbar } from 'react-bootstrap'
import Logo from '../../assets/logo.png'

function Header() {
    return (
        <div>
            <Navbar style={{boxShadow: "0px 4px 15px 0px #00000024"}} className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="#home">  <img src={Logo} /></Navbar.Brand>
                </Container>
            </Navbar>
        </div>
    )
}

export default Header