import React from 'react';
import { Card, CardBody, CardTitle } from '../../../../components';
import {DlRowErpReferences} from '../../../components/Invoice/DlRowErpReferences'
import {Invoice} from '../types'

const ErpReferenceTab: React.FC<ErpReferenceTabProps> = ({invoice}) => (
    <Card body className='boreder-top-0'>
        <CardBody>
            <CardTitle tag='h5' className='mb-4'>
                ERP References
            </CardTitle>
            <DlRowErpReferences { ...invoice?.erpReferences} leftSideClassName='text-lg-right' rightSideClassName='text-inverse'/>
        </CardBody>
    </Card>
)

interface ErpReferenceTabProps {
    invoice: Invoice
}

export default ErpReferenceTab