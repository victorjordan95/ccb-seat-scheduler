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
  const [clickedLocale, setClickedLocale] = useState();
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
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    X: 22,
    Y: 23,
    Z: 24
  };

  const fetchSeats = async (display, church) => {
    setLoading(true);
    if (display?.lateral) {
      await FirebaseService.getDataList(
        `map/${church}/archetype/lateral/irmaos`,
        dataReceived => {
          setArcLateralIrmaos(dataReceived?.[0]);
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
      setPorteiro(window.location.pathname.includes('/porteiro'));
    });
    FirebaseService.getDataList(`map/${props.match.params.igreja}/available-seats`, seats => {
      if (seats.length > 0) {
        const availableSeatsSchedule = seats[0];
        delete availableSeatsSchedule.key;
        setAvailableSeats(availableSeatsSchedule)
      }
    });
  }, []);

  const addSeatCallback = async ({ row, number, id }, addCb, locale) => {
    let firebaseKeyToSave;
    let indexToUpdate;
    switch (locale) {
      case 'lateral/irmaos':
        firebaseKeyToSave = firebaseKeyLateralIrmao;
        indexToUpdate = dataLateralMen[rowsToNumber[row]].findIndex(el => el.id === id);
        break;
      case 'lateral/irmas':
        firebaseKeyToSave = firebaseKeyLateralIrma;
        indexToUpdate = dataLateralWomen[rowsToNumber[row]].findIndex(el => el.id === id);
        break;
      default:
        firebaseKeyToSave = firebaseKey;
        indexToUpdate = data[rowsToNumber[row]].findIndex(el => el.id === id);
        break;
    }

    if (isPorteiro) {
      const rowToNumber = rowsToNumber[row];
      const orientation = Number(id) % 2 === 0 ? 'west' : 'east';

      const dataToAdd = {
        row,
        number,
        id,
        orientation,
        isReserved: true,
      };

      await FirebaseService.updateData(
        `map/${selectedChurch}/${locale}/${firebaseKeyToSave}/${rowToNumber}/${indexToUpdate}`,
        dataToAdd
      );
      fetchSeats(displayChurch, selectedChurch);
      setClickedSeat({});
      return;
    }

    if (!availableSeats.filter(elId => Number(id) === elId).length) {
      setClickedSeat({
        row,
        number,
        id,
      });

      setClickedLocale({ firebaseKeyToSave, locale, indexToUpdate })
      setShow(true);
    } else {
      setShow(true);
      setClickedSeat(null);
    }
  };

  const saveSeat = async () => {
    const rowToNumber = rowsToNumber[clickedSeat.row];
    const orientation = Number(clickedSeat.id) % 2 === 0 ? 'west' : 'east';

    const dataToAdd = {
      ...clickedSeat,
      orientation,
      isReserved: true,
      tooltip: clickedSeat.nome || '',
    };

    await FirebaseService.updateData(
      `map/${selectedChurch}/${clickedLocale.locale}/${clickedLocale.firebaseKeyToSave}/${rowToNumber}/${clickedLocale.indexToUpdate}`,
      dataToAdd
    );
    fetchSeats(displayChurch, selectedChurch);
    setClickedSeat({});
    handleClose();
  };

  const removeSeatCallback = ({ row, number, id }, removeCb) => {
    removeCb(row, number);
  };

  const printList = () => {
    setLoading(true);
    const reserved = [];
    data.map(col => {
      col.filter(seat => {
        if (seat.isReserved && seat.nome) {
          reserved.push(seat);
        }
      })
    })
    dataLateralMen.map(col => {
      col.filter(seat => {
        if (seat.isReserved && seat.nome) {
          reserved.push(seat);
        }
      })
    })
    dataLateralWomen.map(col => {
      col.filter(seat => {
        if (seat.isReserved && seat.nome) {
          reserved.push(seat);
        }
      })
    })
    console.log(reserved)
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
            <h1 className="text-center text-capitalize">{selectedChurch?.replaceAll('-', ' ')}</h1>
            {isPorteiro && <button className="btn btn-primary" onClick={printList}>Imprimir lista</button>}
          </div>
          {
            availableSeats && <p className="seats-available">
              Assentos bloqueados para agendamento:
            <br />
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
                      addSeatCallback={(seat, cb) => addSeatCallback(seat, cb, 'lateral/irmaos')}
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
                      addSeatCallback={(seat, cb) => addSeatCallback(seat, cb, 'lateral/irmas')}
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
                        addSeatCallback={(seat, cb) => addSeatCallback(seat, cb, 'central')}
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
