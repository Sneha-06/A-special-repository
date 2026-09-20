export interface AcceptanceCriterion {
  id: string;
  dbId: string;
  given: string;
  when: string;
  then: string;
  requirementId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcceptanceCriterionInput {
  given: string;
  when: string;
  then: string;
  criteriaKey?: string;
}
