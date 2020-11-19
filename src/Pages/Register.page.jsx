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

function RegisterPage(props) {
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
  const [availableSeats, setAvailableSeats] = useState();

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

  const seatsAvailables = [
    1,
    2,
    9,
    10,
    11,
    12,
    19,
    20,
    21,
    22,
    29,
    30,
    31,
    32,
    39,
    40,
    41,
    42,
    49,
    50,
    51,
    52,
    59,
    60,
    61,
    62,
    69,
    70,
    71,
    72,
    79,
    80,
  ];

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
          setDataGaleria(dataReceived?.[0]);
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
        setArcCentral(dataReceived?.[0]);
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
    FirebaseService.getDataList(`map/${props.match.params.igreja}/available-seats`, seats => {
      const availableSeatsSchedule = seats[0];
      delete availableSeatsSchedule.key;
      setAvailableSeats(availableSeatsSchedule)
      console.log(availableSeatsSchedule);
    });
  }, []);

  const addSeatCallback = async ({ row, number, id }, addCb) => {
    if (isPorteiro) {
      const rowToNumber = rowsToNumber[row];
      let seatConverted =
        Number(id) < 10 ? Number(id) - 1 : (Number(id) % 10) - 1;
      const orientation = Number(id) % 2 === 0 ? 'west' : 'east';
      seatConverted = seatConverted === -1 ? 9 : seatConverted;

      const dataToAdd = {
        row,
        number,
        id,
        orientation,
        isReserved: true,
        tooltip: '',
      };

      await FirebaseService.updateData(
        `map/${selectedChurch}/central/${firebaseKey}/${rowToNumber}/${seatConverted}`,
        dataToAdd
      );
      fetchSeats();
      setClickedSeat({});
      return;
    }
    if (selectedChurch !== 'vila-maria') {
      if (seatsAvailables.filter(elId => Number(id) === elId).length) {
        setClickedSeat({
          row,
          number,
          id,
        });
        setShow(true);
      } else {
        setClickedSeat({
          row,
          number,
          id,
        });
        setShow(true);
      }
    } else {
      setShow(true);
      setClickedSeat(null);
    }
  };

  const saveSeat = async () => {
    const rowToNumber = rowsToNumber[clickedSeat.row];
    let seatConverted =
      Number(clickedSeat.id) < 10
        ? Number(clickedSeat.id) - 1
        : (Number(clickedSeat.id) % 10) - 1;
    const orientation = Number(clickedSeat.id) % 2 === 0 ? 'west' : 'east';
    seatConverted = seatConverted === -1 ? 9 : seatConverted;

    const dataToAdd = {
      ...clickedSeat,
      orientation,
      isReserved: true,
      tooltip: clickedSeat.nome || '',
    };

    await FirebaseService.updateData(
      `map/${selectedChurch}/central/${firebaseKey}/${rowToNumber}/${seatConverted}`,
      dataToAdd
    );
    fetchSeats(displayChurch, selectedChurch);
    setClickedSeat({});
    handleClose();
  };

  const removeSeatCallback = ({ row, number, id }, removeCb) => {
    removeCb(row, number);
  };

  const addData = () => {
    if (!firebaseKey) {

      const arcWithoutKey = arcCentral;
      delete arcWithoutKey.key

      FirebaseService.updateData(
        `map/${selectedChurch}/central/${firebaseKey}`,
        arcWithoutKey
      );
    } else {
      FirebaseService.pushData(`map/${selectedChurch}/central`, central);
    }

    if (!firebaseKeyLateralIrmao) {
      const arcWithoutKey = arcLateralIrmaos;
      delete arcWithoutKey.key

      FirebaseService.updateData(
        `map/${selectedChurch}/lateral/irmaos/${firebaseKeyLateralIrmao}`,
        arcWithoutKey
      );
    } else {
      FirebaseService.pushData(`map/${selectedChurch}/archetype/lateral/irmaos`, lateralIrmaos);
    }

    if (!firebaseKeyLateralIrma) {
      const arcWithoutKey = arcLateralIrmaos;
      delete arcWithoutKey.key
      FirebaseService.updateData(
        `map/${selectedChurch}/lateral/irmas/${firebaseKeyLateralIrma}`,
        arcWithoutKey
      );
    } else {
      FirebaseService.pushData(`map/${selectedChurch}/archetype/lateral/irmas`, lateralIrmas);
    }
  };

  const printList = () => {
    setLoading(true);
    const reserved = [];
    data.map(col => {
      col.filter(seat => {
        if (seat.isReserved) {
          reserved.push(seat);
        }
      })
    })
    setList(reserved);
    setTimeout(() => {
      setLoading(false);
      window.print()
    }, 2000);
  }

  return (
    <div className="container" style={{ width: '100vw' }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="text-center text-capitalize">{selectedChurch?.replace('-', ' ')}</h1>
            {isPorteiro && <button className="btn btn-primary" onClick={printList}>Imprimir lista</button>}
          </div>
          {
            availableSeats && <p className="seats-available">
              Assentos disponíveis para agendamento prévios:
            <br />
              <b>SOMENTE: </b>
              {availableSeats.map(seat => ` - ${seat}`)}
            </p>
          }

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

      <button className="" onClick={addData}>
        Add
      </button>

      <Modal show={show} onHide={handleClose}>
        {clickedSeat ? (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                Reserva de lugar - nº {clickedSeat?.id}{' '}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Escreva seu nome"
                    onChange={e =>
                      setClickedSeat({ ...clickedSeat, nome: e.target.value })
                    }
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={saveSeat}>
                Agendar
              </Button>
            </Modal.Footer>
          </>
        ) : (
            <Modal.Title>
              <Modal.Header closeButton>
                <Modal.Title>Não disponível! </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>
                  O lugar selecionado não está disponível para agendamento on-line{' '}
                  <br />
                Este lugar está aberto para o dia do culto! Selecione outra
                opção.
              </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Fechar
              </Button>
              </Modal.Footer>
            </Modal.Title>
          )}
      </Modal>

      <div className="print-list d-none">
        <h2 className="text-center">Lugares reservados</h2>
        {reservedList?.map(el => (
          <p key={el?.id}>{el?.number} - {el?.nome}</p>
        ))}
      </div>
    </div>
  );
}

export default RegisterPage;
