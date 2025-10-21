import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const CursoLista = ({ cursos, onEdit, onDelete }) => {
  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Lista de Cursos</h2>
      <Row>
        {cursos.map(curso => (
          <Col key={curso.id} md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{curso.nombre}</Card.Title>
                <Card.Text>
                  <strong>Duración:</strong> {curso.duracion}<br/>
                  <strong>Tipo:</strong> {curso.tipo}
                </Card.Text>
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="primary" 
                    onClick={() => onEdit(curso)}
                  >
                    Ver más detalles
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => onDelete(curso.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CursoLista;