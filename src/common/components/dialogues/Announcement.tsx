import styled from "styled-components";
import useAnnouncementContext from "../../contexts/AnnouncementContext";

function Announcement() {
  const { component } = useAnnouncementContext();
  return (
    <Container>
      <Content>{component}</Content>
    </Container>
  );
}

export default Announcement;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
`;

const Content = styled.div`
  background-color: white;
  border-radius: 10px;
  max-width: 600px;
  padding: 20px;
  overflow-y: auto;
  max-height: 80vh;
`;
