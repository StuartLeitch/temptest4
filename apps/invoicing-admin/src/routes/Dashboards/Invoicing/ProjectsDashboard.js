import React from 'react';
// import faker from 'faker/locale/en_US';
// import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Card,
  CardBody,
  CardDeck,
  CardTitle,
  CustomInput,
  Badge,
  Table,
  Button,
  // InputGroup,
  // InputGroupAddon,
  // Input,
  ListGroup,
  ListGroupItem,
  Media,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from './../../../components';
import { setupPage } from './../../../components/Layout/setupPage';

import { HeaderMain } from '../../components/HeaderMain';

// import { TasksMedia } from '../../components/ProjectsDashboards/TasksMedia';
import { TrTableInvoices } from '../../components/Financial/TrTableInvoices';
import { TinyDonutChart } from '../../components/ProjectsDashboards/TinyDonutChart';
import { TinyDonutChartBig } from '../../components/Financial/TinyDonutChartBig';
import { TinyDonutChartAllProjects } from '../../components/ProjectsDashboards/TinyDonutChartAllProjects';
import { StackedAreaChart } from '../../components/Financial/StackedAreaChart';
// import { TimelineMini } from '../../components/Timeline/TimelineMini';
// import { DraggableProjects } from './DraggableProjects';
import { TrTableRecentFundings } from '../../components/Financial/TrTableRecentFundings';
const ProjectsDashboard = () => (
  <Container>
    <Row className='mb-5'>
      <Col lg={12}>
        <HeaderMain title='Invoicing' className='mb-4 mb-lg-5' />
        <p>
          Some words about how great <strong>Phenom Invoicing</strong> is and
          what you'll see in here&hellip;
        </p>
      </Col>
      <Col lg={3}>
        <div className='hr-text hr-text-center my-2'>
          <span>Payments</span>
        </div>
        <Row>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='fa fa-circle text-primary mr-2'></i>
              Today
            </p>
            <h4 className='mt-2 mb-0'>$3,267</h4>
          </Col>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='fa fa-circle text-info mr-2'></i>
              This Month
            </p>
            <h4 className='mt-2 mb-0'>$8,091</h4>
          </Col>
        </Row>
        <div className='hr-text hr-text-center mb-2 mt-3'>
          <span>Invoices</span>
        </div>
        <Row className='mb-4 mb-xl-0'>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='fa fa-circle text-warning mr-2'></i>
              Due
            </p>
            <h4 className='mt-2 mb-0'>$4,007</h4>
          </Col>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='fa fa-circle text-danger mr-2'></i>
              Overdue
            </p>
            <h4 className='mt-2 mb-0'>$11,091</h4>
          </Col>
        </Row>
      </Col>
      <Col lg={3} md={6}>
        <div className='hr-text hr-text-left my-2'>
          <span>Dummy Title</span>
        </div>
        <Media>
          <Media left className='mr-3'>
            <TinyDonutChart />
          </Media>
          <Media body>
            <div>
              <i className='fa fa-circle mr-1 text-yellow'></i>
              <span className='text-inverse'>23</span> Pending
            </div>
            <div>
              <i className='fa fa-circle mr-1 text-danger'></i>
              <span className='text-inverse'>3</span> Behind
            </div>
            <div>
              <i className='fa fa-circle mr-1 text-success'></i>
              <span className='text-inverse'>34</span> Final
            </div>
          </Media>
        </Media>
      </Col>
      <Col lg={3} md={6} className='mb-4 mb-lg-0'>
        <div className='hr-text hr-text-left my-2'>
          <span>Another Title</span>
        </div>
        <Media>
          <Media left className='mr-3'>
            <TinyDonutChartAllProjects />
          </Media>
          <Media body>
            <div>
              <i className='fa fa-circle mr-1 text-warning'></i>
              <span className='text-inverse'>14</span> Draft
            </div>
            <div>
              <i className='fa fa-circle mr-1 text-primary'></i>
              <span className='text-inverse'>24</span> Active
            </div>
            <div>
              <i className='fa fa-circle mr-1 text-success'></i>
              <span className='text-inverse'>2</span> Final
            </div>
          </Media>
        </Media>
      </Col>
      <Col lg={3}>
        <div className='hr-text hr-text-left my-2'>
          <span>Statistics</span>
        </div>
        <Table size='sm'>
          <tbody>
            <tr>
              <td className='text-inverse bt-0'>Active Invoices</td>
              <td className='text-right bt-0'>
                <Badge color='success' pill>
                  16
                </Badge>
              </td>
            </tr>
            <tr>
              <td className='text-inverse'>Invoice Items</td>
              <td className='text-right'>
                <Badge color='primary' pill>
                  34
                </Badge>
              </td>
            </tr>
            <tr>
              <td className='text-inverse'>Support Tickets</td>
              <td className='text-right'>
                <Badge color='info' pill>
                  5
                </Badge>
              </td>
            </tr>
            <tr>
              <td className='text-inverse'>Active Transactions</td>
              <td className='text-right'>
                <Badge color='secondary' pill>
                  0
                </Badge>
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>
    </Row>
    <Row>
      <Col lg={12}>
        <div className='hr-text hr-text-center mt-4 mb-4'>
          <span>Your Cash</span>
        </div>
      </Col>
      <Col lg={3}>
        <Card className='mb-3'>
          <CardBody>
            <CardTitle tag='h6' className='mb-4'>
              Main Fundings
            </CardTitle>
            <div>
              <div className='mb-3'>
                <h2>$ 188.00</h2>
              </div>
              <div>
                <i className='fas fa-caret-down fa-fw text-danger'></i> $464.00
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col lg={3}>
        <Card className='mb-3'>
          <CardBody>
            <CardTitle tag='h6' className='mb-4'>
              Invoices
            </CardTitle>
            <div>
              <div className='mb-3'>
                <h2>$ 553.00</h2>
              </div>
              <div>
                <i className='fas fa-caret-down fa-fw text-danger'></i> $994.00
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col lg={3}>
        <Card className='mb-3'>
          <CardBody>
            <CardTitle tag='h6' className='mb-4'>
              Accounts Receivable
            </CardTitle>
            <div>
              <div className='mb-3'>
                <h2>$ 451.00</h2>
              </div>
              <div>
                <i className='fas fa-caret-up fa-fw text-success'></i> $938.00
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col lg={3}>
        <Card className='mb-3'>
          <CardBody>
            <CardTitle tag='h6' className='mb-4'>
              Accounts Receivable
            </CardTitle>
            <div>
              <div className='mb-3'>
                <h2>$ 194.00</h2>
              </div>
              <div>
                <i className='fas fa-caret-up fa-fw text-success'></i> $519.00
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col lg={12}>
        <Card className='mb-3'>
          <CardBody>
            <CardTitle className='mb-1 d-flex'>
              <h6>Invoices</h6>
              <Button color='link' size='sm' className='pt-0 ml-auto'>
                View All <i className='fas fa-angle-right'></i>
              </Button>
            </CardTitle>
          </CardBody>
          <Table responsive striped className='mb-0'>
            <thead>
              <tr>
                <th className='bt-0'>Company</th>
                <th className='bt-0'>Amount</th>
                <th className='bt-0'>Date</th>
                <th className='bt-0'>Contact</th>
                <th className='bt-0'>Email</th>
                <th className='bt-0 text-right'>Action</th>
              </tr>
            </thead>
            <tbody>
              <TrTableInvoices />
            </tbody>
          </Table>
        </Card>
      </Col>
      <Col lg={8}>
        <Card className='mb-3'>
          <CardBody>
            <CardTitle className='mb-4 d-flex'>
              <h6>Account Performance</h6>
            </CardTitle>
            <div className='d-flex justify-content-center'>
              <StackedAreaChart />
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col lg={4}>
        <Card className='mb-3'>
          <CardBody>
            <CardTitle className='mb-1'>
              <h6 className='mb-0'>Settings</h6>
            </CardTitle>
          </CardBody>
          <ListGroup flush>
            <ListGroupItem className='d-flex'>
              <span>My Cash</span>
              <CustomInput
                type='switch'
                id='exampleCustomSwitch'
                name='customSwitch'
                label=''
                className='ml-auto'
              />
            </ListGroupItem>
            <ListGroupItem className='d-flex'>
              <span>My Cap</span>
              <CustomInput
                type='switch'
                id='exampleCustomSwitch1'
                name='customSwitch'
                label=''
                className='ml-auto'
                defaultChecked
              />
            </ListGroupItem>
            <ListGroupItem className='d-flex'>
              <span>Client List</span>
              <CustomInput
                type='switch'
                id='exampleCustomSwitch2'
                name='customSwitch'
                label=''
                className='ml-auto'
                defaultChecked
              />
            </ListGroupItem>
            <ListGroupItem className='d-flex'>
              <span>Recent Fundings</span>
              <CustomInput
                type='switch'
                id='exampleCustomSwitch3'
                name='customSwitch'
                label=''
                className='ml-auto'
              />
            </ListGroupItem>
            <ListGroupItem className='d-flex'>
              <span>Invoice Creator</span>
              <CustomInput
                type='switch'
                id='exampleCustomSwitch4'
                name='customSwitch'
                label=''
                className='ml-auto'
              />
            </ListGroupItem>
            <ListGroupItem className='d-flex'>
              <span>Sales Lead</span>
              <CustomInput
                type='switch'
                id='exampleCustomSwitch5'
                name='customSwitch'
                label=''
                className='ml-auto'
                defaultChecked
              />
            </ListGroupItem>
            <ListGroupItem className='d-flex'>
              <span>Q&A</span>
              <CustomInput
                type='switch'
                id='exampleCustomSwitch6'
                name='customSwitch'
                label=''
                className='ml-auto'
                defaultChecked
              />
            </ListGroupItem>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default setupPage({
  pageTitle: 'Invoicing Dashboard'
})(ProjectsDashboard);
