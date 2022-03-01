import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

function OfferDetail(props) {
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

    function address(address) {
        // eslint-disable-next-line
        if (address != undefined) {
            return address.substring(0,4)+"..."+address.slice(-4)
        }
    }

    function liquidationDate() {
        return new Date((parseInt(OfferData.time) + ((parseInt(OfferData.collateral) - parseInt(OfferData.liquidation))/parseInt(OfferData.fee))*60*60)*1000).toLocaleDateString("en-US");
    }

    const handleSubmitOpen = (event) => {
        event.preventDefault();
        props.acceptOffer(props.data, event.target.formCollateral.value);
    };

    const handleSubmitBorrows = (event) => {
        event.preventDefault();
        props.addCollateral(props.data, event.target.formCollateral.value);
    };

    function renderType() {

        if (props.MenuType == "Lend") {
            return (
                <Container>
                    <Row><Button variant="success" onClick={() => props.cancelOffer(props.data)}>Cancel</Button></Row>
                    <Row><Button variant="success" onClick={() => props.liquidate(props.data)}>Liquidate</Button></Row>
                </Container>
            )
        } else if (props.MenuType == "Borrow") {
            return (
                <Container>
                    <Row>
                        <Form onSubmit={handleSubmitBorrows}>
                        <Form.Group className="mb-3" controlId="formCollateral">
                        <Form.Label>Extra Collateral</Form.Label>
                        <Form.Control placeholder="Enter amount"/>
                        </Form.Group>
                        <Row>
                            <Col><Row><Button variant="success" onClick={() => props.repayOffer(props.data, OfferData.nftId)}>Approve Hero and Pay Back</Button></Row></Col>
                            <Col><Row><Button variant="success" type="submit">Add Collateral</Button></Row></Col>
                        </Row>
                        </Form>
                    </Row>
                </Container>
            )
        } else {
            return (
                <Container>
                    <Row>
                        <Form onSubmit={handleSubmitOpen}>
                        <Form.Group className="mb-3" controlId="formCollateral">
                        <Form.Label>Collateral</Form.Label>
                        <Form.Control placeholder="Enter amount"/>
                        </Form.Group>
                        <Col><Row><Button variant="success" type="submit">Borrow</Button></Row></Col>
                        </Form>
                    </Row>
                </Container>
            )
        }
    }

    if (props.showMenu) {
        return (
            <Container>
                <Card border="success" bg="light" text="dark" className="menu" style={{ width: '54rem' }}>
                    <Card.Header><h1 className="d-flex justify-content-center">Details</h1></Card.Header>
                    <Container>
                        <Row><Col>Offer Id: {props.data}</Col><Col>Status: {OfferData.status}</Col></Row>
                        <Row><Col>Hero Id: {OfferData.nftId}</Col><Col>Hero Address: {address(OfferData.nft)}</Col></Row>
                        <Row><Col>Liquidation: {OfferData.liquidation/10**18}</Col><Col>Collateral: {OfferData.collateral/10**18}</Col></Row>
                        <Row><Col>Hourly Fee: {OfferData.fee/10**18}</Col><Col>Accumulated Fee: {OfferData.feeToPay/10**18}</Col></Row>
                        <Row><Col>Owner: {address(OfferData.owner)}</Col><Col>Borrower: {address(OfferData.borrower)}</Col></Row>
                        <Row><Col>Liquidation date: {liquidationDate()}</Col><Col></Col></Row>
                        <Row>{renderType()}</Row>
                        <Row><Button variant="success" onClick={() => props.handleMenu(props.data)}>Close</Button></Row>
                    </Container>

                </Card>
            </Container>
        ) 
    } else {
        return (<Container></Container>)
    }
}

export default OfferDetail;