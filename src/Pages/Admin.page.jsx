import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

import SeatPicker from 'react-seat-picker';
import FirebaseService from '../Services/FirebaseService';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  galeria,
  central,
  lateralIrmas,
  lateralIrmaos,
} from '../Utils/estrutura';

import '../app.css';

function AdminPage(props) {
  const [loading, setLoading] = useState();
  const [data, setData] = useState();
  const [dataLateralMen, setDataLateralMen] = useState();
  const [dataLateralWomen, setDataLateralWomen] = useState();
  const [dataGaleria, setDataGaleria] = useState();

  const [arcGaleria, setArcGaleria] = useState();
  const [arcLateralIrmaos, setArcLateralIrmaos] = useState();
  const [arcLateralIrmas, setArcLateralIrmas] = useState();
  const [arcCentral, setArcCentral] = useState();

  const [displayChurch, setDisplay] = useState();
  const [show, setShow] = useState(false);
  const [isPorteiro, setPorteiro] = useState(false);
  const [reservedList, setList] = useState([]);
  const [selectedChurch, setSelectedChurch] = useState('vila-maria');

  const [clickedSeat, setClickedSeat] = useState();

  const [firebaseKey, setFirebaseKey] = useState();
  const [firebaseKeyLateralIrma, setFirebaseKeyLateralIrma] = useState();
  const [firebaseKeyLateralIrmao, setFirebaseKeyLateralIrmao] = useState();

  const handleClose = () => setShow(false);

  const rowsToNumber = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
  };

  const fetchSeats = async (display, church) => {
    setLoading(true);
    if (display?.lateral) {
      await FirebaseService.getDataList(
        `map/${church}/archetype/lateral/irmaos`,
        dataReceived => {
          setArcLateralIrmaos(dataReceived[0]);
        }
      );

      await FirebaseService.getDataList(
        `map/${church}/lateral/irmaos`,
        dataReceived => {
          setDataLateralMen(dataReceived?.[0]);
          setFirebaseKeyLateralIrmao(dataReceived?.[0]?.key);
        }
      );

      await FirebaseService.getDataList(
        `map/${church}/archetype/lateral/irmas`,
        dataReceived => {
          setArcLateralIrmaos(dataReceived?.[0]);
        }
      );

      await FirebaseService.getDataList(
        `map/${church}/lateral/irmas`,
        dataReceived => {
          setDataLateralWomen(dataReceived?.[0]);
          setFirebaseKeyLateralIrma(dataReceived?.[0]?.key);
        }
      );
    }

    if (display?.galeria) {
      await FirebaseService.getDataList(
        `map/${church}/galeria`,
        dataReceived => {
          setDataGaleria(dataReceived[0]);
        }
      );
    }

    await FirebaseService.getDataList(
      `map/${church}/central`,
      dataReceived => {
        setFirebaseKey(dataReceived?.[0]?.key);
        setData(dataReceived?.[0]);
      }
    );
    await FirebaseService.getDataList(
      `map/${church}/archetype/central`,
      dataReceived => {
        setArcCentral(dataReceived[0]);
      }
    );
    setLoading(false);
  };

  useEffect(() => {
    setSelectedChurch(props.match.params.igreja);
    FirebaseService.getDataList(`map/${props.match.params.igreja}/display`, dataReceived => {
      setDisplay(dataReceived[0]);
      fetchSeats(dataReceived[0], props.match.params.igreja);
      setPorteiro(window.location.pathname === '/porteiro');
    });
  }, []);

  const addSeatCallback = async ({ row, number, id }, addCb) => {
  };

  const removeSeatCallback = ({ row, number, id }, removeCb) => {
    removeCb(row, number);
  };

  const addData = () => {
    if (firebaseKey) {
      const arcWithoutKey = arcCentral;
      delete arcWithoutKey.key

      FirebaseService.updateData(
        `map/${selectedChurch}/central/${firebaseKey}`,
        arcWithoutKey
      );
    }

    if (firebaseKeyLateralIrmao) {
      const arcWithoutKey = arcLateralIrmaos;
      delete arcWithoutKey.key

      FirebaseService.updateData(
        `map/${selectedChurch}/lateral/irmaos/${firebaseKeyLateralIrmao}`,
        arcWithoutKey
      );
    }

    if (firebaseKeyLateralIrma) {
      const arcWithoutKey = arcLateralIrmaos;
      delete arcWithoutKey.key
      FirebaseService.updateData(
        `map/${selectedChurch}/lateral/irmas/${firebaseKeyLateralIrma}`,
        arcWithoutKey
      );
    }
  };

  const createArchetype = () => {
    if (central) {
      FirebaseService.pushData(`map/${selectedChurch}/archetype/central`, central);
      FirebaseService.pushData(`map/${selectedChurch}/central`, central);
    }

    if (lateralIrmaos) {
      FirebaseService.pushData(`map/${selectedChurch}/archetype/lateral/irmaos`, lateralIrmaos);
      FirebaseService.pushData(`map/${selectedChurch}/lateral/irmaos`, lateralIrmaos);
    }

    if (lateralIrmas) {
      FirebaseService.pushData(`map/${selectedChurch}/archetype/lateral/irmas`, lateralIrmas);
      FirebaseService.pushData(`map/${selectedChurch}/lateral/irmas`, lateralIrmas);
    }
  }

  const seatsAvailableSchedule = () => {
    FirebaseService.pushData(`map/${selectedChurch}/available-seats`, [3, 5, 6, 27, 29, 30, 31, 35, 36, 38]);
  }

  return (
    <div className="container" style={{ width: '100vw' }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="text-center text-capitalize">{selectedChurch?.replaceAll('-', ' ')}</h1>
          </div>

          {loading ? (
            <p>Carregando</p>
          ) : (
              <div className="church-map">
                <div
                  style={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    justifyContent: 'center',
                  }}
                >
                  {dataLateralMen && (
                    <SeatPicker
                      addSeatCallback={addSeatCallback}
                      removeSeatCallback={removeSeatCallback}
                      rows={dataLateralMen}
                      maxReservableSeats={1}
                      alpha
                      visible
                      selectedByDefault
                      loading={loading}
                    />
                  )}

                  <h2>Pulpito</h2>

                  {dataLateralWomen && (
                    <SeatPicker
                      addSeatCallback={addSeatCallback}
                      removeSeatCallback={removeSeatCallback}
                      rows={dataLateralWomen}
                      maxReservableSeats={1}
                      alpha
                      visible
                      selectedByDefault
                      loading={loading}
                    />
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    justifyContent: 'center',
                    marginTop: '40px',
                  }}
                >
                  {data && (
                    <>
                      <SeatPicker
                        addSeatCallback={addSeatCallback}
                        removeSeatCallback={removeSeatCallback}
                        rows={data}
                        maxReservableSeats={1}
                        alpha
                        visible
                        style={{ marginTop: '48px' }}
                        selectedByDefault
                        loading={loading}
                      />
                    </>
                  )}
                </div>
                {dataGaleria && (
                  <div>
                    <h3>Galeria</h3>
                    <SeatPicker
                      addSeatCallback={addSeatCallback}
                      removeSeatCallback={removeSeatCallback}
                      rows={dataGaleria}
                      maxReservableSeats={1}
                      alpha
                      visible
                      style={{ marginTop: '48px' }}
                      selectedByDefault
                      loading={loading}
                    />
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      <button className="btn btn-primary ml-2" onClick={addData}>
        Reset
      </button>

      <button className="btn btn-primary ml-2" onClick={createArchetype}>
        Create archetype
      </button>

      <button className="btn btn-primary ml-2" onClick={seatsAvailableSchedule}>
        Add seats to schedule
      </button>

    </div>
  );
}

export default AdminPage;
