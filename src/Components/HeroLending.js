import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import RenderLending from "./RenderLending";
import RenderBorrowing from "./RenderBorrowing";
import RenderOpenOffer from "./RenderOpenOffer";


const Web3 = require('web3');
const web3 = new Web3(ethereum);
var BN = web3.utils.BN;

function HeroLending(props) {
    const [PBalance, setPBalance] = useState(0);
    const [OpenOffers, setOpenOffers] = useState([]);
    const [BorrowingOffers, setBorrowingOffers] = useState([]);
    const [LendingOffers, setLendingOffers] = useState([]);

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
        let offersQuantity = await props.HeroLendingContract.methods.offersQuantity().call();
        for (let i=0; i<offersQuantity; i++) {
            let status = await props.HeroLendingContract.methods.offerStatus(i).call();
            let borrower = await props.HeroLendingContract.methods.offerBorrower(i).call();
            let owner = await props.HeroLendingContract.methods.offerOwner(i).call();
            if (owner.toLowerCase() == props.Address && status != "Cancelled") {
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

    async function createOffer(heroId, liquidation, fee) {
        let exp = new BN(10, 10).pow(new BN(18, 10));
        let BNLiquidation = new BN(liquidation).mul(exp);
        let BNFee = new BN(fee).mul(exp);
        props.HeroLendingContract.methods.createOffer(heroId, BNLiquidation, BNFee).send({from: props.Address}).on("transactionHash", function(hash) {
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
        let exp = new BN(10, 10).pow(new BN(18, 10));
        let BNCollateral = new BN(collateral).mul(exp);
        props.HeroLendingContract.methods.acceptOffer(offerId, BNCollateral).send({from: props.Address}).on("transactionHash", function(hash) {
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
        let exp = new BN(10, 10).pow(new BN(18, 10));
        let BNCollateral = new BN(collateral).mul(exp);
        props.HeroLendingContract.methods.addCollateral(offerId, BNCollateral).send({from: props.Address}).on("transactionHash", function(hash) {
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

    return(
        <Container>
            <Row style={{height: "80px"}}></Row>
            <Row>Protocol Balance: {PBalance}</Row>
            <Row>
            <Card fluid bg="dark" text="light">
            <Card.Body>
            <Card.Title><div className="d-flex justify-content-center"><h1 className="font-link">Create Offer</h1></div></Card.Title>
        
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
            <Form.Label>Daily Fee</Form.Label>
            <Form.Control placeholder="Enter amount"/>
        </Form.Group>
        <Button variant="success" type="submit">Approve Hero and Create Offer</Button>
        </Form>
    
            </Card.Body>
            </Card>
            </Row>
            <Row><Button variant="success" onClick={() => approveMarketplaceSpending()}>Approve Token spending on Market</Button></Row>
            <Row><div className="d-flex justify-content-center"><h1 className="font-link">Your Lendings</h1></div></Row>
            <Row>
                {LendingOffers.map((_) => <RenderLending
                    data={_} 
                    HeroLendingContract={props.HeroLendingContract}
                    cancelOffer={cancelOffer}
                    liquidate={liquidate}
                    />)}
            </Row>
            <Row><div className="d-flex justify-content-center"><h1 className="font-link">Your Borrowings</h1></div></Row>
            <Row>
                {BorrowingOffers.map((_) => <RenderBorrowing 
                    data={_} 
                    HeroLendingContract={props.HeroLendingContract}
                    repayOffer={repayOffer}
                    addCollateral={addCollateral}
                    />)}
            </Row>
            <Row><div className="d-flex justify-content-center"><h1 className="font-link">Open Offers</h1></div></Row>
            <Row>
                {OpenOffers.map((_) => <RenderOpenOffer 
                    data={_} 
                    HeroLendingContract={props.HeroLendingContract}
                    acceptOffer={acceptOffer}
                    />)}
            </Row>
        </Container>
    )
}

function RenderHero(props) {
    return (<option value={props.heroId}>{props.heroId}</option>)
}


export default HeroLending;