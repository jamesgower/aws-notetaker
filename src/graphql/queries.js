/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getNote = `query GetNote($id: ID!) {
  getNote(id: $id) {
    id
    title
    description
    owner
  }
}
`;
export const listNotes = `query ListNotes(
  $filter: ModelNoteFilterInput
  $limit: Int
  $nextToken: String
) {
  listNotes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      description
      owner
    }
    nextToken
  }
}
`;
