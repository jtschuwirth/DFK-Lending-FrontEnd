import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";

import RenderOffers from "./RenderOffers";
import OfferDetail from "./OfferDetail";


const Web3 = require('web3');
const web3 = new Web3(ethereum);
var BN = web3.utils.BN;

function HeroLending(props) {
    const [PBalance, setPBalance] = useState(0);
    const [OpenOffers, setOpenOffers] = useState([]);
    const [BorrowingOffers, setBorrowingOffers] = useState([]);
    const [LendingOffers, setLendingOffers] = useState([]);
    const [MenuId, setMenuId] = useState(0);
    const [MenuType, setMenuType] = useState(null);

    useEffect(() => {
        if (props.Address != null) {
            requestOffers();
            props.requestHeros();
            requestPBalance();
        }
    // eslint-disable-next-line
    }, [props.Address])

    async function requestPBalance() {
        let result = await props.TokenContract.methods.balanceOf(props.HeroLendingAddress).call();
        setPBalance(result/10**18);
    }

    async function requestOffers() {
        let openOffers = [];
        let borrowingOffers = [];
        let lendingOffers = [];
        let offersQuantity = await props.HeroLendingContract.methods.getOfferQuantities().call();
        for (let i=1; i<=offersQuantity; i++) {
            let offer = await props.HeroLendingContract.methods.getOffer(i).call();
            let owner = offer[0];
            let borrower = offer[5]
            let status = offer[8];
            if (owner.toLowerCase() == props.Address && status != "Cancelled" && status != "Liquidated") {
                lendingOffers.push(i)
            }
            if (status == "Open") {
                openOffers.push(i);
            } else if (status == "On" && borrower.toLowerCase() == props.Address) {
                borrowingOffers.push(i);
            }
        }
        setLendingOffers(lendingOffers);
        setOpenOffers(openOffers);
        setBorrowingOffers(borrowingOffers);
    }


    async function createOffer(heroId, liquidation, fee) {
        let liquidationWei = web3.utils.toWei(liquidation);
        let feeWei = web3.utils.toWei(fee);
        props.HeroLendingContract.methods.createOffer(heroId, props.TreeAddress, liquidationWei, feeWei).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
            requestOffers()
            props.requestHeros()
        })
    }

    async function cancelOffer(offerId) {
        props.HeroLendingContract.methods.cancelOffer(offerId).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
            requestOffers()
            props.requestHeros()
        })
    }

    async function acceptOffer(offerId, collateral) {
        let collateralWei = web3.utils.toWei(collateral);
        props.HeroLendingContract.methods.acceptOffer(offerId, collateralWei).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
            requestOffers()
            props.requestHeros()
        })
    }

    async function repayOffer(offerId, heroId) {
        props.TreeContract.methods.approve(props.HeroLendingAddress, heroId).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
            props.HeroLendingContract.methods.repayOffer(offerId).send({from: props.Address}).on("transactionHash", function(hash) {
                props.ShowPending()
            }).on('receipt', function(receipt) {
                props.ClosePending()
                requestOffers()
                props.requestHeros()
            })
        })

    }

    async function addCollateral(offerId, collateral) {
        let collateralWei = web3.utils.toWei(collateral);
        props.HeroLendingContract.methods.addCollateral(offerId, collateralWei).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
            requestOffers()
            props.requestHeros()
        })
    }

    async function liquidate(offerId) {
        props.HeroLendingContract.methods.liquidate(offerId).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
            requestOffers()
            props.requestHeros()
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        approveHero(event.target.formHero.value, event.target.formLiquidation.value, event.target.formFee.value);
    };

    async function approveHero(heroId, liquidation, fee) {
        props.TreeContract.methods.approve(props.HeroLendingAddress, heroId).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
            createOffer(heroId, liquidation, fee)
        })
    }

    function RenderHero(props) {
        return (<option value={props.heroId}>{props.heroId}</option>)
    }

    function handleMenu(id, type) {
        if (props.showMenu) {
            props.CloseMenu();
        } else {
            setMenuId(id);
            setMenuType(type);
            props.OpenMenu();
        }
    }

    return(
        <Container>
            <OfferDetail 
                showMenu={props.showMenu} 
                data={MenuId} 
                HeroLendingContract={props.HeroLendingContract} 
                handleMenu={handleMenu}
                liquidate={liquidate}
                cancelOffer={cancelOffer}
                acceptOffer={acceptOffer}
                addCollateral={addCollateral}
                repayOffer={repayOffer}
                MenuType={MenuType}/>
            <Row style={{height: "80px"}}></Row>
            <Card border="success" bg="light" text="dark">
            <Card.Header><h1 className="d-flex justify-content-center">Create Offer</h1></Card.Header>
            <Card.Body>
            <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formHero">
            <Form.Select aria-label="Default select example">
                <option>Select HeroId</option>
                {props.OwnedHeros.map((_) => <RenderHero heroId={_}/>)}
            </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLiquidation">
                <Form.Label>Liquidation</Form.Label>
                <Form.Control placeholder="Enter amount" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formFee">
                    <Form.Label>Hourly Fee</Form.Label>
                    <Form.Control placeholder="Enter amount"/>
            </Form.Group>
            <Button variant="success" type="submit">Approve Hero and Create Offer</Button>
            </Form>
            </Card.Body>
            </Card>

            <Row style={{height: "80px"}}></Row>

            <Row>
            <Col>
            <Card border="success" bg="light" text="dark">
            <Card.Body>
            <Card.Header><h1 className="d-flex justify-content-center">Your Lends</h1></Card.Header>
                {LendingOffers.map((_) => <RenderOffers
                    data={_} 
                    HeroLendingContract={props.HeroLendingContract}
                    handleMenu={handleMenu}
                    type ="Lend"
                    />)}
            </Card.Body>
            </Card>
            </Col>

            <Col>
            <Card border="success" bg="light" text="dark">
            <Card.Body>
            <Card.Header><h1 className="d-flex justify-content-center">Your Borrows</h1></Card.Header>
                {BorrowingOffers.map((_) => <RenderOffers 
                    data={_} 
                    HeroLendingContract={props.HeroLendingContract}
                    handleMenu={handleMenu}
                    type ="Borrow"
                    />)}
            </Card.Body>
            </Card>
            </Col>
            </Row>

            <Row style={{height: "80px"}}></Row>

            <Card border="success" bg="light" text="dark">
            <Card.Body>
            <Card.Header><h1 className="d-flex justify-content-center">Open Offers</h1></Card.Header>
                {OpenOffers.map((_) => <RenderOffers 
                    data={_} 
                    HeroLendingContract={props.HeroLendingContract}
                    handleMenu={handleMenu}
                    type="Open"
                    />)}
            </Card.Body>
            </Card>

            <Row style={{height: "80px"}}></Row>

        </Container>
    )
}

export default HeroLending;