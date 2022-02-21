import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";

function RenderOpenOffer(props) {
    const [OfferData, setOfferData] = useState([]);

    useEffect(() => {
        updateOfferData(props.data)
    // eslint-disable-next-line
    })

    async function updateOfferData(id) {
        let data = await requestOfferData(id);
        setOfferData(data);
    }

    async function requestOfferData(id) {
        let offer = await props.HeroLendingContract.methods.getOffer(id).call();
        return {
            owner: offer[0],
            nft: offer[1],
            nftId: offer[2], 
            liquidation: offer[3], 
            fee: offer[4],
            borrower: offer[5],
            collateral: offer[6],
            time: offer[7],
            status: offer[8]}
    }

    function owner(address) {
        // eslint-disable-next-line
        if (address != undefined) {
            return address.substring(0,4)+"..."+address.slice(-4)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        props.acceptOffer(props.data, event.target.formCollateral.value);
    };

    return (
    <Accordion.Item eventKey={props.data}>
    <Accordion.Header>
    <Container>
        <Row>
            <Col><Row>Offer Id: {props.data}</Row></Col>
            <Col><Row>nft Id: {OfferData.nftId}</Row></Col>
            <Col>Liquidation: {OfferData.liquidation/10**18}</Col>
            <Col>Hourly Fee: {OfferData.fee/10**18}</Col>
            <Col>Owner: {owner(OfferData.owner)}</Col>
            <Col>Status: {OfferData.status}</Col>
        </Row>
    </Container>
    </Accordion.Header>
    
    <Accordion.Body>
        <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formCollateral">
            <Form.Label>Collateral</Form.Label>
            <Form.Control placeholder="Enter amount"/>
        </Form.Group>
        <Col><Row><Button variant="success" type="submit">Borrow</Button></Row></Col>
        </Form>
    </Accordion.Body>
    </Accordion.Item>
    )
}


export default RenderOpenOffer;
