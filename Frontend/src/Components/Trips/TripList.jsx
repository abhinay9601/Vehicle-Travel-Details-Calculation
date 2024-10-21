import React, { useEffect, useState } from 'react'
import Header from '../Common/Header'
import { useHistory } from 'react-router-dom';
import { Button, Card, Form, Modal, Table } from 'react-bootstrap'
import './TripList.css'
import UploadTripLogo from '../../assets/cuate.png'
import ReactPaginate from "react-paginate";
import Welcome from '../../assets/welcome.png'
import axios from 'axios'
import FileUpload from '../Common/FileUpload';

function TripList() {
    const [show, setShow] = useState(false);
    const [showTripList, setShowTripList] = useState(false);
    const [totalTripsList, setTotalTripsList] = useState(0);
    const [tripsList, setTripsList] = useState([]);
    const [checkboxAll, setCheckboxAll] = useState(false)
    const [tripDetailsBtn, setTripDetailsBtn] = useState(false);
    const history = useHistory();
    const [page, setPage] = useState(1);
    const [deleteDisable, setDeletedisable] = useState(true);
    const [deleteShow, setDeleteShow] = useState({ open: false, message: '' });

    let localstore = JSON.parse(localStorage.getItem('Authorization Details'));

    const handleShow = () => setShow(true);

    const getAllTrips = async (page) => {
        try {
            await axios.get(`${process.env.REACT_APP_HOSTNAME}/api/v1/trips/${localstore._id}/${page}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then((response) => {
                    let trips;
                    if (checkboxAll) {
                        trips = response.data.response.map((e) => ({ tripname: e, checked: true }))
                    } else {
                        trips = response.data.response.map((e) => ({ tripname: e, checked: false }))
                    }
                    setTripsList(trips);
                    setShowTripList(true);
                    setPage(page);
                    setTotalTripsList(response.data.totalTrips);
                }).catch((error) => console.error(error));
        } catch (error) {
            console.log(error);

        }
    };

    const fetchData = async () => {
        const previousData = await axios.get(`${process.env.REACT_APP_HOSTNAME}/api/v1/user/${localstore._id}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        if (previousData.data.present) {
            setShowTripList(true);
            await getAllTrips(page);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const tripsFilter = tripsList.filter(item => item.checked === true);
        tripsFilter.length >= 1 ? setTripDetailsBtn(true) : setTripDetailsBtn(false);
    }, [tripsList]);


    const handleCheckBox = (e) => {
        let updatedtrips;
        if (!e.checked) {
            updatedtrips = tripsList.map((list) => (e.tripname === list.tripname ? { ...list, checked: true } : { ...list }));
            setTripsList(updatedtrips);
        } else {
            updatedtrips = tripsList.map((list) => (e.tripname === list.tripname ? { ...list, checked: false } : { ...list }));
            setTripsList(updatedtrips);
            if (checkboxAll) {
                setCheckboxAll(false)
            }
        }
        const hasChecked = updatedtrips.some(obj => obj.checked);
        setDeletedisable(!hasChecked);
    }

    
    const handleCheckBoxAll = (e) => {
        setCheckboxAll(!checkboxAll);
        if (checkboxAll === false) {
            const trips = tripsList.map((e) => ({ ...e, checked: true }))
            setTripsList(trips);
            setCheckboxAll(!checkboxAll);
            setDeletedisable(!deleteDisable);
        } else {
            const trips = tripsList.map((e) => ({ ...e, checked: false }))
            setTripsList(trips);
            setCheckboxAll(!checkboxAll);
            setDeletedisable(!deleteDisable);
        }
        setTripDetailsBtn(true)
    }

    const handleOpenTripDetails = () => {
        const tripsFilter = tripsList.filter(item => item.checked === true);
        setTripsList([]);
        history.push({
            pathname: '/tripdetails',
            state: { tripsFilter, checkboxAll}
        });
    }

    const handlePageClick = (event) => {
        setTripsList([]);
        setPage(event.selected + 1);
        getAllTrips(event.selected + 1)
    };

    const handleDelete = () => {
        let message;
        if (checkboxAll) {
            message = 'Are you sure you want to delete all the trips ?'
        } else {
            message = 'Are you sure you want to delete the selected trips ?'
        }
        setDeleteShow({ open: true, message });
    };
    const handleClose = () => {
        setDeleteShow({ open: false, message: '' });
    }
    const handleDeleteTrips = async () => {
        if (checkboxAll) {
            await axios.delete(`${process.env.REACT_APP_HOSTNAME}/api/v1/user/alltrips/${localstore._id}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            window.location.reload();

        } else {
            const tripsFilter = tripsList.filter(item => item.checked === true);
            await axios.delete(`${process.env.REACT_APP_HOSTNAME}/api/v1/trips/${localstore._id}`, { data: tripsFilter },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            window.location.reload();

        }
    }

    return (
        <div>
            <Header />
            <div className='d-flex flex-column align-items-center'>
                <Card className='w-75 mt-5 d-flex flex-row rounded'>
                    <img className='welcome my-2 mx-4' src={Welcome} />
                    <h3 className='mt-3 welcometext'>Welcome, User</h3>
                </Card>
                {
                    !showTripList ?
                        <Card className='w-75 mt-5 d-flex flex-column align-items-center mx-sm-5'>
                            <img className='w-25' src={UploadTripLogo} />
                            <Button onClick={handleShow} variant="dark" className='mt-5 res-sm'>Upload Trip</Button>
                            <Form.Label className='mt-2 mx-sm-3' >Upload the Excel sheet of your trip</Form.Label>
                        </Card>
                        :
                        <>
                            <Card className='w-75 mt-3 d-flex flex-column flex-xl-row flex-md-row flex-sm-row rounded'>
                                <Button variant="dark" onClick={handleShow} className='my-2 h-75 mx-4 align-items-center res-sm'>Upload Trip</Button>
                                <Form.Label className='my-3 mx-4' >Upload the Excel sheet of your trip.</Form.Label>
                            </Card>
                            <div className='w-75  d-flex flex-row rounded justify-content-center justify-content-xl-between justify-content-sm-between justify-content-md-between'>
                                <h3 className='my-3 mx-4 mx-xs-4 font-weight-bold ' >Your Trips</h3>
                                <div className='d-flex my-2 mr-4'>
                                    <Button onClick={handleDelete} disabled={deleteDisable} variant="light" className='my-2 h-75 w-sm-2 mx-4'>Delete</Button>
                                    <Button onClick={handleOpenTripDetails} disabled={!tripDetailsBtn} variant="dark" className='my-2 mx-4 h-75 '>Open</Button>
                                </div>
                            </div>
                            <div className="w-75 d-flex flex-column align-items-center" >
                                <Table responsive={true} >
                                    <thead>
                                        <tr>
                                            <th>
                                                <Form.Check // prettier-ignore
                                                    type={"checkbox"}
                                                    disabled={tripsList.length == 0 && true}
                                                    className='mb-4'
                                                    checked={tripsList.every(obj => obj.checked)}
                                                    onClick={(e) => handleCheckBoxAll(e)}
                                                />
                                            </th>
                                            <th>Trips</th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            tripsList.length > 0 ? (
                                                tripsList.map((e) => (
                                                    <tr key={e?._id}  onClick={() => handleCheckBox(e)} type={"checkbox"} >
                                                        <td>
                                                            <Form.Check checked={e?.checked}/>
                                                        </td>
                                                        <td>{e?.tripname}</td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4}>Loading your trips...</td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </Table>
                                <ReactPaginate
                                    nextLabel="Next >"
                                    onPageChange={handlePageClick}
                                    pageRangeDisplayed={1}
                                    marginPagesDisplayed={1}
                                    pageCount={Math.ceil(totalTripsList / 10)}
                                    previousLabel="< Previous"
                                    pageClassName="page-item"
                                    pageLinkClassName="page-link"
                                    previousClassName="page-item"
                                    previousLinkClassName="page-link"
                                    nextClassName="page-item"
                                    nextLinkClassName="page-link"
                                    breakLabel="..."
                                    breakClassName="page-item"
                                    breakLinkClassName="page-link"
                                    containerClassName="pagination"
                                    activeClassName="active"
                                    renderOnZeroPageCount={null}
                                    responsive={true}
                                />
                            </div>
                        </>
                }
            </div>
            <FileUpload
                show={show}
                setShow={setShow}
                setShowTripList={setShowTripList}
                showTripList={true}
                getAllTrips={getAllTrips}
            />

            <Modal
                show={deleteShow.open}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title className='mx-2'>Delete Trip</Modal.Title>
                </Modal.Header>
                <Modal.Body className='mx-4'>
                    <h5>{deleteShow?.message}</h5>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button onClick={handleDeleteTrips} variant="primary">Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default TripList;