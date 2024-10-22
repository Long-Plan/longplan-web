import styled from "styled-components";

export const MainContainer = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color),
    0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  padding: 0.5rem;
  width: 100%;
  overflow-y: auto;

  @media (min-width: 768px) {
    padding: 1rem;
  }
`;
