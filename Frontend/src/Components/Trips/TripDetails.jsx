import React, { useEffect, useRef, useState } from 'react';
import Header from '../Common/Header';
import { Button, Card, Table } from 'react-bootstrap';
import Back from '../../assets/back.png';
import './TripDetails.css';
import Distance from '../../assets/Distance.png';
import MapIcon from '../../assets/MapIcon.png';
import Idling from '../../assets/Idling.png';
import mark1 from '../../assets/mark1.png';
import Duration from '../../assets/Duration.png';
import Overspeed from '../../assets/Overspeed.png';
import OverspeedDistance from '../../assets/OverspeedDistance.png';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import StoppedDuration from '../../assets/StoppedDuration.png';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import axios from 'axios';
import FileUpload from '../Common/FileUpload';
import ReactPaginate from 'react-paginate';

function TripDetails() {
    const location = useLocation();
    const { tripsFilter, fileName } = location.state;
    const [tripMapDetails, setTripMapDetails] = useState([]);
    const [polylinesOverspeed, setPolylinesOverspeed] = useState([]);
    const [polylines, setNormalPolylines] = useState([]);
    const [currentFile, setCurrentFile] = useState('');
    const [currentPosition, setCurrentPosition] = useState([]);
    const [showTripsintab, setshowTripsintab] = useState([]);
    const [distTime, setDistTime] = useState({});
    let localstore = JSON.parse(localStorage.getItem('Authorization Details'));
    const handleShow = () => setShow(true);
    const [allTripsDetailsResults, setAllTripsDetailsResults] = useState({});
    const [finalReports, setFinalReports] = useState([]);
    const [show, setShow] = useState(false);
    const [totalTripsInFile, setTotaltripsinfile] = useState(0);

    // MAP DATA
    function tripMapShow(tripsDetailsResults) {
        const stopped = tripsDetailsResults.data.filter((e) => e.stopped == true);
        const idling = tripsDetailsResults.data.filter((e) => e.idling == true);
        const polylinesOverspeedResults = tripsDetailsResults.data.filter(item => item.overSpeed === true);
        const polylinesExactRemoveOverspeed = tripsDetailsResults.data.filter(item => item.overSpeed === false);
        const polylinesExact = polylinesExactRemoveOverspeed.map((e) => [e.latitude, e.longitude]);
        polylinesOverspeedResults.sort((a, b) => {
            return a.timestamp - b.timestamp;
        });
        const polylinesOverspeed = polylinesOverspeedResults.map((e) => [e.latitude, e.longitude]);
        setTripMapDetails(
            [tripsDetailsResults.data[0], tripsDetailsResults.data[tripsDetailsResults.data.length - 1], ...stopped, ...idling]
        );
        setPolylinesOverspeed(polylinesOverspeed);
        setNormalPolylines(polylinesExact);
    }

    //TRIP DETAILS
    const fetchFullTripDetails = async (tripsDetailsResults) => {
        const allTripsDetailsResponse = await axios.post(`${process.env.REACT_APP_HOSTNAME}/api/v1/trips/fulldetails`, { data: tripsDetailsResults.data }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        setAllTripsDetailsResults(allTripsDetailsResponse.data)
    };

    //ALL TRIPS OF USER
    const fetchTripListofUser = async () => {
        try {
            let tripsDetailsResults = await axios.get(`${process.env.REACT_APP_HOSTNAME}/api/v1/user/alltrips/${localstore._id}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setshowTripsintab(tripsDetailsResults.data.trips)
        } catch (error) {
            console.log(error)
        }
    }

    //REPORT DETAILS
    const fetchReportDetails = async (page) => {
        try {
            let tripsReportResults = await axios.post(`${process.env.REACT_APP_HOSTNAME}/api/v1/trips/reports`, { userId: localstore._id, fileName: currentFile ? currentFile : fileName, page: page }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            setFinalReports(tripsReportResults.data.response.finaloutputs);
            setDistTime(tripsReportResults.data.response.setDistTime);
            setTotaltripsinfile(tripsReportResults.data.totaltrips)
        } catch (error) {
            console.log(error);
        }
    }

    const fetchAllTripsDetailsdata = async (fileName) => {
        try {
            let tripsDetailsResults = await axios.post(`${process.env.REACT_APP_HOSTNAME}/api/v1/trips/alldetails`, { userId: localstore._id, fileName: currentFile ? currentFile : fileName }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // MAP DATA
            tripMapShow(tripsDetailsResults);
            setCurrentPosition([tripsDetailsResults.data[0].latitude, tripsDetailsResults.data[0].longitude]);

            //TRIP DETAILS
            await fetchFullTripDetails(tripsDetailsResults);

            //ALL TRIPS OF USER
            await fetchTripListofUser();

            //REPORT DETAILS
            if (currentFile != '') {
                fetchReportDetails(1);
            }
        } catch (error) {
            console.log(error)
        }

    }

    const showReportDetails = (event, newvalue) => {
        setCurrentFile(showTripsintab[newvalue])
    }

    useEffect(() => {
        setCurrentFile(tripsFilter[0].tripname);
    }, [tripsFilter]);
    useEffect(() => {
        fetchAllTripsDetailsdata(tripsFilter[0].tripname)
    }, [currentFile]);

    //CHANGE PAGE
    const handlePageClick = (event) => {
        setFinalReports([]);
        fetchReportDetails(event.selected + 1)
    };

    //HANDLE BACK
    const handleBack = () => {
        window.location.href = '/triplist';
    }

    const customIcon = (e) => {
        if (e.stopped) {
            return new Icon({
                iconUrl: mark1,
                iconSize: [20, 20]
            });
        } else if (e.idling) {
            return new Icon({
                iconUrl: Idling,
                iconSize: [20, 20]
            });
        } else {
            return new Icon({
                iconUrl: MapIcon,
                iconSize: [25, 25]
            });
        }
    }

    return (
        <div>
            <Header />
            <div className='d-flex justify-content-center mt-4'>
                <div className='w-75'>
                    <img className='back' onClick={handleBack} src={Back} />
                    <Card className='d-flex flex-row justify-content-between'>
                        <h3 className='mt-3 mr-2 my-2 mx-2 welcometext'>
                            {currentFile}
                        </h3>
                        <Button variant="secondary" onClick={handleShow} className='my-2 mx-4'>New</Button>
                    </Card>
                    <div className='d-flex mt-4'>
                        <div className='d-flex mr-4'>
                            <div className='stopped' style={{ backgroundColor: "#0038FF" }}></div>
                            <h4>Stopped</h4>
                        </div>
                        <div className='d-flex mr-4'>
                            <div className='stopped' style={{ backgroundColor: "#FF00B8" }}></div>
                            <h4>Idle</h4>
                        </div>
                        <div className='d-flex mr-4 '>
                            <div className='stopped' style={{ backgroundColor: "#00FFD1" }}></div>
                            <h4>Over speeding</h4>
                        </div>
                    </div>
                    <Card>
                        {currentPosition.length && <MapContainer
                            style={{
                                height: "70vh"
                            }}
                            center={currentPosition}
                            zoom={17}

                        >
                            <TileLayer
                                attribution="Google Maps"
                                url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                            />

                            <Polyline pathOptions={{ color: '#00B2FF' }} positions={polylines} />
                            <Polyline pathOptions={{ color: '#00FFD1' }} positions={polylinesOverspeed} />

                            {tripMapDetails.map((e) => (
                                <Marker icon={customIcon(e)} position={[e.latitude, e.longitude]}>
                                    <Popup>
                                        {e.idling ? `Idle for ${e.durationForIdling}` : e.stopped ? `Stopped for ${e.durationForStopped}` : e.display_name}
                                    </Popup>

                                </Marker>
                            ))}

                        </MapContainer>
                        }
                    </Card>
                    <Card className='mt-5'>
                        <Tabs
                            value={showTripsintab.findIndex((element) => element === currentFile)}
                            onChange={showReportDetails}
                            variant="scrollable"
                            scrollButtons
                            aria-label="visible arrows tabs example"
                            sx={{
                                [`& .${tabsClasses.scrollButtons}`]: {
                                    '&.Mui-disabled': { opacity: 0.3 },
                                },
                            }}
                        >
                            {showTripsintab?.length ? showTripsintab.map((e) => (

                                <Tab label={e} />

                            )) : ''}
                        </Tabs>
                    </Card>
                    <div className='d-flex justify-content-between'>
                        <div className='details'>
                            <img className='mx-2 my-2' src={Distance} />
                            <div className='d-flex flex-column align-items-center'>
                                <h5>{allTripsDetailsResults?.totalDistance?.toFixed(2)} KM</h5>
                                <p className='px-2'>Total Distanced Travelled</p>
                            </div>
                        </div>
                        <div className='details'>
                            <img className='mx-2 my-2' src={Duration} />
                            <div className='d-flex flex-column align-items-center'>
                                <h5>{allTripsDetailsResults?.totalDuration?.hours > 0 ? `${allTripsDetailsResults?.totalDuration?.hours} Hr` : ''} {allTripsDetailsResults?.totalDuration?.minutes > 0 ? `${allTripsDetailsResults?.totalDuration?.minutes} Mins` : ''} {allTripsDetailsResults?.totalDuration?.seconds} sec</h5>
                                <p className='px-2'>Total Travelled Duration</p>
                            </div>
                        </div>
                        <div className='details'>
                            <img className='mx-2 my-2' src={Overspeed} />
                            <div className='d-flex flex-column align-items-center'>
                                <h5>{allTripsDetailsResults?.overSpeedingDuration?.hours > 0 ? `${allTripsDetailsResults?.overSpeedingDuration?.hours} Hr` : ''} {allTripsDetailsResults?.overSpeedingDuration?.minutes > 0 ? `${allTripsDetailsResults?.overSpeedingDuration?.minutes} Mins` : ''} {allTripsDetailsResults?.overSpeedingDuration?.seconds} sec</h5>
                                <p className='px-2'>Over Speeding Duration</p>
                            </div></div>
                        <div className='details'>
                            <img className='mx-2 my-2' src={OverspeedDistance} />
                            <div className='d-flex flex-column align-items-center'>
                                <h5>{allTripsDetailsResults?.overSpeedingDistance?.toFixed(1)} KM</h5>
                                <p className='px-2'>Over Speeding Distance</p>
                            </div></div>
                        <div className='details'>
                            <img className='mx-2 my-2' src={StoppedDuration} />
                            <div className='d-flex flex-column align-items-center'>
                                <h5>{allTripsDetailsResults?.stoppedDuration?.hours > 0 ? `${allTripsDetailsResults?.stoppedDuration?.hours} Hr` : ''} {allTripsDetailsResults?.stoppedDuration?.minutes > 0 ? `${allTripsDetailsResults?.stoppedDuration?.minutes} Mins` : ''} {allTripsDetailsResults?.stoppedDuration?.seconds} sec</h5>
                                <p className='px-2'>Stopped Duration</p>
                            </div>
                        </div>
                    </div>
                    <div className='d-flex mt-5'>
                        <Table className='w-100' responsive >
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Point</th>
                                    <th>Ignition</th>
                                    <th>Speed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finalReports.map((e) => (
                                    <tr>
                                        <td>{e.time}</td>
                                        <td>{e.points}</td>
                                        <td style={{ color: e.ignition === "on" ? "green" : 'red' }}>{e.ignition}</td>
                                        <td>{e.speed === Infinity ? 1 : e.speed} KM/H</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <div className='allDuration pt-5 px-3'>
                            <p>Travel Duration
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {distTime.totalDuration}
                            </p>
                            <p>Stopped from
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {distTime.stoppedtimeduratime}
                            </p>
                            <p>Distance
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {distTime?.totalDistance?.toFixed(2)} km
                            </p>
                            <p>Overspeeding Duration
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                {distTime.overspeedtimeduration}
                            </p>
                        </div>

                    </div>
                    <ReactPaginate
                        nextLabel="Next >"
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={1}
                        marginPagesDisplayed={1}
                        pageCount={Math.ceil(totalTripsInFile / 10)}
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
                        className='d-flex justify-content-center'
                    />
                </div>
            </div >
            <FileUpload
                show={show}
                setShow={setShow}
                showtriplist={false}
                setCurrentFile={setCurrentFile}
            />
        </div >
    )
}

export default TripDetails;