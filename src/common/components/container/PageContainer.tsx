import styled from "styled-components";

export const PageContainer = styled.div`
  width: 100vw; /* Full viewport width */
  height: screen.height; /* Full viewport height */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem; /* Responsive padding */
  font-family: "IBM Plex Sans Thai", sans-serif;
  background-color: #f5f5f5;

  @media (max-width: 768px) {
    padding: 1.5rem; /* Adjust padding for smaller screens */
  }

  @media (max-width: 480px) {
    padding: 1rem; /* Even smaller padding for very small screens */
    flex-direction: column; /* Maintain column layout for small screens */
  }
`;
