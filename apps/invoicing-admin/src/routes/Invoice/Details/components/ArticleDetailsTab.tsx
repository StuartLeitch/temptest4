import React from 'react';
import { Card, CardBody, CardTitle } from '../../../../components';
import { DlRowArticleDetails } from '../../../components/Invoice/DlRowArticleDetails';
import { Invoice } from '../types';

const ArticleDetailsTab: React.FC<ArticleDetailsTabProps> = ({ invoice }) => (
  <Card body className='border-top-0'>
    <CardBody>
      <CardTitle tag='h6' className='mb-4'>
        Article: Details
        <span className='small ml-1 text-muted'>
          #{invoice?.invoiceItem?.article?.id}
        </span>
      </CardTitle>
      <DlRowArticleDetails
        {...invoice?.invoiceItem?.article}
        leftSideClassName='text-lg-right'
        rightSideClassName='text-inverse'
      />
    </CardBody>
  </Card>
)

interface ArticleDetailsTabProps {
  invoice: Invoice;
}

export default ArticleDetailsTab;
