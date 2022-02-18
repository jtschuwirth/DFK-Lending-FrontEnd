import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Col from "react-bootstrap/Col";
import Navbar from 'react-bootstrap/Navbar';
import Button from "react-bootstrap/Button";
import ToastContainer from 'react-bootstrap/ToastContainer';
import Toast from 'react-bootstrap/Toast';

const ethereum = window.ethereum;
const Web3 = require('web3');
const web3 = new Web3(ethereum);
var BN = web3.utils.BN;

function Header(props) {
    useEffect(() => {
        isMetaMaskConnected().then((connected) => {
            if (connected) {
                // metamask is connected
                connectMetaMask();
            } else {
                // metamask is not connected
                props.setAddress(null);
            }
        });
        if (props.Address != null) {
            props.requestBalance(props.Address);
        }
    },);

    async function isMetaMaskConnected() {
        const accounts = await web3.eth.getAccounts()
        return accounts.length > 0;
    }

    async function connectMetaMask() {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            props.setAddress(account)
      
        } catch (error) {
            console.error(error);
        }
    }

    async function approveMarketplaceSpending() {
        let max = 1000000000
        let exp = new BN(10, 10).pow(new BN(18, 10));
        let value = new BN(max).mul(exp);
        props.TokenContract.methods.approve(props.HeroLendingAddress, value).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
        })
    }

    return(
<Navbar expand="lg" fixed="top" bg="dark" variant="dark">
    <Container>
    <Navbar.Brand> Hero Lending</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav" >
        <Nav className="me-auto" >
            <Nav.Link onClick={() => props.mintNFT()}>Mint NFT</Nav.Link>
            <Nav.Link onClick={() => props.mintToken()}>Mint Token</Nav.Link>
        </Nav>
        <ToastContainer >
            <Col md={7}>
            <Toast show={props.showToast} onClose={props.ClosePending} >
            <Toast.Header>
            <strong className="me-auto">Pending Transaction</strong>
            </Toast.Header>
            </Toast>
            </Col>
        </ToastContainer>
        <Button variant="success" onClick={() => approveMarketplaceSpending()}>Approve Market</Button>
        <Button variant="success">Token Balance: {props.currentBalance.toFixed(2)}</Button>
        <Button variant="dark" onClick={() => connectMetaMask()}><Wallet Address={props.Address}/></Button>
    </Navbar.Collapse>
    </Container>
</Navbar>
    )
}

function Wallet(props) {
    if (props.Address == null) {
        return "Connect Wallet"
    } else {
        return props.Address.substring(0,4)+"..."+props.Address.slice(-4)
    }
}

export default Header;