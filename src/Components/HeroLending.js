import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const Web3 = require('web3');
const web3 = new Web3(ethereum);
var BN = web3.utils.BN;

function HeroLending(props) {
    const [PBalance, setPBalance] = useState(0);
    const [OpenOffers, setOpenOffers] = useState([]);
    const [BorrowingOffers, setBorrowingOffers] = useState([]);
    const [LendingOffers, setLendingOffers] = useState([]);
    const [OwnedHeros, setOwnedHeros] = useState([]);
    useEffect(() => {
        if (props.Address != null) {
            requestOffers();
            requestHeros();
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

    async function requestHeros() {
        let ownedHeros = [];
        let herosQuantity = await props.TreeContract.methods.treesQuantity().call()
        for (let i=0; i<herosQuantity; i++) {
            let owner = await props.TreeContract.methods.ownerOf(i).call()
            if (owner.toLowerCase() == props.Address) {
                ownedHeros.push(i)
            }
        }
        setOwnedHeros(ownedHeros);
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
            requestHeros()
        })
    }

    async function cancelOffer(offerId) {
        props.HeroLendingContract.methods.cancelOffer(offerId).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
            requestOffers()
            requestHeros()
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
            requestHeros()
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
                requestHeros()
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
            requestHeros()
        })
    }

    async function liquidate(offerId) {
        props.HeroLendingContract.methods.liquidate(offerId).send({from: props.Address}).on("transactionHash", function(hash) {
            props.ShowPending()
        }).on('receipt', function(receipt) {
            props.ClosePending()
            requestOffers()
            requestHeros()
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
        {OwnedHeros.map((_) => <RenderHero heroId={_}/>)}
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
                {LendingOffers.map((_) => <RenderLendingOffer 
                    data={_} 
                    HeroLendingContract={props.HeroLendingContract}
                    cancelOffer={cancelOffer}
                    liquidate={liquidate}
                    />)}
            </Row>
            <Row><div className="d-flex justify-content-center"><h1 className="font-link">Your Borrowings</h1></div></Row>
            <Row>
                {BorrowingOffers.map((_) => <RenderBorrowingOffer 
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
    <Card>
    <Container>
        <Row>
            <Col><Row>Offer Id: {props.data}</Row></Col>
            <Col><Row>hero Id: {OfferData.heroId}</Row></Col>
            <Col>Liquidation: {OfferData.liquidation/10**18}</Col>
            <Col>Daily Fee: {OfferData.fee/10**18}</Col>
            <Col>Owner: {owner(OfferData.owner)}</Col>
            <Col>Status: {OfferData.status}</Col>
        </Row>
        <Row>
        <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formCollateral">
            <Form.Label>Collateral</Form.Label>
            <Form.Control placeholder="Enter amount"/>
        </Form.Group>
        <Col><Row><Button variant="success" type="submit">Rent</Button></Row></Col>
        </Form>
        <Row style={{height: "10px"}}></Row>
        </Row>
    </Container>
    </Card>
    )
}

function RenderBorrowingOffer(props) {
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
        let collateral;
        let borrower;
        let time;
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

        try {
            collateral = await props.HeroLendingContract.methods.offerCollateral(id).call()
        } catch (error) {
            console.error(error);
        }
        try {
            borrower = await props.HeroLendingContract.methods.offerBorrower(id).call()
        } catch (error) {
            console.error(error);
        }
        try {
            time = await props.HeroLendingContract.methods.offerAcceptTime(id).call()
        } catch (error) {
            console.error(error);
        }
        return {
            owner: owner, 
            heroId: heroId, 
            liquidation: liquidation, 
            fee: fee,
            status: status,
            collateral: collateral,
            borrower: borrower,
            time: time}
    }

    function address(address) {
        // eslint-disable-next-line
        if (address != undefined) {
            return address.substring(0,4)+"..."+address.slice(-4)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        props.addCollateral(props.data, event.target.formCollateral.value);
    };

    return (
    <Card>
    <Container>
        <Row>
            <Col><Row>Offer Id: {props.data}</Row></Col>
            <Col><Row>hero Id: {OfferData.heroId}</Row></Col>
            <Col>Liquidation: {OfferData.liquidation/10**18}</Col>
            <Col>Daily Fee: {OfferData.fee/10**18}</Col>
            <Col>Owner: {address(OfferData.owner)}</Col>
            <Col>Status: {OfferData.status}</Col>
        </Row>
        <Row>
            <Col>Collateral: {OfferData.collateral/10**18}</Col>
            <Col>Borrower: {address(OfferData.borrower)}</Col>
            <Col>Time: {OfferData.time}</Col>
        </Row>
        <Row>
        <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formCollateral">
            <Form.Label>Extra Collateral</Form.Label>
            <Form.Control placeholder="Enter amount"/>
        </Form.Group>
        <Col><Row><Button variant="success" onClick={() => props.repayOffer(props.data, OfferData.heroId)}>Approve Hero and Pay Back</Button></Row></Col>
        <Col><Row><Button variant="success" type="submit">Add Collateral</Button></Row></Col>
        </Form>
        <Row style={{height: "10px"}}></Row>
        </Row>
    </Container>
    </Card>
    )
}

function RenderLendingOffer(props) {
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
    <Card>
    <Container>
        <Row>
            <Col><Row>Offer Id: {props.data}</Row></Col>
            <Col><Row>hero Id: {OfferData.heroId}</Row></Col>
            <Col>Liquidation: {OfferData.liquidation/10**18}</Col>
            <Col>Daily Fee: {OfferData.fee/10**18}</Col>
            <Col>Owner: {owner(OfferData.owner)}</Col>
            <Col>Status: {OfferData.status}</Col>
        </Row>
        <Row>
        <Col><Row><Button variant="success" onClick={() => props.cancelOffer(props.data)}>Cancel</Button></Row></Col>
        <Col><Row><Button variant="success" onClick={() => props.liquidate(props.data)}>Liquidate</Button></Row></Col>
        <Row style={{height: "10px"}}></Row>
        </Row>
    </Container>
    </Card>
    )
}

export default HeroLending;