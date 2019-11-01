import { Field, ID, Int, ObjectType } from 'type-graphql';

@ObjectType({
    description: 'Invoice object.',
})
export class InvoiceType {

    @Field(type => ID)
    public id: string;

    @Field({
        description: 'The status of the invoice.',
    })
    public status: string;
}
