import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";

function RenderLending(props) {
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

    function address(address) {
        // eslint-disable-next-line
        if (address != undefined) {
            return address.substring(0,4)+"..."+address.slice(-4)
        }
    }

    function accumulatedFee() {
        if (((Date.now() - parseInt(OfferData.time)*1000)/1000 < 60*60)) {
            return ((OfferData.fee/24)/10**18).toFixed(2)
        } else {
            return (((((Date.now() - (parseInt(OfferData.time)*1000))/1000)/(60*60*24))*OfferData.fee)/10**18).toFixed(2)
        }
    }

    if (OfferData.status == "Open") {
        return (
            <Accordion.Item eventKey={props.data}>
            <Accordion.Header>
            <Container>
                <Row><Col>Offer Id: {props.data}</Col><Col>Status: {OfferData.status}</Col></Row>
                <Row><Col>Hero Id: {OfferData.nftId}</Col><Col>Hero Address: {address(OfferData.nft)}</Col></Row>
                <Row><Col>Liquidation: {OfferData.liquidation/10**18}</Col><Col></Col></Row>
                <Row><Col>Daily Fee: {OfferData.fee/10**18}</Col><Col></Col></Row>
                <Row><Col>Owner: {address(OfferData.owner)}</Col><Col></Col></Row>
            </Container>
            </Accordion.Header>

            <Accordion.Body>
                <Row><Button variant="success" onClick={() => props.cancelOffer(props.data)}>Cancel</Button></Row>
                <Row style={{height: "10px"}}></Row>
            </Accordion.Body>
            </Accordion.Item>

    )
    } else {
        return (
            <Accordion.Item eventKey={props.data}>
            <Accordion.Header>
            <Container>
                <Row><Col>Offer Id: {props.data}</Col><Col>Status: {OfferData.status}</Col></Row>
                <Row><Col>Hero Id: {OfferData.nftId}</Col><Col>Hero Address: {address(OfferData.nft)}</Col></Row>
                <Row><Col>Liquidation: {OfferData.liquidation/10**18}</Col><Col>Collateral: {OfferData.collateral/10**18}</Col></Row>
                <Row><Col>Daily Fee: {OfferData.fee/10**18}</Col><Col>Accumulated Fee: {accumulatedFee()}</Col></Row>
                <Row><Col>Owner: {address(OfferData.owner)}</Col><Col>Borrower: {address(OfferData.borrower)}</Col></Row>
                <Row><Col>Time to Liquidation:</Col><Col></Col></Row>
            </Container>
            </Accordion.Header>

            <Accordion.Body>
                <Row><Button variant="success" onClick={() => props.liquidate(props.data)}>Liquidate</Button></Row>
            </Accordion.Body>
            </Accordion.Item>
        )
    }
}

export default RenderLending;