import React, { useState } from 'react'
import { Button, Card, Form, Modal, ProgressBar } from 'react-bootstrap'
import UploadLogo from '../../assets/Uploadlogo.png'
import axios from 'axios';


function FileUpload({
    show,
    setShow,
    showTripList,
    getAllTrips,
    setCurrentFile,
    setpage
}) {

    const [savedisable, setSavedisable] = useState(false);
    const [file, setFile] = useState(null);
    const [fileName, setFilename] = useState('');
    const [FilePresentError, setFilePresentError] = useState(false);
    let localstore = JSON.parse(localStorage.getItem('Authorization Details'));

    // CLOSE FILE UPLOAD DIALOG BOX
    const handleClose = () => {
        setShow(false);
        setFilename('')
        setFilePresentError(false);
        setFile(null);
    }

    //UPLOAD CSV FILE
    const handleUpload = async () => {
        if (file) {
            const { _id } = localstore;
            const reader = new FileReader();
            reader.onload = async (event) => {
                const csvData = event.target.result;
                const rows = csvData.split('\n');
                const columns = rows[0].split(',');
                const data = rows.slice(1).map((row) => {
                    const obj = {};
                    columns.forEach((column, index) => {
                        obj[column] = row.split(',')[index];
                    });
                    obj.userId = _id;
                    obj.fileName = fileName;
                    return obj;
                });
                const filteredData = data.filter((e) => e.latitude != '' || e.longitude != undefined || e.timestamp != undefined || e.ignition != undefined);
                await axios.post(`${process.env.REACT_APP_HOSTNAME}/api/v1/trips`,
                    { data: filteredData },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then((response) => {
                        if (response.status === 200) {
                            if (showTripList) {
                                handleClose();
                                getAllTrips(1);
                                window.location.reload();
                            } else {
                                handleClose();
                                setCurrentFile(fileName);
                                setpage(0);
                            }
                        }
                    })

            };
            reader.readAsText(file);
        }
    }

    //SELECT CSV FILE
    const handleFileChange = async (event) => {
        const checkfilename = await axios.get(`${process.env.REACT_APP_HOSTNAME}/api/v1/trips/checkfilename?filename=${event.target.files[0].name}&userId=${localstore._id}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        if (checkfilename.data.present) {
            setFilename(event.target.files[0].name)
            setFilePresentError(true);
            setSavedisable(false);
        } else {
            setFilePresentError(false);
            setFilename(event.target.files[0].name)
            setFile(event.target.files[0]);
            setSavedisable(true);
        }

    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} >
            <Modal.Header>
                <Modal.Title></Modal.Title>
                <Card className='w-100 d-flex align-items-center border-0'>
                    <Form.Control
                        className='w-75 mt-5'
                        type="text"
                        placeholder='Trip Name*'
                        value={fileName}
                    />
                    {FilePresentError && <p style={{ color: 'red' }}>File Name is already Present</p>}
                    <Card className='d-flex align-items-center border-primary w-75 mt-4'
                            onClick={() =>  document.getElementById('csvFileInput').click()}>
                        <input
                            id='csvFileInput'
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <img className='w-25'  src={UploadLogo} />
                        <Form.Label className='my-3 mx-4 text-info' >Upload the Excel sheet of your trip</Form.Label>
                    </Card>
                    <div className='d-flex w-75 mt-3'>
                        <Button variant="light" onClick={handleClose} className='my-2 mx-4 w-75 h-25 border-3 outline-secondary'>Cancel</Button>
                        <Button disabled={!savedisable} variant={savedisable ? "dark" : "secondary"} onClick={handleUpload} className='my-2 mx-4 w-75 h-25 border-3 outline-secondary'>Save</Button>
                    </div>
                </Card>
            </Modal.Header>
        </Modal>
    )
}

export default FileUpload;
