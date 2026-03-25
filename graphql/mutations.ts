import { gql } from '@apollo/client';

export const INSERT_INTERN = gql`
  mutation InsertIntern($object: interns_insert_input!) {
    insert_interns_one(object: $object) {
      id
      name
      email
    }
  }
`;

export const UPDATE_INTERN = gql`
  mutation UpdateIntern($id: uuid!, $set: interns_set_input!) {
    update_interns_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      name
      email
      status
    }
  }
`;

export const DELETE_INTERN = gql`
  mutation DeleteIntern($id: uuid!) {
    delete_interns_by_pk(id: $id) {
      id
      name
    }
  }
`;
