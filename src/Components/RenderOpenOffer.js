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
        let owner;
        let heroId;
        let liquidation;
        let fee;
        let status;
        try {
            owner = await props.HeroLendingContract.methods.offerOwner(id).call()
        } catch (error) {
            console.error(error);
        }
        try {
            heroId = await props.HeroLendingContract.methods.offerHeroId(id).call()
        } catch (error) {
            console.error(error);
        }
        try {
            liquidation = await props.HeroLendingContract.methods.offerLiquidation(id).call()
        } catch (error) {
            console.error(error);
        }
        try {
            fee = await props.HeroLendingContract.methods.offerDailyFee(id).call()
        } catch (error) {
            console.error(error);
        }
        try {
            status = await props.HeroLendingContract.methods.offerStatus(id).call()
        } catch (error) {
            console.error(error);
        }
        return {
            owner: owner, 
            heroId: heroId, 
            liquidation: liquidation, 
            fee: fee,
            status: status}
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
            <Col><Row>hero Id: {OfferData.heroId}</Row></Col>
            <Col>Liquidation: {OfferData.liquidation/10**18}</Col>
            <Col>Daily Fee: {OfferData.fee/10**18}</Col>
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
