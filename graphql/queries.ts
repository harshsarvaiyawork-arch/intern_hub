import { gql } from '@apollo/client';

export const GET_INTERNS = gql`
  query GetInterns(
    $where:    interns_bool_exp
    $order_by: [interns_order_by!]
    $limit:    Int
    $offset:   Int
  ) {
    interns(
      where:    $where
      order_by: $order_by
      limit:    $limit
      offset:   $offset
    ) {
      id
      name
      email
      phone
      college
      status
      start_date
      end_date
      user_id
      created_at
      department {
        id
        name
      }
    }
    interns_aggregate(where: $where) {
      aggregate { count }
    }
  }
`;

export const GET_INTERN_BY_ID = gql`
  query GetInternById($id: uuid!) {
    interns_by_pk(id: $id) {
      id
      name
      email
      phone
      college
      status
      start_date
      end_date
      user_id
      created_at
      department {
        id
        name
      }
    }
  }
`;

export const GET_DEPARTMENTS = gql`
  query GetDepartments {
    departments(order_by: { name: asc }) {
      id
      name
    }
  }
`;

export const GET_COLLEGES = gql`
  query GetColleges {
    interns(distinct_on: college, order_by: { college: asc }) {
      college
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    total:      interns_aggregate                                         { aggregate { count } }
    active:     interns_aggregate(where: { status: { _eq: "active"     } }) { aggregate { count } }
    completed:  interns_aggregate(where: { status: { _eq: "completed"  } }) { aggregate { count } }
    terminated: interns_aggregate(where: { status: { _eq: "terminated" } }) { aggregate { count } }
    dept_count: departments_aggregate                                     { aggregate { count } }
  }
`;
