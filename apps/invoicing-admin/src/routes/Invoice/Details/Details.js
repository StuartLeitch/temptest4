import React from 'react';
import DatePicker, { setDefaultLocale } from 'react-datepicker';
import format from 'date-fns/format';
import subWeeks from 'date-fns/subWeeks';

import {
  Accordion,
  Badge,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  CardGroup,
  CardText,
  CardTitle,
  Col,
  CardHeader,
  CardFooter,
  Container,
  CustomInput,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  FormFeedback,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  FormText,
  Nav,
  NavItem,
  Table,
  TabPane,
  UncontrolledButtonDropdown,
  UncontrolledTabs
} from './../../../components';
import { HeaderMain } from '../../components/HeaderMain';
import { HeaderDemo } from '../../components/HeaderDemo';
import { ButtonInput } from '../../Forms/DatePicker/components/ButtonInput';
import { TimelineMini } from '../../components/Timeline/TimelineMini';
// import { CardTextDemo } from '../../components/CardTextDemo';
import { TimelineDefault } from '../../components/Timeline/TimelineDefault';
import { DlRowContacts } from '../../components/Profile/DlRowContacts';
import { DlRowAddress } from '../../components/Profile/DlRowAddress';
import { TrTableMessages } from '../../Apps/ProfileDetails/components/TrTableMessages';
import { DlRowArticleDetails } from '../../components/Invoice/DlRowArticleDetails';

const Details = () => (
  <React.Fragment>
    <Container fluid={true}>
      <HeaderMain title='Invoice #000' className='mb-5 mt-4' />
      {/* START Header 1 */}
      <Row>
        <Col lg={12}>
          <div className='d-flex mb-3'>
            {/* <CardTitle tag='h6'>Button Right Toolbar</CardTitle> */}
            <ButtonToolbar className='ml-auto'>
              <UncontrolledButtonDropdown className='mr-3'>
                <DropdownToggle
                  color='link'
                  className='p-0 text-decoration-none'
                >
                  <i className='fas fa-circle text-success mr-2'></i>
                  Active
                  <i className='fas fa-angle-down ml-2' />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem header>Select Status</DropdownItem>
                  {/* <DropdownItem>
                    <i className='fas fa-circle text-danger mr-2'></i>
                    Big
                  </DropdownItem> */}
                  <DropdownItem>
                    <i className='fas fa-circle text-warning mr-2'></i>
                    Draft
                  </DropdownItem>
                  <DropdownItem>
                    <i className='fas fa-circle text-primary mr-2'></i>
                    Active
                  </DropdownItem>
                  <DropdownItem active>
                    <i className='fas fa-circle text-success mr-2'></i>
                    Final
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledButtonDropdown>
              <Button color='primary' className='mr-2'>
                Add Payment
              </Button>
              <Button color='secondary' className='mr-2' outline>
                Split Payment
              </Button>
              <Button color='primary' outline>
                Apply Coupon
              </Button>
            </ButtonToolbar>
          </div>
        </Col>
      </Row>
      {/* <Row>
        <Col lg={12}>
          <HeaderDemo
            no={1}
            title='Invoice Details'
            subTitle='Basic button layout options'
          />
        </Col>
      </Row> */}
      <Row>
        <Col lg={8}>
          <UncontrolledTabs initialActiveTabId='invoice'>
            {/* START Pills Nav */}
            <Nav pills className='mb-4 flex-column flex-md-row mt-4 mt-lg-0'>
              <NavItem>
                <UncontrolledTabs.NavLink tabId='invoice'>
                  Invoice Details
                </UncontrolledTabs.NavLink>
              </NavItem>
              <NavItem>
                <UncontrolledTabs.NavLink tabId='article'>
                  Article Details
                </UncontrolledTabs.NavLink>
              </NavItem>
            </Nav>
            {/* END Pills Nav */}
            <UncontrolledTabs.TabContent>
              <TabPane tabId='invoice'>
                <Card body>
                  <CardBody>
                    <CardTitle tag='h6' className='mb-4'>
                      Invoice: Details
                      <span className='small ml-1 text-muted'>#01</span>
                    </CardTitle>
                    {/* START Form */}
                    <Form>
                      {/* START Input */}
                      <FormGroup row>
                        <Label sm={3}>Invoice Issue Date</Label>
                        <DatePicker
                          customInput={<ButtonInput />}
                          selected={Date.now()}
                          onChange={() => {}}
                        />
                      </FormGroup>
                      {/* END Input */}
                      <FormGroup row>
                        <Label sm={3}>Date of Supply</Label>
                        <DatePicker
                          readOnly
                          customInput={<ButtonInput />}
                          selected={Date.now()}
                        />
                      </FormGroup>
                      <FormGroup row>
                        <Label for='staticText' sm={3}>
                          Reference Number
                        </Label>
                        <Col sm={9}>
                          <Input plaintext value='#REFERENCE_NUMBER#' />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Label for='staticText' sm={3}>
                          Terms
                        </Label>
                        <Col sm={9}>
                          <Input plaintext value='Payable upon Receipt' />
                        </Col>
                      </FormGroup>
                    </Form>
                    {/* END Form */}

                    <CardTitle tag='h6' className='mt-5 mb-4'>
                      Invoice: Charges
                      <span className='small ml-1 text-muted'>#02</span>
                    </CardTitle>
                    {/* END Form */}
                  </CardBody>
                </Card>
              </TabPane>
              <TabPane tabId='article'>
                <Card body>
                  <div className='mb-2'>
                    <span className='small'>Article</span>
                  </div>
                  <DlRowArticleDetails
                    leftSideClassName='text-lg-right'
                    rightSideClassName='text-inverse'
                  />
                  {/* <div className='mt-4 mb-2'>
                    <span className='small'>Journal</span>
                  </div>
                  <DlRowAddress
                    leftSideClassName='text-lg-right'
                    rightSideClassName='text-inverse'
                  /> */}
                </Card>
              </TabPane>
            </UncontrolledTabs.TabContent>
          </UncontrolledTabs>
        </Col>
        <Col lg={4}>
          {/* START Card Widget */}
          <Card className='mb-3'>
            <CardBody>
              <CardTitle tag='h6'>Timeline</CardTitle>
              <TimelineMini
                icon='circle'
                badgeTitle='Draft'
                badgeColor='secondary'
                date={format(subWeeks(new Date(), 3), 'dd MMMM yyyy')}
                phrase={'Invoice enters DRAFT state.'}
              />
              <TimelineMini
                icon='times-circle'
                iconClassName='text-primary'
                badgeTitle='Active'
                badgeColor='primary'
                date={format(subWeeks(new Date(), 2), 'dd MMMM yyyy')}
                phrase={'Invoice enters ACTIVE state.'}
              />
              <TimelineMini
                icon='check-circle'
                iconClassName='text-success'
                badgeTitle='Paid'
                badgeColor='success'
                date={format(subWeeks(new Date(), 1), 'dd MMMM yyyy')}
                phrase={'Invoice enters FINAL state.'}
              />
            </CardBody>
          </Card>
          {/* END Card Widget */}
        </Col>
      </Row>
    </Container>
  </React.Fragment>
);

export default Details;
