import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

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
        let feeToPay = await props.HeroLendingContract.methods.feeToPay(id).call();
        return {
            owner: offer[0],
            nft: offer[1],
            nftId: offer[2], 
            liquidation: offer[3], 
            fee: offer[4],
            borrower: offer[5],
            collateral: offer[6],
            time: offer[7],
            status: offer[8],
            feeToPay: feeToPay
        }
    }

    if (OfferData.status == "Open") {
        return (
            <Card>
            <Container>
                <Row>
                <Col><Row>Hero Id: {OfferData.nftId}</Row><Row>Liquidation: {OfferData.liquidation/10**18}</Row></Col>
                <Col><Row>Status: {OfferData.status}</Row><Row>Hourly Fee: {OfferData.fee/10**18}</Row></Col>
                <Col className="d-flex align-items-center"><Col className="d-flex justify-content-end"><Button variant="success" onClick={() => props.handleMenu(props.data, props.type)}>Details</Button></Col></Col>
                </Row>
            </Container>
            </Card>

    )
    } else {
        return (
            <Card>
            <Container>
                <Row>
                <Col><Row>Hero Id: {OfferData.nftId}</Row><Row>Liquidation: {OfferData.liquidation/10**18}</Row><Row>Collateral: {OfferData.collateral/10**18}</Row><Row></Row></Col>
                <Col><Row>Status: {OfferData.status}</Row><Row>Hourly Fee: {OfferData.fee/10**18}</Row><Row>Accumulated Fee: {OfferData.feeToPay/10**18}</Row></Col>
                <Col className="d-flex align-items-center"><Col className="d-flex justify-content-end"><Button variant="success" onClick={() => props.handleMenu(props.data, props.type)}>Details</Button></Col></Col>
                </Row>
            </Container>
            </Card>
        )
    }
}

export default RenderLending;