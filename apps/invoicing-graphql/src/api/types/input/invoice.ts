import { Field, InputType, Int } from 'type-graphql';

import { InvoiceDTO } from '@hindawi/shared';

@InputType()
export class InvoiceInput implements Partial<InvoiceDTO> {

    @Field()
    public status: string;

    // @Field(type => Int, {
    //     description: 'The foo of the invoice.',
    // })
    // public foo: number;

}
